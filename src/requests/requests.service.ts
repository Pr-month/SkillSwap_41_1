import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRequestWithUser } from '../auth/auth.types';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/enums/users.enums';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request.enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async create(createRequestDto: CreateRequestDto, senderId: string) {
    const [sender, receiver, offeredSkill, requestedSkill] = await Promise.all([
      this.usersRepository.findOne({ where: { id: senderId } }),
      this.usersRepository.findOne({
        where: { id: createRequestDto.receiverId },
      }),
      this.skillsRepository.findOne({
        where: { id: createRequestDto.offeredSkillId },
        relations: { owner: true, category: true },
      }),
      this.skillsRepository.findOne({
        where: { id: createRequestDto.requestedSkillId },
        relations: { owner: true, category: true },
      }),
    ]);

    if (!sender) {
      throw new NotFoundException('Отправитель не найден');
    }

    if (!receiver) {
      throw new NotFoundException('Получатель не найден');
    }

    if (sender.id === receiver.id) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    if (!offeredSkill) {
      throw new NotFoundException('Предлагаемый навык не найден');
    }

    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
    }

    if (offeredSkill.owner.id !== sender.id) {
      throw new ForbiddenException(
        'Предлагаемый навык должен принадлежать отправителю',
      );
    }

    if (requestedSkill.owner.id !== receiver.id) {
      throw new ForbiddenException(
        'Запрашиваемый навык должен принадлежать получателю',
      );
    }

    const request = this.requestsRepository.create({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
      isRead: false,
    });

    const savedRequest = await this.requestsRepository.save(request);

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
      .where('request.id = :id', { id: savedRequest.id })
      .getOneOrFail();
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

  async findIncoming(userId: string): Promise<Request[]> {
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

  async remove(id: string, req: IRequestWithUser) {
    const request = await this.requestsRepository.findOneBy({ id });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (
      request.sender.id !== req.user.sub &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new UnauthorizedException(
        'You are not authorized to delete this request',
      );
    }
    await this.requestsRepository.remove(request);
  }
}
