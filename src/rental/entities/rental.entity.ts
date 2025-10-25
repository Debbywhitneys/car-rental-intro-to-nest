import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Car } from '../../car/entities/car.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  rental_id: number;

  @Column({ type: 'datetime2', nullable: false })
  rentalStart_date: Date;

  @Column({ type: 'datetime2', nullable: false })
  rentalEnd_date: Date;

  @Column({ type: 'decimal', nullable: false, precision: 10, scale: 2 })
  total_amount: number;
  //relationship btn rental and car to be added later
  //relationship btn rental and user to be added later
  //relationship btn rental and payment to be added later
  //relationship btn rental and customer to be added later

  // MANY Rentals belong to ONE Customer
  @ManyToOne(() => Customer, (customer) => customer.rentals)
  @JoinColumn({ name: 'CustomerID' })
  customer: Customer;

  // MANY Rentals belong to ONE Car
  @ManyToOne(() => Car, (car) => car.rentals)
  @JoinColumn({ name: 'CarID' })
  car: Car;

  // ONE Rental can have MANY Payments
  @OneToMany(() => Payment, (payment) => payment.rental)
  payments: Payment[];
}
