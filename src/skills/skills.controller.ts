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
import { ApiTags } from '@nestjs/swagger';
import { IRequestWithUser } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { GetSkillsQueryDto } from './dto/GetSkillsQueryDto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import {
  ApiAddToFavoriteSkill,
  ApiCreateSkill,
  ApiFindAllSkills,
  ApiFindOneSkill,
  ApiRemoveSkill,
  ApiUpdateSkill,
} from './swagger/skills.swagger';
import { SkillsService } from './skills.service';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @ApiCreateSkill()
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: IRequestWithUser) {
    return this.skillsService.create(createSkillDto, req.user.sub);
  }

  @Get()
  @ApiFindAllSkills()
  findAll(@Query() query: GetSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiFindOneSkill()
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  @ApiUpdateSkill()
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: IRequestWithUser,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @ApiRemoveSkill()
  remove(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.skillsService.remove(id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/favorite')
  @ApiAddToFavoriteSkill()
  addToFavorite(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.skillsService.addToFavorite(id, req.user.sub);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id/favorite')
  removeFromFavorite(@Param('id') id: string, @Req() req: IRequestWithUser) {
    return this.skillsService.removeFromFavorite(id, req.user.sub);
  }
}
