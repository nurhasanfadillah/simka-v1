import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type { Redis } from 'ioredis';
import { DRIZZLE } from '../db/db.module';
import { REDIS_CLIENT } from '../redis/redis.provider';
import type { DB } from '../db/db';
import {
  users,
  roles,
  rolePermissions,
  permissions,
} from '../db/schema';

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 hari

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DB,
    @Inject(REDIS_CLIENT) private redis: Redis,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
        roleId: users.roleId,
        isActive: users.isActive,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }

  async login(user: Awaited<ReturnType<typeof this.validateUser>> & {}) {
    const payload = { sub: user!.id, email: user!.email, roleId: user!.roleId };
    const access_token = this.jwtService.sign(payload);

    const refresh_token = randomUUID();
    await this.redis.set(
      `refresh:${user!.id}`,
      refresh_token,
      'EX',
      REFRESH_TTL_SECONDS,
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.roleName,
      },
    };
  }

  async refreshToken(userId: number, refreshToken: string) {
    const stored = await this.redis.get(`refresh:${userId}`);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah expired');
    }

    const [user] = await this.db
      .select({ id: users.id, email: users.email, roleId: users.roleId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    return { access_token };
  }

  async logout(userId: number) {
    await this.redis.del(`refresh:${userId}`);
  }

  async getProfile(userId: number) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const perms = await this.db
      .select({ code: permissions.code, name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, user.roleId));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleName,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      permissions: perms.map((p) => p.code),
    };
  }
}
