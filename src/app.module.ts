import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { PaymentModule } from './payment/payment.module';
import { InsuaranceModule } from './insuarance/insuarance.module';
import { LocationModule } from './location/location.module';
import { ReservationModule } from './reservation/reservation.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { RentalModule } from './rental/rental.module';
import { CarModule } from './car/car.module';
import { DatabaseModule } from './database/database.module';
import { databaseConfig } from './database/database.config';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),

    CarModule,
    CustomerModule,
    PaymentModule,
    InsuaranceModule,
    LocationModule,
    ReservationModule,
    MaintenanceModule,
    RentalModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
//module is the entrace point for each application in nestjs
