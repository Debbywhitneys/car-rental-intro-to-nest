import { IsNotEmpty, IsDateString, IsInt } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsDateString()
  reservation_date: Date;

  @IsNotEmpty()
  @IsDateString()
  pickup_date: Date;

  @IsNotEmpty()
  @IsDateString()
  return_date: Date;

  @IsNotEmpty()
  @IsInt()
  customer_id: number; // ID of the customer making the reservation

  @IsNotEmpty()
  @IsInt()
  car_id: number; // ID of the car being reserved
}
