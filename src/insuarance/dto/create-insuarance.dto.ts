import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateInsuaranceDto {
  @IsNotEmpty()
  @IsString()
  insuarance_provider: string;

  @IsNotEmpty()
  @IsString()
  policy_number: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @IsNotEmpty()
  car_id: number; // because you'll pass the car this insurance belongs to
}
