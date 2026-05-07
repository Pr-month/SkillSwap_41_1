import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Skill } from '../../skills/entities/skill.entity';
import { Category } from '../../categories/entities/category.entity';
import { UserRole, Gender } from './enums/users.enums';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  about!: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city!: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: Gender | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  avatar!: string | null;

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills!: Skill[];

  @ManyToMany(() => Category)
  @JoinTable()
  wantToLearn!: Category[];

  @ManyToMany(() => Skill)
  @JoinTable()
  favoriteSkills!: Skill[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: 'varchar', length: 256, nullable: true })
  @Exclude()
  refreshToken!: string | null;
}
