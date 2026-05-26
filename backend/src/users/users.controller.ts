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
  Post,
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
  ApiUpdatePassword,
  ApiUpdateUser,
} from './swagger/users.swagger';
import { IRequestWithUser } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/enums/users.enums';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';

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
  getMe(@Req() req: IRequestWithUser): Promise<User | null> {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  @ApiGetUserById()
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  @ApiUpdateUser()
  update(
    @Req() req: IRequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
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

  // categories
  @UseGuards(AccessTokenGuard)
  @Get('me/want-to-learn')
  findAllCategories(@Req() req: IRequestWithUser): Promise<Category[] | null> {
    return this.usersService.findAllCategories(req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post('me/want-to-learn/:categoryId')
  createCategory(
    @Req() req: IRequestWithUser,
    @Param('categoryId') categoryId: string,
  ): Promise<User | null> {
    return this.usersService.createCategory(req.user.sub, categoryId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('me/want-to-learn/:categoryId')
  // @ApiDeleteCategory() нужен будет свагер
  async removeCategory(
    @Req() req: IRequestWithUser,
    @Param('categoryId') categoryId: string,
  ) {
    await this.usersService.removeCategory(req.user.sub, categoryId);
  }
  @UseGuards(AccessTokenGuard)
  @Patch('me/password')
  @ApiUpdatePassword()
  async findAllLearnedCategories(
    @Req() req: IRequestWithUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(req.user.sub, updatePasswordDto);
  }
}
