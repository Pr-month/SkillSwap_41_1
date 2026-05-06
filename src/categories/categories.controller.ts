import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiCreateCategory,
  ApiFindAllCategories,
  ApiRemoveCategory,
  ApiUpdateCategory,
} from './swagger/categories.swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // TODO: защита гардом? (ТЗ 1.5)
  @Post()
  @ApiCreateCategory()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiFindAllCategories()
  findAll() {
    return this.categoriesService.findAll();
  }

  // TODO: защита гардом? (ТЗ 1.5)
  @Patch(':id')
  @ApiUpdateCategory()
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // TODO: защита гардом? (ТЗ 1.5)
  @Delete(':id')
  @ApiRemoveCategory()
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
