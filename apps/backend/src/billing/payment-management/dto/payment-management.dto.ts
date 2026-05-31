import { IsInt, IsPositive, Min, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBillItemDto {
  @IsInt()
  @IsPositive()
  studentId!: number;

  @IsInt()
  @Min(1000)
  amount!: number;
}

export class CreateBillsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBillItemDto)
  bills!: CreateBillItemDto[];

  @IsInt()
  @IsPositive()
  paymentPostId!: number;

  @IsInt()
  @IsPositive()
  schoolYearId!: number;
}

export class EditBillAmountDto {
  @IsInt()
  @Min(1000)
  amount!: number;
}
