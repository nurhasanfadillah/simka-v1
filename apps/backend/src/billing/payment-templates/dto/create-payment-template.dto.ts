import { IsInt, IsPositive, IsString, Length, Min } from 'class-validator';

export class CreatePaymentTemplateDto {
  @IsString()
  @Length(1, 255)
  name!: string;

  @IsInt()
  @IsPositive()
  paymentPostId!: number;

  @IsInt()
  @IsPositive()
  schoolYearId!: number;

  @IsInt()
  @Min(1000)
  amount!: number;
}
