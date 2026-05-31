import { Module } from '@nestjs/common';
import { StudentClassesService } from './student-classes.service';
import { StudentClassesController } from './student-classes.controller';

@Module({
  providers: [StudentClassesService],
  controllers: [StudentClassesController],
  exports: [StudentClassesService],
})
export class StudentClassesModule {}
