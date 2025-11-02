import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import { Car } from 'src/car/entities/car.entity';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  // Create a reservation
  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    try {
      const {
        reservation_date,
        pickup_date,
        return_date,
        customer_id,
        car_id,
      } = createReservationDto;

      // 1. ensure customer exists
      const customer = await this.customerRepository.findOne({
        where: { customer_id: customer_id },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${customer_id} not found`,
        );
      }

      // 2. ensure car exists
      const car = await this.carRepository.findOne({
        where: { car_id: car_id },
      });
      if (!car) {
        throw new NotFoundException(`Car with ID ${car_id} not found`);
      }

      // 3. check overlapping reservations for the same car
      //    (pickup_date <= existing.return_date AND return_date >= existing.pickup_date)
      const overlapping = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.car = :carId', { car_id })
        .andWhere(
          '(reservation.pickup_date <= :return_date AND reservation.return_date >= :pickup_date)',
          { pickup_date, return_date },
        )
        .getOne();

      if (overlapping) {
        throw new ConflictException('Car is already reserved for these dates');
      }

      // 4. create and save reservation
      const reservation = this.reservationRepository.create({
        reservation_date,
        pickup_date,
        return_date,
        customer,
        car,
      });

      const saved = await this.reservationRepository.save(reservation);
      this.logger.log('Reservation created', {
        id: saved.reservation_id,
        car_id,
        customer_id,
      });
      return saved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      this.logger.error('Failed to create reservation', error);
      throw new HttpException(
        'Error creating reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get all reservations
  async findAll(): Promise<Reservation[]> {
    try {
      return await this.reservationRepository.find({
        relations: ['customer', 'car'],
      });
    } catch (error) {
      this.logger.error('Failed to fetch reservations', error);
      throw new HttpException(
        'Error fetching reservations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get single reservation
  async findOne(reservation_id: number): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { reservation_id },
        relations: ['customer', 'car'],
      });
      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${reservation_id} not found`,
        );
      }
      return reservation;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to fetch reservation', error);
      throw new HttpException(
        'Error fetching reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update reservation
  async update(
    reservation_id: number,
    updateReservationDto: UpdateReservationDto,
  ): Promise<Reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { reservation_id },
        relations: ['customer', 'car'],
      });
      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${reservation_id} not found`,
        );
      }

      // If updating carId or customerId, ensure new relations exist
      if (updateReservationDto.car_id) {
        const car = await this.carRepository.findOne({
          where: { car_id: updateReservationDto.car_id },
        });

        if (!car) {
          throw new NotFoundException(
            `Car with ID ${updateReservationDto.car_id} not found`,
          );
        }

        reservation.car = car;
      }

      if (updateReservationDto.customer_id) {
        const customer = await this.customerRepository.findOne({
          where: { customer_id: updateReservationDto.customer_id },
        });

        if (!customer) {
          throw new NotFoundException(
            `Customer with ID ${updateReservationDto.customer_id} not found`,
          );
        }

        reservation.customer = customer;
      }

      // Merge and save
      Object.assign(reservation, updateReservationDto);
      const updated = await this.reservationRepository.save(reservation);
      this.logger.log('Reservation updated', { id: updated.reservation_id });
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to update reservation', error);
      throw new HttpException(
        'Error updating reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete reservation
  async remove(reservation_id: number): Promise<string> {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { reservation_id },
      });
      if (!reservation) {
        throw new NotFoundException(
          `Reservation with ID ${reservation_id} not found`,
        );
      }

      const result = await this.reservationRepository.delete(reservation_id);
      if (result.affected === 0) {
        throw new NotFoundException(
          `Reservation with ID ${reservation_id} not found`,
        );
      }

      this.logger.log('Reservation deleted', { id: reservation_id });
      return 'Reservation deleted successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Failed to delete reservation', error);
      throw new HttpException(
        'Error deleting reservation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
