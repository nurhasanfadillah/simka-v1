import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

class UpdateStudentBase extends PartialType(
  OmitType(CreateStudentDto, ['entryYear'] as const),
) {}

export class UpdateStudentDto extends UpdateStudentBase {}
