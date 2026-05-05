import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;
}
