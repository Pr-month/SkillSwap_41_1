import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Skill } from '../../skills/entities/skill.entity';

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
}

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User)
  sender!: User;

  @ManyToOne(() => User)
  receiver!: User;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status!: RequestStatus;

  @ManyToOne(() => Skill)
  offeredSkill!: Skill;

  @ManyToOne(() => Skill)
  requestedSkill!: Skill;

  @Column({ default: false })
  isRead!: boolean;
}