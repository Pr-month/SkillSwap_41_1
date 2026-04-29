import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { IRequestWithUser } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Get('outgoing')
  getOutgoing(@Req() req: IRequestWithUser) {
    return this.requestsService.findOutgoing(req.user.sub);
  }
}
