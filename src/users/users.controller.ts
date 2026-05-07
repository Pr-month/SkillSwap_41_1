import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IRequestWithUser } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiFindAllUsers,
  ApiGetUser,
  ApiGetUserById,
  ApiUpdateUser,
} from './swagger/users.swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateUser()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiFindAllUsers()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiGetUser()
  getMe(@Req() req: IRequestWithUser) {
    return this.usersService.findOne(req.user.sub);
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
  @ApiDeleteUser()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
