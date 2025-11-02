import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Reservation } from '../../reservation/entities/reservation.entity';
import { Rental } from '../../rental/entities/rental.entity';
import { OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OneToOne } from 'typeorm';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  customer_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  //customer has relationship with users
  @OneToOne(() => User, (user) => user.customer)
  user: User;

  //ONE CUSTOMER CAN HAVE MANY RESERVATION
  @OneToMany(() => Reservation, (reservation) => reservation.customer)
  reservations: Reservation[];

  //ONE CUSTOMER CAN HAVE MANY RENTAL
  @OneToMany(() => Rental, (rental) => rental.customer)
  rentals: Rental[];
}
