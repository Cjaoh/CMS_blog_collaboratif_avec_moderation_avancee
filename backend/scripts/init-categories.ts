import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CategoriesService } from '../src/categories/categories.service';
import { CategoryStatus } from '../src/categories/schemas/category.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const categoriesService = app.get(CategoriesService);

  const defaultCategories = [
    {
      name: 'Entrées',
      slug: 'entrees',
      description: 'Plats d\'entrée et amuse-bouches',
      status: CategoryStatus.ACTIVE,
      sortOrder: 1,
      metaTitle: 'Recettes d\'entrées',
      metaDescription: 'Découvrez nos meilleures recettes d\'entrées et amuse-bouches'
    },
    {
      name: 'Plats principaux',
      slug: 'plats-principaux',
      description: 'Plats principaux chauds',
      status: CategoryStatus.ACTIVE,
      sortOrder: 2,
      metaTitle: 'Recettes de plats principaux',
      metaDescription: 'Plats principaux délicieux et variés'
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Desserts sucrés et pâtisseries',
      status: CategoryStatus.ACTIVE,
      sortOrder: 3,
      metaTitle: 'Recettes de desserts',
      metaDescription: 'Desserts maison faciles et rapides à réaliser'
    },
    {
      name: 'Boissons',
      slug: 'boissons',
      description: 'Cocktails, jus et autres boissons',
      status: CategoryStatus.ACTIVE,
      sortOrder: 4,
      metaTitle: 'Recettes de boissons',
      metaDescription: 'Recettes de boissons rafraîchissantes'
    },
    {
      name: 'Cuisine du monde',
      slug: 'cuisine-du-monde',
      description: 'Spécialités culinaires du monde entier',
      status: CategoryStatus.ACTIVE,
      sortOrder: 5,
      metaTitle: 'Cuisine internationale',
      metaDescription: 'Voyagez à travers les saveurs du monde'
    }
  ];

  try {
    for (const categoryData of defaultCategories) {
      // Vérifier si la catégorie existe déjà
      const existing = await categoriesService.findBySlug(categoryData.slug);
      if (!existing) {
        await categoriesService.create(categoryData);
        console.log(`Catégorie créée: ${categoryData.name}`);
      } else {
        console.log(`Catégorie déjà existante: ${categoryData.name}`);
      }
    }
    console.log('Initialisation des catégories terminée');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
