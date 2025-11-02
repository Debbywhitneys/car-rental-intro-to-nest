import {
  NotFoundException,
  HttpException,
  HttpStatus,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';
import { Location } from 'src/location/entities/location.entity';
import { Maintenance } from 'src/maintenance/entities/maintenance.entity';
import { Rental } from 'src/rental/entities/rental.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Rental)
    private readonly rentalRepository: Repository<Rental>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(
    createCarDto: CreateCarDto,
  ): Promise<{ status: number; message: string; data: Car }> {
    try {
      // Check if car already exists (by registration number)
      const existingCar = await this.carRepository.findOne({
        where: { car_id: createCarDto.car_id },
      });
      if (existingCar) {
        throw new ConflictException(
          'Car with this registration number already exists',
        );
      }

      // Ensure location exists
      const location = await this.locationRepository.findOne({
        where: { location_id: createCarDto.location_id },
      });
      if (!location) {
        throw new NotFoundException(
          `Location with id ${createCarDto.location_id} not found`,
        );
      }

      const car = this.carRepository.create({
        ...createCarDto,
        location,
      });

      const savedCar = await this.carRepository.save(car);

      return {
        status: HttpStatus.CREATED,
        message: 'Car successfully created',
        data: savedCar,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error creating car',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<{ status: number; message: string; data: Car[] }> {
    try {
      const cars = await this.carRepository.find({
        relations: ['location', 'maintenance', 'rentals', 'reservations'],
        select: {
          location_id: true,
          carModel: true,
          Manufacturer: true,
          availabilityStatus: true,
        },
      });

      return {
        status: HttpStatus.OK,
        message: 'Cars fetched successfully',
        data: cars,
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching cars',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(
    location_id: number,
  ): Promise<{ status: number; message: string; data: Car }> {
    const car = await this.carRepository.findOne({
      where: { location: { location_id } },
      relations: ['location', 'maintenance', 'rentals', 'reservations'],
    });

    if (!car) {
      throw new NotFoundException(`Car with id ${location_id} not found`);
    }

    return {
      status: HttpStatus.OK,
      message: 'Car found successfully',
      data: car,
    };
  }

  async update(
    location_id: number,
    updateCarDto: UpdateCarDto,
  ): Promise<{ status: number; message: string; data: Car }> {
    const car = await this.carRepository.findOne({ where: { location_id } });
    if (!car) {
      throw new NotFoundException(`Car with id ${location_id} not found`);
    }

    if (updateCarDto.location_id) {
      const location = await this.locationRepository.findOne({
        where: { location_id: updateCarDto.location_id },
      });
      if (!location) {
        throw new NotFoundException(
          `Location with id ${updateCarDto.location_id} not found`,
        );
      }
      car.location = location;
    }

    Object.assign(car, updateCarDto);
    const updatedCar = await this.carRepository.save(car);

    return {
      status: HttpStatus.OK,
      message: 'Car updated successfully',
      data: updatedCar,
    };
  }

  async remove(
    location_id: number,
  ): Promise<{ status: number; message: string }> {
    const car = await this.carRepository.findOne({
      where: { location_id },
      relations: ['rentals', 'reservations'],
    });

    if (!car) {
      throw new NotFoundException(`Car with id ${location_id} not found`);
    }

    if (car.rentals?.length > 0) {
      throw new ConflictException('Cannot delete car that is currently rented');
    }

    if (car.reservations?.length > 0) {
      throw new ConflictException(
        'Cannot delete car that has active reservations',
      );
    }

    await this.carRepository.delete(location_id);

    return {
      status: HttpStatus.OK,
      message: 'Car deleted successfully',
    };
  }
}
