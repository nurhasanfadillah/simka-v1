import { Module } from '@nestjs/common';
import { SchoolUnitsService } from './school-units.service';
import { SchoolUnitsController } from './school-units.controller';

@Module({
  providers: [SchoolUnitsService],
  controllers: [SchoolUnitsController],
})
export class SchoolUnitsModule {}
