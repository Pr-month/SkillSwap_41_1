import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiDeleteUser,
  ApiFindAllUsers,
  ApiGetUser,
  ApiGetUserById,
  ApiUpdateUser,
} from './swagger/users.swagger';
import { IRequestWithUser } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/enums/users.enums';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiFindAllUsers()
  findAll(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiGetUser()
  getMe(@Req() req: IRequestWithUser) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  @ApiGetUserById()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  @ApiUpdateUser()
  update(@Req() req: IRequestWithUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.sub, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiDeleteUser()
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }
}
