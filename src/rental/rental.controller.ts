import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RentalService } from './rental.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';

@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  // Create a new rental
  @Post()
  async create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalService.create(createRentalDto);
  }

  // Get all rentals
  @Get()
  async findAll() {
    return this.rentalService.findAll();
  }

  // Get a single rental by id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rentalService.findOne(+id);
  }

  // Update a rental
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
  ) {
    return this.rentalService.update(+id, updateRentalDto);
  }

  // Delete a rental
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.rentalService.remove(+id);
  }
}
