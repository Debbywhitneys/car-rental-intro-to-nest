import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Car } from '../../car/entities/car.entity';

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn()
  maintenance_id: number;

  @Column({ type: 'datetime2', nullable: false })
  maintenance_date: Date;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'decimal', nullable: false, precision: 10, scale: 2 })
  cost: number;
  //relationship btn maintenance and carid to be added later
  @ManyToOne(() => Car, (car) => car.maintenances)
  @JoinColumn({ name: 'CarID' })
  car: Car;
}
