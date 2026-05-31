import { IsInt, IsPositive } from 'class-validator';

export class EnrollStudentDto {
  @IsInt()
  @IsPositive()
  studentId!: number;

  @IsInt()
  @IsPositive()
  classId!: number;

  @IsInt()
  @IsPositive()
  schoolYearId!: number;
}
