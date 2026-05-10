import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

export type CityCoords = {
  lat: number;
  lon: number;
};

@Entity('city')
@Index(['name', 'subject'], { unique: true })
export class City {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb' })
  coords!: CityCoords;

  @Column()
  district!: string;

  @Column()
  name!: string;

  @Column({ type: 'int' })
  population!: number;

  @Column()
  subject!: string;
}
