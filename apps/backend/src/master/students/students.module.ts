import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { StudentClassesModule } from '../student-classes/student-classes.module';

@Module({
  imports: [StudentClassesModule],
  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
