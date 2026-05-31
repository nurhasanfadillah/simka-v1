import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdatePaymentTemplateDto {
  @IsString()
  @Length(1, 255)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1000)
  @IsOptional()
  amount?: number;
}
