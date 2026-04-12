import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedDataService } from './seed-data';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const seedService = app.get(SeedDataService);
  
  try {
    await seedService.seedAll();
    console.log('Seeding terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  } finally {
    await app.close();
  }
}

runSeed();
