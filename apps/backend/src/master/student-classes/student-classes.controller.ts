import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudentClassesService } from './student-classes.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { TransferStudentDto } from './dto/transfer-student.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('master/student-classes')
export class StudentClassesController {
  constructor(private readonly service: StudentClassesService) {}

  @Get()
  @RequirePermissions('student.view')
  findByClass(
    @Query('classId') classId?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    if (!classId || !schoolYearId) {
      throw new BadRequestException('classId dan schoolYearId wajib diisi');
    }
    return this.service.findByClass(parseInt(classId, 10), parseInt(schoolYearId, 10));
  }

  @Post()
  @RequirePermissions('student.create')
  @HttpCode(HttpStatus.CREATED)
  enroll(@Body() dto: EnrollStudentDto) {
    return this.service.enroll(dto);
  }

  @Patch(':id/transfer')
  @RequirePermissions('student.update')
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferStudentDto,
  ) {
    return this.service.transfer(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('student.update')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
