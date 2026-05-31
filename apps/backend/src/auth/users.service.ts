import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db';
import { users, roles } from '../db/schema';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findAll() {
    return this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleName: roles.name,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id));
  }

  async create(dto: CreateUserDto) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [created] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return created;
  }

  async update(id: number, dto: UpdateUserDto) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updateData: Partial<typeof users.$inferInsert> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [updated] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updated;
  }

  async remove(id: number) {
    const [user] = await this.db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    await this.db.delete(users).where(eq(users.id, id));
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const [user] = await this.db
      .select({ id: users.id, password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password saat ini tidak cocok');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return { message: 'Password berhasil diubah' };
  }
}
