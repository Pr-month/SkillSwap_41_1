import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';

import { IRequestWithUser } from '../auth/auth.types';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/enums/users.enums';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Request } from './entities/request.entity';
import { RequestStatus } from './entities/request.enum';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../notifications/notifications.type';

@Injectable()
export class RequestsService {
  private readonly requestRelations: FindOptionsRelations<Request> = {
    sender: true,
    receiver: true,
    offeredSkill: { category: true },
    requestedSkill: { category: true },
  };

  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(createRequestDto: CreateRequestDto, senderId: string) {
    const [sender, offeredSkill, requestedSkill] = await Promise.all([
      this.usersRepository.findOne({ where: { id: senderId } }),
      this.skillsRepository.findOne({
        where: { id: createRequestDto.offeredSkillId },
        relations: { owner: true, category: true },
      }),
      this.skillsRepository.findOne({
        where: { id: createRequestDto.requestedSkillId },
        relations: { owner: true, category: true },
      }),
    ]);

    if (!sender || !offeredSkill || !requestedSkill) {
      throw new NotFoundException('Данные для создания заявки не найдены');
    }

    const receiver = requestedSkill.owner;

    if (sender.id === receiver.id) {
      throw new BadRequestException('Нельзя отправить заявку самому себе');
    }

    if (offeredSkill.owner.id !== sender.id) {
      throw new ForbiddenException(
        'Предлагаемый навык должен принадлежать отправителю',
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

    const skillName = requestedSkill.title;

    this.notificationsGateway.notifyUser(receiver.id, {
      type: NotificationType.NEW_REQUEST,
      skillName,
      fromUser: {
        id: sender.id,
        name: sender.name,
      },
      requestId: savedRequest.id,
      timeStamp: new Date(),
    });

    return this.requestsRepository.findOneOrFail({
      where: { id: savedRequest.id },
      relations: this.requestRelations,
    });
  }

  findAll() {
    return 'This action returns all requests';
  }

  findOne(id: string) {
    return `This action returns a #${id} request`;
  }

  async update(
    id: string,
    updateRequestDto: UpdateRequestDto,
    req: IRequestWithUser,
  ) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: this.requestRelations,
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    if (request.receiver.id !== req.user.sub) {
      throw new ForbiddenException(
        'Вы можете обновлять статус только у входящих заявок',
      );
    }

    request.status = updateRequestDto.status;
    const updatedRequest = await this.requestsRepository.save(request);

    const notificationType =
      updateRequestDto.status === RequestStatus.ACCEPTED
        ? NotificationType.ACCEPTED
        : NotificationType.REJECTED;

    const skillName = request.requestedSkill.title;

    this.notificationsGateway.notifyUser(request.sender.id, {
      type: notificationType,
      skillName,
      fromUser: {
        id: request.receiver.id,
        name: request.receiver.name,
      },
      requestId: request.id,
      timeStamp: new Date(),
    });

    return updatedRequest;
  }

  async findIncoming(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: { receiver: { id: userId } },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async findOutgoing(userId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: { sender: { id: userId } },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, req: IRequestWithUser) {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: { sender: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (
      request.sender.id !== req.user.sub &&
      req.user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You are not authorized to delete this request',
      );
    }
    await this.requestsRepository.remove(request);
  }
}
