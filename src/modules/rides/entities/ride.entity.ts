import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.rides)
  driver: User;

  @Column({ type: 'timestamp' })
  departAt: Date;

  @Column()
  seatsTotal: number;

  @Column()
  seatsAvailable: number;

  @Column({ type: 'int' })
  pricePerSeatCents: number;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
  origin: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326 })
  destination: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'LineString',
    srid: 4326,
    nullable: true,
  })
  route: string;
}
