import { Injectable } from '@nestjs/common';
import { CreateInsuaranceDto } from './dto/create-insuarance.dto';
import { UpdateInsuaranceDto } from './dto/update-insuarance.dto';

@Injectable()
export class InsuaranceService {
  create(createInsuaranceDto: CreateInsuaranceDto) {
    return 'This action adds a new insuarance';
  }

  findAll() {
    return `This action returns all insuarance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} insuarance`;
  }

  update(id: number, updateInsuaranceDto: UpdateInsuaranceDto) {
    return `This action updates a #${id} insuarance`;
  }

  remove(id: number) {
    return `This action removes a #${id} insuarance`;
  }
}
