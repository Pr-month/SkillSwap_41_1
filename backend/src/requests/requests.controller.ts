import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { IRequestWithUser } from '../auth/auth.types';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateRequest,
  ApiGetOutgoingRequests,
  ApiGetIncomingRequests,
  ApiUpdateRequest,
  ApiDeleteRequest,
} from './swagger/requests.swagger';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiCreateRequest()
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Get('outgoing')
  @ApiGetOutgoingRequests()
  getOutgoing(@Req() req: IRequestWithUser) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Get('incoming')
  @ApiGetIncomingRequests()
  getIncoming(@Req() req: IRequestWithUser) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @ApiUpdateRequest()
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.requestsService.update(id, updateRequestDto, req);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @ApiDeleteRequest()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: IRequestWithUser) {
    await this.requestsService.remove(id, req);
  }
}
