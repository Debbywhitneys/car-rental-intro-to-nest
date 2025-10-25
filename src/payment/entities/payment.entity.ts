import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Rental } from '../../rental/entities/rental.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column({ type: 'datetime2', nullable: false })
  payment_date: Date;

  @Column({ type: 'decimal', nullable: false, precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  payment_method: string;
  //relationship btn rental id forign key to be added later
  @ManyToOne(() => Rental, (rental) => rental.payments)
  @JoinColumn({ name: 'RentalID' })
  rental: Rental;
}
