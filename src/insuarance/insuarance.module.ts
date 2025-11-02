import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuaranceService } from './insuarance.service';
import { InsuaranceController } from './insuarance.controller';
import { Insuarance } from './entities/insuarance.entity';
import { Car } from 'src/car/entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Insuarance, Car])],
  controllers: [InsuaranceController],
  providers: [InsuaranceService],
})
export class InsuaranceModule {}
