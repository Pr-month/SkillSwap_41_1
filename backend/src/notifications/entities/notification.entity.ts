import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { NotificationType } from '../notifications.type';
@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    receiverId!: string;

    @Column({type: 'enum', enum: NotificationType})
    type!: NotificationType

    @Column()
    skillName!: string

    @Column()
    fromUserId!: string;

    @Column()
    fromUserName!: string;

    @Column({nullable: true})
    requestId?: string

    @Column({nullable: true})
    message?: string

    @Column({ default: false})
    isRead!: boolean

    @CreateDateColumn()
    createdAt!: Date
}