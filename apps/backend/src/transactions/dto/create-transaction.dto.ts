import { IsInt, IsOptional, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionItemDto {
  @IsInt() @Min(1)
  billId!: number;

  @IsInt() @Min(1) @IsOptional()
  billMonthId?: number;

  @IsInt() @Min(1)
  amount!: number;
}

export class CreateTransactionDto {
  @IsInt() @Min(1)
  studentId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items!: CreateTransactionItemDto[];

  @IsString() @IsOptional()
  notes?: string;
}
