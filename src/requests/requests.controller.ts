import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { IRequestWithUser } from '../auth/auth.types';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }
}
