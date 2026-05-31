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
import { SchoolUnitsService } from './school-units.service';
import { CreateSchoolUnitDto } from './dto/create-school-unit.dto';
import { UpdateSchoolUnitDto } from './dto/update-school-unit.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('master/school-units')
export class SchoolUnitsController {
  constructor(private service: SchoolUnitsService) {}

  @Get()
  @RequirePermissions('school_unit.view')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @RequirePermissions('school_unit.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('school_unit.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSchoolUnitDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('school_unit.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSchoolUnitDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('school_unit.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
