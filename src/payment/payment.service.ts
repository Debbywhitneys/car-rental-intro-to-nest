import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Rental } from 'src/rental/entities/rental.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
  ) {}

  // ✅ CREATE PAYMENT
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const { rental_id, amount, payment_method, payment_date } =
        createPaymentDto;

      // Check if rental exists
      const rental = await this.rentalRepository.findOne({
        where: { rental_id: rental_id },
      });

      if (!rental) {
        throw new NotFoundException(`Rental with ID ${rental} not found`);
      }

      // Optional: check if a payment with the same date & rental already exists
      const existingPayment = await this.paymentRepository.findOne({
        where: { payment_date, rental: { rental_id: rental_id } },
      });

      if (existingPayment) {
        throw new ConflictException('Payment for this date already exists');
      }

      const payment = this.paymentRepository.create({
        amount,
        payment_method,
        payment_date,
        rental,
      });

      const savedPayment = await this.paymentRepository.save(payment);
      console.log('✅ Payment created successfully:', savedPayment);

      return savedPayment;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new HttpException(
        `Failed to create payment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ALL PAYMENTS
  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        relations: ['rental'],
        select: {
          rental: { rental_id: true },
          amount: true,
          payment_method: true,
          payment_date: true,
        },
      });
    } catch {
      throw new HttpException(
        'Error retrieving payments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ONE PAYMENT
  async findOne(rental_id: number): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { rental: { rental_id: rental_id } },
        relations: ['rental'],
      });

      if (!payment) {
        throw new NotFoundException(`Payment with ID ${rental_id} not found`);
      }
      return payment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error finding payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ UPDATE PAYMENT
  async update(
    rental_id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    try {
      const existingPayment = await this.paymentRepository.findOne({
        where: { rental: { rental_id: rental_id } },
      });
      if (!existingPayment) {
        throw new NotFoundException(`Payment with ID ${rental_id} not found`);
      }

      Object.assign(existingPayment, updatePaymentDto);
      const updated = await this.paymentRepository.save(existingPayment);

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ DELETE PAYMENT
  async remove(rental_id: number): Promise<string> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { rental: { rental_id: rental_id } },
      });
      if (!payment) {
        throw new NotFoundException(`Payment with ID ${rental_id} not found`);
      }

      await this.paymentRepository.delete(rental_id);
      return 'Payment deleted successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
