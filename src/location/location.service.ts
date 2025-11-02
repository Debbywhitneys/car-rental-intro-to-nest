import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Car } from 'src/car/entities/car.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  // ✅ CREATE
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      const existing = await this.locationRepository.findOne({
        where: { locatin_name: createLocationDto.location_name },
      });

      if (existing) {
        throw new ConflictException('Location with this name already exists');
      }

      const newLocation = this.locationRepository.create(createLocationDto);
      return await this.locationRepository.save(newLocation);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new HttpException(
        'Error creating location',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ALL
  async findAll(): Promise<Location[]> {
    try {
      return await this.locationRepository.find({
        relations: ['cars'],
      });
    } catch (error) {
      throw new HttpException(
        'Error fetching locations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ✅ FIND ONE
  async findOne(location_id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { location_id },
      relations: ['cars'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${location_id} not found`);
    }

    return location;
  }

  // ✅ UPDATE
  async update(
    location_id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { location_id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${location_id} not found`);
    }

    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }

  // ✅ REMOVE
  async remove(
    location_id: number,
  ): Promise<{ status: number; message: string }> {
    const location = await this.locationRepository.findOne({
      where: { location_id },
      relations: ['cars'],
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${location_id} not found`);
    }

    // Check if the location has any cars before deleting
    if (location.cars && location.cars.length > 0) {
      throw new ConflictException(
        'Cannot delete location with assigned cars. Remove or reassign cars first.',
      );
    }

    await this.locationRepository.remove(location);
    return {
      status: HttpStatus.OK,
      message: `Location with ID ${location_id} deleted successfully`,
    };
  }
}
