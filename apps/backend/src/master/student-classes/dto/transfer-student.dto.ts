import { IsInt, IsPositive } from 'class-validator';

export class TransferStudentDto {
  @IsInt()
  @IsPositive()
  classId!: number;
}
