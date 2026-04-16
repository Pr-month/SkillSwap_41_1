import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Category, { nullable: false })
  category!: Category;

  @Column('text', { array: true, default: [] })
  images!: string[];

  @ManyToOne(() => User, (user) => user.skills, { onDelete: 'CASCADE' })
  owner!: User;
}