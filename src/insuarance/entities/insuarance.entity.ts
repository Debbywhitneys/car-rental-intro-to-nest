import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Car } from '../../car/entities/car.entity';

@Entity('insuarance')
export class Insuarance {
  @PrimaryGeneratedColumn()
  insuarance_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  insuarance_provider: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  policy_number: string;

  @Column({ type: 'date', nullable: false })
  start_date: Date;

  @Column({ type: 'date', nullable: false })
  end_date: Date;
  //relationship btn car and insuarance to be added later
  //MANY INSUARANCE TO ONE CAR
  @ManyToOne(() => Car, (car) => car.insuarance)
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
