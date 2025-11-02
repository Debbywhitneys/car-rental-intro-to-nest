import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateMaintenanceDto {
  @IsNotEmpty()
  @IsDateString()
  maintenance_date: Date;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  cost: number;

  @IsNotEmpty()
  car: number; // This will be the ID of the car being maintained
}
