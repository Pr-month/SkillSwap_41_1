import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

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
