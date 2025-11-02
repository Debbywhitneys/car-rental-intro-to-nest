import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insuarance } from './entities/insuarance.entity';
import { CreateInsuaranceDto } from './dto/create-insuarance.dto';
import { UpdateInsuaranceDto } from './dto/update-insuarance.dto';
import { Car } from 'src/car/entities/car.entity';

@Injectable()
export class InsuaranceService {
  constructor(
    @InjectRepository(Insuarance)
    private insuaranceRepository: Repository<Insuarance>,

    @InjectRepository(Car)
    private carRepository: Repository<Car>,
  ) {}

  // ✅ CREATE
  async create(createInsuaranceDto: CreateInsuaranceDto): Promise<Insuarance> {
    try {
      const {
        policy_number,
        insuarance_provider,
        start_date,
        end_date,
        car_id,
      } = createInsuaranceDto;

      // Check if car exists
      const car = await this.carRepository.findOne({
        where: { car_id: car_id },
      });
      if (!car) {
        throw new NotFoundException(`Car with ID ${car_id} not found`);
      }

      // Check if policy number already exists
      const existingPolicy = await this.insuaranceRepository.findOne({
        where: { policy_number },
      });

      if (existingPolicy) {
        throw new ConflictException('Policy number already exists');
      }

      const insuarance = this.insuaranceRepository.create({
        policy_number,
        insuarance_provider,
        start_date,
        end_date,
        car,
      });

      const saved = await this.insuaranceRepository.save(insuarance);
      console.log('✅ Insuarance created successfully:', saved);
      return saved;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      throw new HttpException(
        `Failed to create insuarance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ALL
  async findAll(): Promise<Insuarance[]> {
    try {
      return await this.insuaranceRepository.find({
        relations: ['car'],
        select: {
          insuarance_id: true,
          policy_number: true,
          insuarance_provider: true,
          start_date: true,
          end_date: true,
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error retrieving insuarance records',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ONE
  async findOne(insuarance_id: number): Promise<Insuarance> {
    try {
      const insuarance = await this.insuaranceRepository.findOne({
        where: { insuarance_id },
        relations: ['car'],
      });

      if (!insuarance) {
        throw new NotFoundException(
          `Insuarance with ID ${insuarance_id} not found`,
        );
      }

      return insuarance;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error finding insuarance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ UPDATE
  async update(
    insuarance_id: number,
    updateInsuaranceDto: UpdateInsuaranceDto,
  ): Promise<Insuarance> {
    try {
      const existing = await this.insuaranceRepository.findOne({
        where: { insuarance_id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Insuarance with ID ${insuarance_id} not found`,
        );
      }

      Object.assign(existing, updateInsuaranceDto);
      const updated = await this.insuaranceRepository.save(existing);

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error updating insuarance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ DELETE
  async remove(insuarance_id: number): Promise<string> {
    try {
      const existing = await this.insuaranceRepository.findOne({
        where: { insuarance_id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Insuarance with ID ${insuarance_id} not found`,
        );
      }

      await this.insuaranceRepository.delete(insuarance_id);
      return 'Insuarance deleted successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting insuarance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
