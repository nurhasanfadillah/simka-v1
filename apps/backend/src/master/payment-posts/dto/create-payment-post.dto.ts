import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value.toUpperCase())
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEnum(['bulanan', 'bebas'])
  type!: 'bulanan' | 'bebas';

  @IsString()
  @IsOptional()
  description?: string;
}
