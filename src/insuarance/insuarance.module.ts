import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuaranceService } from './insuarance.service';
import { InsuaranceController } from './insuarance.controller';
import { Insuarance } from './entities/insuarance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Insuarance])],
  controllers: [InsuaranceController],
  providers: [InsuaranceService],
})
export class InsuaranceModule {}
