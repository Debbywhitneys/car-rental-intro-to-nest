import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InsuaranceService } from './insuarance.service';
import { CreateInsuaranceDto } from './dto/create-insuarance.dto';
import { UpdateInsuaranceDto } from './dto/update-insuarance.dto';

@Controller('insuarance')
export class InsuaranceController {
  constructor(private readonly insuaranceService: InsuaranceService) {}

  @Post()
  create(@Body() createInsuaranceDto: CreateInsuaranceDto) {
    return this.insuaranceService.create(createInsuaranceDto);
  }

  @Get()
  findAll() {
    return this.insuaranceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insuaranceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInsuaranceDto: UpdateInsuaranceDto,
  ) {
    return this.insuaranceService.update(+id, updateInsuaranceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.insuaranceService.remove(+id);
  }
}
