import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSchoolUnitDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama unit sekolah wajib diisi' })
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode unit sekolah wajib diisi' })
  @MaxLength(10)
  @Transform(({ value }) => String(value).toUpperCase())
  code!: string;
}
