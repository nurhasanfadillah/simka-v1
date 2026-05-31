import { IsString, MinLength } from 'class-validator';

export class VoidTransactionDto {
  @IsString()
  @MinLength(3)
  voidReason!: string;
}
