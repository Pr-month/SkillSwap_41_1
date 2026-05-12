import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { IRequestWithUser } from '../auth/auth.types';
import { Skill } from '../skills/entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/enums/users.enums';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { IRequestWithUser } from '../auth/auth.types';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from './entities/request.entity';
import { UserRole } from '../users/entities/enums/users.enums';

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
    private readonly requestRepository: Repository<Request>,
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

    if (!sender) {
      throw new NotFoundException('Отправитель не найден');
    }

    if (!offeredSkill) {
      throw new NotFoundException('Предлагаемый навык не найден');
    }

    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
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

    return this.requestsRepository.findOneOrFail({
      where: { id: savedRequest.id },
      relations: this.requestRelations,
    });
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
    return this.requestsRepository.find({
      where: { receiver: { id: userId } },
      relations: this.requestRelations,
      order: { createdAt: 'DESC' },
    });
  }

  findOutgoing(userId: string) {
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
    await this.requestRepository.remove(request);
  }
}
