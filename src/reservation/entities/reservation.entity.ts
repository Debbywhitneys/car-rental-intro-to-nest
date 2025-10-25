import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Car } from '../../car/entities/car.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  reservation_id: number;

  @Column({ type: 'datetime2', nullable: false })
  reservation_date: Date;

  @Column({ type: 'datetime2', nullable: false })
  pickup_date: Date;

  @Column({ type: 'datetime2', nullable: false })
  return_date: Date;

  //relationship btn carid and reservation to be added later
  //relationship btn customerid and reservation to be added later

  // MANY Reservations belong to ONE Customer
  @ManyToOne(() => Customer, (customer) => customer.reservations)
  @JoinColumn({ name: 'CustomerID' })
  customer: Customer;

  // MANY Reservations belong to ONE Car
  @ManyToOne(() => Car, (car) => car.reservations)
  @JoinColumn({ name: 'CarID' })
  car: Car;
}
