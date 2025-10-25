import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './entities/rental.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Injectable()
export class RentalService {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
  ) {}

  // Create a new rental
  async create(createRentalDto: CreateRentalDto): Promise<Rental> {
    const rental = this.rentalRepository.create(createRentalDto);
    return this.rentalRepository.save(rental);
  }

  // Get all rentals
  async findAll(): Promise<Rental[]> {
    return this.rentalRepository.find({ relations: ['car', 'customer'] });
  }

  // Get a single rental by id
  async findOne(rental_id: number): Promise<Rental> {
    // ✅ Use findOneBy to avoid all TS errors
    const rental = await this.rentalRepository.findOneBy({ rental_id });
    if (!rental) throw new NotFoundException(`Rental #${rental_id} not found`);
    return rental;
  }

  // Update a rental
  async update(id: number, updateRentalDto: UpdateRentalDto): Promise<Rental> {
    const rental = await this.findOne(id);
    Object.assign(rental, updateRentalDto);
    return this.rentalRepository.save(rental);
  }

  // Remove a rental
  async remove(id: number): Promise<void> {
    const rental = await this.findOne(id);
    await this.rentalRepository.remove(rental);
  }
}
