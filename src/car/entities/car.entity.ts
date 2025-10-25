import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Location } from '../../location/entities/location.entity';
import { OneToMany, JoinColumn } from 'typeorm';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Rental } from '../../rental/entities/rental.entity';
import { Maintenance } from '../../maintenance/entities/maintenance.entity';
import { Insuarance } from '../../insuarance/entities/insuarance.entity';

@Entity()
export class Car {
  @PrimaryGeneratedColumn()
  car_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  carModel: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  Manufacturer: string;

  @Column({ type: 'int', nullable: false })
  year: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  color: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  RentalRate: string;

  @Column({ type: 'bit', default: true })
  availabilityStatus: boolean;

  @Column({ type: 'int', nullable: false, unique: true })
  locationID: number;

  //relationship btn car and locationID to be added later
  @ManyToOne(() => Location, (location) => location.cars)
  @JoinColumn({ name: 'locationID' })
  location: Location;

  //ONE CAR CAN HAVE MANY RESERVATION
  @OneToMany(() => Reservation, (reservation) => reservation.car)
  reservations: Reservation[];

  //ONE CAR CAN HAVE MANY RENTAL
  @OneToMany(() => Rental, (rental) => rental.car)
  rentals: Rental[];

  //ONE CAR CAN HAVE MANY MAINTENANCE
  @OneToMany(() => Maintenance, (maintenance) => maintenance.car)
  maintenances: Maintenance[];

  //ONE CAR CAN HAAVE MANY INSURANCE
  @OneToMany(() => Insuarance, (insuarance) => insuarance.car)
  insuarance: Insuarance[];
}
