import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolUnitDto } from './create-school-unit.dto';

export class UpdateSchoolUnitDto extends PartialType(CreateSchoolUnitDto) {}
