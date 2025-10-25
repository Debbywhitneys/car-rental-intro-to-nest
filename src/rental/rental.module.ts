import { Module } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalController } from './rental.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './entities/rental.entity';
import { CustomerModule } from 'src/customer/customer.module';
import { CarModule } from 'src/car/car.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental]), // register Rental entity
    CustomerModule, // import module, not service
    CarModule, // import module, not service
  ],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
