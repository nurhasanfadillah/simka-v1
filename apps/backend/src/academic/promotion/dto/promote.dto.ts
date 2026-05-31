import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class PromoteItemDto {
  @IsInt()
  @IsPositive()
  studentId!: number;

  @IsEnum(['naik', 'tinggal', 'lulus', 'keluar', 'pindah'])
  action!: 'naik' | 'tinggal' | 'lulus' | 'keluar' | 'pindah';

  @IsOptional()
  @IsInt()
  @IsPositive()
  toClassId?: number;
}

export class PromoteDto {
  @IsInt()
  @IsPositive()
  fromYearId!: number;

  @IsInt()
  @IsPositive()
  toYearId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PromoteItemDto)
  items!: PromoteItemDto[];
}
