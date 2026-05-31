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
  Query,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('master/classes')
export class ClassesController {
  constructor(private service: ClassesService) {}

  @Get()
  @RequirePermissions('class.view')
  findAll(
    @Query('school_unit_id') schoolUnitId?: string,
    @Query('schoolYearId') schoolYearId?: string,
  ) {
    const id = schoolUnitId ? parseInt(schoolUnitId, 10) : undefined;
    const yearId = schoolYearId ? parseInt(schoolYearId, 10) : undefined;
    return this.service.findAll(id, yearId);
  }

  @Get(':id')
  @RequirePermissions('class.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('class.create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('class.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('class.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
