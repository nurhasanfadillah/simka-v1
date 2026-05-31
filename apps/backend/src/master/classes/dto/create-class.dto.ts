import { IsInt, IsNotEmpty, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateClassDto {
  @IsInt()
  @IsPositive()
  schoolUnitId!: number;

  @IsString()
  @IsNotEmpty({ message: 'Nama kelas wajib diisi' })
  @MaxLength(100)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  level!: number;
}
