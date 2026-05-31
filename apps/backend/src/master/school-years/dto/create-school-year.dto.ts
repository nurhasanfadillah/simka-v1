import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tahun ajaran wajib diisi' })
  @MaxLength(20)
  name!: string;

  @IsInt()
  @Min(2000)
  @Max(2099)
  startYear!: number;

  @IsInt()
  @Min(2000)
  @Max(2099)
  endYear!: number;
}
