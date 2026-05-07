import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { IRequestWithUser } from '../auth/auth.types';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { UserRole } from '../users/entities/enums/users.enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  create(createRequestDto: CreateRequestDto) {
    return 'This action adds a new request';
  }

  findAll() {
    return `This action returns all requests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  findOutgoing(userId: string) {
    return this.requestRepository
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

  async remove(id: string, req: IRequestWithUser) {
    const request = await this.requestRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (
      request.sender.id !== req.user.sub ||
      req.user.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException(
        'You are not authorized to delete this request',
      );
    }
    await this.requestRepository.remove(request);
  }
}
