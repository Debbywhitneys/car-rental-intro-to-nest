import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { Car } from './entities/car.entity';
import { Location } from 'src/location/entities/location.entity';
import { Maintenance } from 'src/maintenance/entities/maintenance.entity';
import { Rental } from 'src/rental/entities/rental.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car, Location, Maintenance, Rental, Reservation]),
  ],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
