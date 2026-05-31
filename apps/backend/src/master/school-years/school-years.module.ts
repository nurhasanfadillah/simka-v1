import { Module } from '@nestjs/common';
import { SchoolYearsService } from './school-years.service';
import { SchoolYearsController } from './school-years.controller';

@Module({
  providers: [SchoolYearsService],
  controllers: [SchoolYearsController],
})
export class SchoolYearsModule {}
