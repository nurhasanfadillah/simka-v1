import { Type } from 'class-transformer';
import { IsInt, IsPositive } from 'class-validator';

export class PreviewPromotionDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  fromClassId!: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  fromYearId!: number;
}
