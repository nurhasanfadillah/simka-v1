import {
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
} from '@nestjs/common';
import { SchoolYearsService } from './school-years.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('master/school-years')
export class SchoolYearsController {
  constructor(private service: SchoolYearsService) {}

  @Get()
  @RequirePermissions('school_year.view')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('school_year.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('school_year.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSchoolYearDto) {
    return this.service.create(dto);
  }

  @Patch(':id/activate')
  @RequirePermissions('school_year.update')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Patch(':id')
  @RequirePermissions('school_year.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSchoolYearDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('school_year.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
