import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async findIncoming(userId: string): Promise<Request[]> {
    // We explicitly select safe fields to avoid leaking passwords or other private data.
    return this.requestsRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.sender', 'sender')
      .leftJoinAndSelect('request.receiver', 'receiver')
      .leftJoinAndSelect('request.offeredSkill', 'offeredSkill')
      .leftJoinAndSelect('offeredSkill.category', 'offeredSkillCategory')
      .leftJoinAndSelect('request.requestedSkill', 'requestedSkill')
      .leftJoinAndSelect('requestedSkill.category', 'requestedSkillCategory')
      .select([
        'request.id',
        'request.createdAt',
        'request.status',
        'request.isRead',
        'sender.id',
        'sender.name',
        'sender.email',
        'sender.about',
        'sender.birthdate',
        'sender.city',
        'sender.gender',
        'sender.avatar',
        'sender.role',
        'receiver.id',
        'receiver.name',
        'receiver.email',
        'receiver.about',
        'receiver.birthdate',
        'receiver.city',
        'receiver.gender',
        'receiver.avatar',
        'receiver.role',
        'offeredSkill.id',
        'offeredSkill.title',
        'offeredSkill.description',
        'offeredSkill.images',
        'offeredSkillCategory.id',
        'offeredSkillCategory.name',
        'requestedSkill.id',
        'requestedSkill.title',
        'requestedSkill.description',
        'requestedSkill.images',
        'requestedSkillCategory.id',
        'requestedSkillCategory.name',
      ])
      .where('receiver.id = :userId', { userId })
      .orderBy('request.createdAt', 'DESC')
      .getMany();
  }
}
