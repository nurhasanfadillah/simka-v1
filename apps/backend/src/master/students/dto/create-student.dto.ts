import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @IsOptional()
  nisn?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsEnum(['L', 'P'])
  gender!: 'L' | 'P';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  birthPlace!: string;

  @IsDateString()
  birthDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  parentName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(['baru', 'pindahan', 'mengulang'])
  registrationStatus!: 'baru' | 'pindahan' | 'mengulang';

  @IsInt()
  @Min(2000)
  @Max(2099)
  entryYear!: number;
}
