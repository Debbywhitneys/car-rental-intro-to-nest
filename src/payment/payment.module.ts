import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Rental } from 'src/rental/entities/rental.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Rental])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
