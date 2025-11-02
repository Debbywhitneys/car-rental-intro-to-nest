import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { Column } from 'typeorm';

export class CreateCarDto {
  @Column()
  @IsNotEmpty()
  car_id: number;

  @IsString()
  @IsNotEmpty()
  carModel: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsInt()
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  rentalRate: string;

  @IsBoolean()
  @IsOptional()
  availabilityStatus?: boolean;

  @IsInt()
  @IsNotEmpty()
  location_id: number;
}
