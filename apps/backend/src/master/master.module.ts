import { Module } from '@nestjs/common';
import { SchoolUnitsModule } from './school-units/school-units.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { ClassesModule } from './classes/classes.module';
import { StudentsModule } from './students/students.module';
import { StudentClassesModule } from './student-classes/student-classes.module';
import { PaymentPostsModule } from './payment-posts/payment-posts.module';

@Module({
  imports: [SchoolUnitsModule, SchoolYearsModule, ClassesModule, StudentsModule, StudentClassesModule, PaymentPostsModule],
})
export class MasterModule {}
