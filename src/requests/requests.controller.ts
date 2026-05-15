import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { IRequestWithUser } from '../auth/auth.types';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateRequest,
  ApiGetAllRequests,
  ApiGetOutgoingRequests,
  ApiGetIncomingRequests,
  ApiGetRequestById,
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

  @Get()
  @ApiGetAllRequests()
  findAll() {
    return this.requestsService.findAll();
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

  @Get(':id')
  @ApiGetRequestById()
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
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
    return { message: 'Заявка успешно удалена' };
  }
}
