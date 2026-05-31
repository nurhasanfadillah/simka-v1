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
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StudentsService } from './students.service';
import { StudentClassesService } from '../student-classes/student-classes.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('master/students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly studentClassesService: StudentClassesService,
  ) {}

  @Get()
  @RequirePermissions('student.view')
  findAll(@Query('school_unit_id') schoolUnitId?: string) {
    return this.studentsService.findAll(
      schoolUnitId ? parseInt(schoolUnitId, 10) : undefined,
    );
  }

  @Get('mapping')
  @RequirePermissions('student.view')
  findAvailableForMapping(
    @Query('schoolYearId') schoolYearId?: string,
    @Query('excludeClassId') excludeClassId?: string,
  ) {
    if (!schoolYearId || !excludeClassId) {
      throw new BadRequestException('schoolYearId dan excludeClassId wajib diisi');
    }
    return this.studentsService.findAvailableForMapping(
      parseInt(schoolYearId, 10),
      parseInt(excludeClassId, 10),
    );
  }

  @Public()
  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.studentsService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template-import-siswa.xlsx');
    res.end(buffer);
  }

  @Post('import/preview')
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions('student.create')
  async previewImport(
    @UploadedFile() file: Express.Multer.File,
    @Body('entryYear') entryYear: string,
  ) {
    if (!file) throw new BadRequestException('File wajib diupload');
    if (!entryYear) throw new BadRequestException('Tahun Masuk wajib diisi');
    return this.studentsService.previewImport(file.buffer, parseInt(entryYear, 10));
  }

  @Post('import/commit')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('student.create')
  commitImport(@Body() body: { entryYear: number; rows: Record<string, any>[] }) {
    if (!body.entryYear) throw new BadRequestException('Tahun Masuk wajib diisi');
    if (!body.rows || body.rows.length === 0) throw new BadRequestException('Data siswa wajib diisi');
    return this.studentsService.commitImport(body.entryYear, body.rows);
  }

  @Get('search')
  @RequirePermissions('student.view')
  search(
    @Query('q') q?: string,
    @Query('schoolYearId') schoolYearId?: string,
    @Query('unitId') unitId?: string,
    @Query('classId') classId?: string,
  ) {
    return this.studentsService.searchStudents({
      q,
      schoolYearId: schoolYearId ? parseInt(schoolYearId, 10) : undefined,
      unitId: unitId ? parseInt(unitId, 10) : undefined,
      classId: classId ? parseInt(classId, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('student.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Get(':id/classes')
  @RequirePermissions('student.view')
  getClasses(@Param('id', ParseIntPipe) id: number) {
    return this.studentClassesService.findByStudent(id);
  }

  @Post()
  @RequirePermissions('student.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('student.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('student.delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}
