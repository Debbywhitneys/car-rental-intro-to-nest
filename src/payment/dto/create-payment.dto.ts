import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsDateString()
  payment_date: Date;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsNotEmpty()
  @IsNumber()
  rental_id: number;
}
