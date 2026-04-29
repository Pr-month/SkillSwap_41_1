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

  findOutgoing(userId: string) {
    return this.requestsRepository
      .createQueryBuilder('request')
      .leftJoin('request.sender', 'sender')
      .leftJoin('request.receiver', 'receiver')
      .leftJoin('request.offeredSkill', 'offeredSkill')
      .leftJoin('offeredSkill.category', 'offeredCategory')
      .leftJoin('request.requestedSkill', 'requestedSkill')
      .leftJoin('requestedSkill.category', 'requestedCategory')
      .select([
        'request.id',
        'request.createdAt',
        'request.status',
        'request.isRead',
        'sender.id',
        'sender.name',
        'sender.email',
        'sender.avatar',
        'sender.role',
        'receiver.id',
        'receiver.name',
        'receiver.email',
        'receiver.avatar',
        'receiver.role',
        'offeredSkill.id',
        'offeredSkill.title',
        'offeredSkill.description',
        'offeredSkill.images',
        'offeredCategory.id',
        'offeredCategory.name',
        'requestedSkill.id',
        'requestedSkill.title',
        'requestedSkill.description',
        'requestedSkill.images',
        'requestedCategory.id',
        'requestedCategory.name',
      ])
      .where('sender.id = :userId', { userId })
      .orderBy('request.createdAt', 'DESC')
      .getMany();
  }
}
