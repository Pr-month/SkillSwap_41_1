import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { RequestWithUser } from './skill.types';

@Controller('users')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  create(@Body() createSkillDto: CreateSkillDto, @Req() req: RequestWithUser) {
    return this.skillsService.create(createSkillDto, req.user.id);
  }
}
