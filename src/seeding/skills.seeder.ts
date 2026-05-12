import { DataSource } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { SkillsData } from './skills.array';
import { Skill } from '../skills/entities/skill.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

export async function seedSkills(dataSource: DataSource) {
  try {
    await dataSource.initialize();

    const skillRepository = dataSource.getRepository(Skill);
    const categoryRepository = dataSource.getRepository(Category);
    const userRepository = dataSource.getRepository(User);

    for (const skillData of SkillsData) {
      const existingSkill = await skillRepository.findOne({
        where: {
          title: skillData.title,
        },
      });

      if (existingSkill) {
        continue;
      }

      const category = await categoryRepository.findOne({
        where: {
          name: skillData.category,
        },
      });

      const owner = await userRepository.findOne({
        where: {
          email: skillData.ownerEmail,
        },
      });

      if (!category || !owner) {
        console.log(
          `Skill "${skillData.title}" skipped: category or owner not found`,
        );
        continue;
      }

      const newSkill = skillRepository.create({
        title: skillData.title,
        description: skillData.description,
        images: skillData.images,
        category,
        owner,
      });

      await skillRepository.save(newSkill);
    }

    console.log('Skills seeded successfully');
  } catch (error) {
    console.error('Error occurred while seeding skills:', error);
  } finally {
    await dataSource.destroy();
  }
}