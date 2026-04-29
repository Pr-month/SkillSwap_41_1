import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { IRequestWithUser } from '../auth/auth.types';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Get('incoming')
  getIncoming(@Req() req: IRequestWithUser) {
    // Incoming requests belong to the authenticated receiver.
    return this.requestsService.findIncoming(req.user.sub);
  }
}
