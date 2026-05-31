import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import { DRIZZLE } from '../../db/db.module';
import type { DB } from '../../db/db';
import { paymentPosts, paymentTemplates } from '../../db/schema';
import { CreatePaymentPostDto } from './dto/create-payment-post.dto';
import { UpdatePaymentPostDto } from './dto/update-payment-post.dto';

function isUniqueViolation(err: any): boolean {
  return (err?.code ?? err?.cause?.code) === '23505';
}

@Injectable()
export class PaymentPostsService {
  constructor(@Inject(DRIZZLE) private db: DB) {}

  findAll() {
    return this.db.select().from(paymentPosts).orderBy(asc(paymentPosts.name));
  }

  async findOne(id: number) {
    const [post] = await this.db
      .select()
      .from(paymentPosts)
      .where(eq(paymentPosts.id, id))
      .limit(1);
    if (!post) throw new NotFoundException('POS tidak ditemukan');
    return post;
  }

  async create(dto: CreatePaymentPostDto) {
    try {
      const [created] = await this.db
        .insert(paymentPosts)
        .values({
          code: dto.code,
          name: dto.name,
          type: dto.type,
          description: dto.description ?? null,
        })
        .returning();
      return created;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Kode POS sudah dipakai');
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdatePaymentPostDto) {
    await this.findOne(id);
    try {
      const [updated] = await this.db
        .update(paymentPosts)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(paymentPosts.id, id))
        .returning();
      return updated;
    } catch (err: any) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Kode POS sudah dipakai');
      }
      throw err;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    const [templatesCount] = await this.db
      .select({ value: count() })
      .from(paymentTemplates)
      .where(eq(paymentTemplates.paymentPostId, id));
    if (templatesCount.value > 0) {
      throw new ConflictException({
        message: 'Tidak dapat dihapus karena masih memiliki data terkait',
        relatedData: { template: templatesCount.value },
      });
    }
    await this.db.delete(paymentPosts).where(eq(paymentPosts.id, id));
  }
}
