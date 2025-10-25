import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Car } from '../../car/entities/car.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  location_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  locatin_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  contact_number: string;

  //ONE LOCATION CAN HAVE MANY CARS
  @OneToMany(() => Car, (car) => car.location)
  cars: Car[];
}
