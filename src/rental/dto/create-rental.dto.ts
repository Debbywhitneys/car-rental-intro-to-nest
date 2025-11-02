import { IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreateRentalDto {
  @IsNotEmpty()
  @IsDateString()
  rentalStart_date: Date;

  @IsNotEmpty()
  @IsDateString()
  rentalEnd_date: Date;

  @IsNotEmpty()
  @IsNumber()
  total_amount: number;

  @IsNotEmpty()
  customer: number; // ID of the customer making the rental

  @IsNotEmpty()
  car: number; // ID of the car being rented
}
