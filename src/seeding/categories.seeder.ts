import { DataSource, IsNull } from 'typeorm';
import { dbConfig } from '../config/db.config';
import { Category } from '../categories/entities/category.entity';
import { CategoriesData } from './categories.array';

export async function seedCategories() {
  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    const categoryRepository = dataSource.getRepository(Category);

    for (const item of CategoriesData) {
      const existingParent = await categoryRepository.findOne({
        where: { name: item.name, parent: IsNull() },
      });

      const parent =
        existingParent ??
        (await categoryRepository.save(
          categoryRepository.create({
            name: item.name,
            parent: null,
          }),
        ));

      for (const childName of item.children ?? []) {
        const existingChild = await categoryRepository.findOne({
          where: { name: childName, parent: { id: parent.id } },
          relations: { parent: true },
        });

        if (!existingChild) {
          await categoryRepository.save(
            categoryRepository.create({
              name: childName,
              parent,
            }),
          );
        }
      }
    }
  } finally {
    await dataSource.destroy();
  }
}

void seedCategories();
