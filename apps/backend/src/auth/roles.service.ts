import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/db.module';
import type { DB } from '../db/db';
import { roles, rolePermissions, permissions, users } from '../db/schema';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  async findAll() {
    const rows = await this.db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        roleCreatedAt: roles.createdAt,
        permId: permissions.id,
        permCode: permissions.code,
        permName: permissions.name,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id));

    const map = new Map<number, {
      id: number;
      name: string;
      createdAt: Date;
      permissions: { id: number; code: string; name: string }[];
    }>();

    for (const row of rows) {
      if (!map.has(row.roleId)) {
        map.set(row.roleId, {
          id: row.roleId,
          name: row.roleName,
          createdAt: row.roleCreatedAt,
          permissions: [],
        });
      }
      if (row.permId !== null) {
        map.get(row.roleId)!.permissions.push({
          id: row.permId,
          code: row.permCode!,
          name: row.permName!,
        });
      }
    }

    return Array.from(map.values());
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, dto.name))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Nama role sudah dipakai');
    }

    const [created] = await this.db
      .insert(roles)
      .values({ name: dto.name })
      .returning({ id: roles.id, name: roles.name, createdAt: roles.createdAt });

    return { ...created, permissions: [] };
  }

  async update(id: number, dto: UpdateRoleDto) {
    const existing = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    const [updated] = await this.db
      .update(roles)
      .set({ name: dto.name })
      .where(eq(roles.id, id))
      .returning({ id: roles.id, name: roles.name, createdAt: roles.createdAt });

    return updated;
  }

  async assignPermissions(id: number, dto: AssignPermissionsDto) {
    const existing = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    await this.db.transaction(async (tx) => {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      if (dto.permissionIds.length > 0) {
        await tx.insert(rolePermissions).values(
          dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        );
      }
    });

    return this.findRoleWithPermissions(id);
  }

  async remove(id: number) {
    const [role] = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    const [usersCount] = await this.db
      .select({ value: count() })
      .from(users)
      .where(eq(users.roleId, id));
    if (usersCount.value > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData: { pengguna: usersCount.value },
      });
    }
    await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await this.db.delete(roles).where(eq(roles.id, id));
  }

  private async findRoleWithPermissions(id: number) {
    const rows = await this.db
      .select({
        roleId: roles.id,
        roleName: roles.name,
        roleCreatedAt: roles.createdAt,
        permId: permissions.id,
        permCode: permissions.code,
        permName: permissions.name,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(roles.id, id));

    if (rows.length === 0) return null;

    const perms = rows
      .filter((r) => r.permId !== null)
      .map((r) => ({ id: r.permId!, code: r.permCode!, name: r.permName! }));

    return {
      id: rows[0].roleId,
      name: rows[0].roleName,
      createdAt: rows[0].roleCreatedAt,
      permissions: perms,
    };
  }
}
