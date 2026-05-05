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
      .leftJoinAndSelect('request.sender', 'sender')
      .leftJoinAndSelect('request.receiver', 'receiver')
      .leftJoinAndSelect('request.offeredSkill', 'offeredSkill')
      .leftJoinAndSelect('offeredSkill.category', 'offeredCategory')
      .leftJoinAndSelect('request.requestedSkill', 'requestedSkill')
      .leftJoinAndSelect('requestedSkill.category', 'requestedCategory')
      .where('sender.id = :userId', { userId })
      .orderBy('request.createdAt', 'DESC')
      .getMany();
  }
}
