import { Module } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalController } from './rental.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './entities/rental.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { CarModule } from 'src/car/car.module';
import { Car } from 'src/car/entities/car.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental, Car, Customer, Payment]), // register Rental entity
    CustomerModule, // import module, not service
    CarModule, // import module, not service
  ],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
