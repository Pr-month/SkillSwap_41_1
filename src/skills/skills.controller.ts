import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IRequestWithUser } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsQueryDto } from './dto/GetSkillsQueryDto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetSimilarUsersForSkill } from './swagger/skills.swagger';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: IRequestWithUser,
  ): Promise<Skill> {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Get()
  findAll(
    @Query() query: GetSkillsQueryDto,
  ): Promise<{ data: Skill[]; page: number; totalPages: number }> {
    return this.skillsService.findAll(query);
  }

  @Get(':id/similar')
  @ApiGetSimilarUsersForSkill()
  getSimilarUsersForSkill(@Param('id') id: string): Promise<User[]> {
    return this.skillsService.getSimilarUsersForSkill(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Skill | null> {
    return this.skillsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: IRequestWithUser,
  ): Promise<Skill | null> {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.skillsService.remove(id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/favorite')
  addToFavorite(
    @Param('id') id: string,
    @Req() req: IRequestWithUser,
  ): Promise<User> {
    return this.skillsService.addToFavorite(id, req.user.sub);
  }
}
