import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus, UserDocument } from '../users/schemas/user.schema';
import { Article, ArticleStatus, ArticleDocument } from '../articles/schemas/article.schema';
import { Category, CategoryStatus, CategoryDocument } from '../categories/schemas/category.schema';
import { Comment, CommentStatus, CommentDocument } from '../comments/schemas/comment.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedDataService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async cleanDatabase() {
    await this.userModel.deleteMany({});
    await this.articleModel.deleteMany({});
    await this.categoryModel.deleteMany({});
    await this.commentModel.deleteMany({});
    console.log('Database cleaned');
  }

  async seedUsers() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Rakoto Andrianaina',
        email: 'rakoto.admin@recettes.mg',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        bio: 'Administrateur principal de la plateforme des recettes malgaches',
        specialties: ['Gestion', 'Cuisine malgache traditionnelle']
      },
      {
        name: 'Rasolofonirina Nomenjanahary',
        email: 'chef.rasolo@recettes.mg',
        password: hashedPassword,
        role: UserRole.EDITOR,
        status: UserStatus.ACTIVE,
        bio: 'Chef professionnel specialise dans la cuisine malgache',
        specialties: ['Romazava', 'Ravitoto', 'Akoho sy voanio']
      },
      {
        name: 'Rabevoalanto Zo',
        email: 'zo.rabe@recettes.mg',
        password: hashedPassword,
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        bio: 'Passionne de cuisine malgache et partageur de recettes familiales',
        specialties: ['Mofo gasy', 'Koba', 'Sambos']
      },
      {
        name: 'Razafindrakoto Mialy',
        email: 'mialy.razafi@recettes.mg',
        password: hashedPassword,
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        bio: 'Mere de famille experte en plats malgaches quotidiens',
        specialties: ['Vary amin anana', 'Lasary', 'Achard']
      },
      {
        name: 'Randrianarisoa Jean',
        email: 'jean.randria@recettes.mg',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: 'Amateur de bonne cuisine malgache',
        specialties: ['Cuisine malgache']
      },
      {
        name: 'Razanamanana Soa',
        email: 'soa.razana@recettes.mg',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: 'Passionne de decouverte de nouvelles recettes',
        specialties: ['Recettes nouvelles']
      },
      {
        name: 'Andriamampianina Lala',
        email: 'lala.andria@recettes.mg',
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        bio: 'Etudiant amateur de cuisine',
        specialties: ['Cuisine etudiante']
      }
    ];

    const createdUsers = await this.userModel.insertMany(users);
    console.log('Users created:', createdUsers.length);
    return createdUsers;
  }

  async seedCategories() {
    const categories = [
      {
        name: 'Plats Principaux',
        slug: 'plats-principaux',
        description: 'Plats principaux traditionnels malgaches',
        status: CategoryStatus.ACTIVE
      },
      {
        name: 'Accompagnements',
        slug: 'accompagnements',
        description: 'Riz, legumes et accompagnements varies',
        status: CategoryStatus.ACTIVE
      },
      {
        name: 'Snacks et Petits-dejeuners',
        slug: 'snacks-petits-dejeuners',
        description: 'Mofo gasy, koba et autres specialites',
        status: CategoryStatus.ACTIVE
      },
      {
        name: 'Sauces et Condiments',
        slug: 'sauces-condiments',
        description: 'Lasary, achard et autres condiments',
        status: CategoryStatus.ACTIVE
      },
      {
        name: 'Boissons',
        slug: 'boissons',
        description: 'Boissons traditionnelles malgaches',
        status: CategoryStatus.ACTIVE
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        description: 'Desserts malgaches traditionnels',
        status: CategoryStatus.ACTIVE
      }
    ];

    const createdCategories = await this.categoryModel.insertMany(categories);
    console.log('Categories created:', createdCategories.length);
    return createdCategories;
  }

  async seedRecipes(users: UserDocument[], categories: CategoryDocument[]) {
    const recipes = [
      {
        title: 'Romazava',
        slug: 'romazava',
        content: `Le romazava est le plat national de Madagascar. C\'est une soupe a base de bredis et de viande.

## Ingrédients
- 500g de viande de bœuf
- 200g de bredis mafana
- 100g de bredis morelle
- 1 oignon
- 2 gousses d\'ail
- Tomates
- Huile de palme

## Préparation
1. Couper la viande en morceaux
2. Faire revenir l\'oignon et l\'ail
3. Ajouter la viande et dorer
4. Incorporer les bredis
5. Laisser mijoter 45 minutes`,
        author: users[1]._id,
        categories: [categories[0]._id],
        tags: ['plat national', 'bredis', 'viande'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 245,
        likes: [users[4]._id, users[5]._id],
        ingredients: [
          { name: 'Viande de bœuf', quantity: '500', unit: 'g' },
          { name: 'Bredis mafana', quantity: '200', unit: 'g' },
          { name: 'Bredis morelle', quantity: '100', unit: 'g' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Ail', quantity: '2', unit: 'gousses' },
          { name: 'Tomates', quantity: '2', unit: 'pièces' },
          { name: 'Huile de palme', quantity: '3', unit: 'c.à.s.' }
        ],
        steps: [
          'Couper la viande en morceaux de taille moyenne',
          'Emincer l\'oignon et hacher l\'ail',
          'Faire chauffer l\'huile dans une marmite',
          'Faire revenir l\'oignon et l\'ail pendant 3 minutes',
          'Ajouter la viande et la dorer sur tous les cotes',
          'Laver et couper les bredis',
          'Incorporer les bredis dans la marmite',
          'Ajouter de l\'eau chaude et laisser mijoter 45 minutes',
          'Saler et poivrer selon le gout'
        ],
        cookingTimeMinutes: 45,
        preparationTimeMinutes: 15,
        servings: 6
      },
      {
        title: 'Ravitoto',
        slug: 'ravitoto',
        content: `Le ravitoto est un plat a base de feuilles de manioc pilees avec de la viande de porc.

## Ingrédients
- 300g de feuilles de manioc pilees
- 500g de viande de porc
- 1 oignon
- Ail
- Huile

## Préparation
1. Faire bouillir les feuilles de manioc
2. Cuire la viande separement
3. Melanger et assaisonner`,
        author: users[2]._id,
        categories: [categories[0]._id, categories[1]._id],
        tags: ['manioc', 'porc', 'traditionnel'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 189,
        likes: [users[5]._id, users[6]._id],
        ingredients: [
          { name: 'Feuilles de manioc pilees', quantity: '300', unit: 'g' },
          { name: 'Viande de porc', quantity: '500', unit: 'g' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Ail', quantity: '3', unit: 'gousses' },
          { name: 'Huile', quantity: '2', unit: 'c.à.s.' }
        ],
        steps: [
          'Laver les feuilles de manioc pilees',
          'Les faire bouillir pendant 20 minutes',
          'Couper la viande de porc en morceaux',
          'Faire cuire la viande dans une poele',
          'Ajouter les feuilles de manioc cuites',
          'Melanger et assaisonner',
          'Laisser mijoter 10 minutes'
        ],
        cookingTimeMinutes: 30,
        preparationTimeMinutes: 10,
        servings: 4
      },
      {
        title: 'Akoho sy voanio',
        slug: 'akoho-sy-voanio',
        content: `Poulet au coco, un plat cremeux et parfume de Madagascar.

## Ingrédients
- 1 poulet entier
- 400ml de lait de coco
- 2 oignons
- Ail
- Gingembre
- Curry

## Préparation
1. Couper le poulet en morceaux
2. Faire mariner avec epices
3. Faire dorer
4. Ajouter le lait de coco
5. Laisser mijoter`,
        author: users[1]._id,
        categories: [categories[0]._id],
        tags: ['poulet', 'coco', 'curry'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 312,
        likes: [users[4]._id, users[5]._id, users[6]._id],
        ingredients: [
          { name: 'Poulet entier', quantity: '1', unit: 'pièce' },
          { name: 'Lait de coco', quantity: '400', unit: 'ml' },
          { name: 'Oignons', quantity: '2', unit: 'pièces' },
          { name: 'Ail', quantity: '4', unit: 'gousses' },
          { name: 'Gingembre', quantity: '2', unit: 'cm' },
          { name: 'Curry', quantity: '2', unit: 'c.à.c.' }
        ],
        steps: [
          'Couper le poulet en 8 morceaux',
          'Preparer la marinade avec oignon, ail, gingembre et curry',
          'Laisser mariner le poulet 2 heures',
          'Faire dorer les morceaux de poulet',
          'Ajouter le lait de coco',
          'Laisser mijoter a feu doux 30 minutes',
          'Servir avec du riz blanc'
        ],
        cookingTimeMinutes: 30,
        preparationTimeMinutes: 15,
        servings: 6
      },
      {
        title: 'Mofo gasy',
        slug: 'mofo-gasy',
        content: `Petits pains malgaches cuits a la vapeur, parfaits pour le petit-dejeuner.

## Ingrédients
- 500g de farine de riz
- 250ml d\'eau tiede
- 1 sachet de levure
- Sucre
- Sel

## Préparation
1. Delayer la levure
2. Preparer la pate
3. Laisser lever
4. Cuire a la vapeur`,
        author: users[2]._id,
        categories: [categories[2]._id],
        tags: ['petit-dejeuner', 'riz', 'vapeur'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 156,
        likes: [users[4]._id, users[5]._id],
        ingredients: [
          { name: 'Farine de riz', quantity: '500', unit: 'g' },
          { name: 'Eau tiede', quantity: '250', unit: 'ml' },
          { name: 'Levure', quantity: '1', unit: 'sachet' },
          { name: 'Sucre', quantity: '2', unit: 'c.à.s.' },
          { name: 'Sel', quantity: '1', unit: 'c.à.c.' }
        ],
        steps: [
          'Delayer la levure dans l\'eau tiede avec le sucre',
          'Ajouter la farine de riz petit a petit',
          'Melanger jusqu\'a obtenir une pate lisse',
          'Ajouter le sel et melanger',
          'Laisser lever 1 heure',
          'Verser la pate dans les moules a mofo',
          'Cuire a la vapeur 15 minutes'
        ],
        cookingTimeMinutes: 15,
        preparationTimeMinutes: 75,
        servings: 20
      },
      {
        title: 'Lasary voatabia',
        slug: 'lasary-voatabia',
        content: `Salade de tomates malgache, un accompagnement rafraichissant.

## Ingrédients
- 4 tomates
- 1 oignon
- Herbes aromatiques
- Vinaigre
- Huile
- Sel

## Préparation
1. Couper les tomates
2. Ajouter l\'oignon emince
3. Assaisonner
4. Laisser reposer`,
        author: users[3]._id,
        categories: [categories[3]._id],
        tags: ['salade', 'tomates', 'accompagnement'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 98,
        likes: [users[6]._id],
        ingredients: [
          { name: 'Tomates', quantity: '4', unit: 'pièces' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Herbes aromatiques', quantity: '1', unit: 'botte' },
          { name: 'Vinaigre', quantity: '2', unit: 'c.à.s.' },
          { name: 'Huile', quantity: '3', unit: 'c.à.s.' },
          { name: 'Sel', quantity: '1', unit: 'c.à.c.' }
        ],
        steps: [
          'Laver les tomates',
          'Les couper en des',
          'Emincer finement l\'oignon',
          'Hacher les herbes aromatiques',
          'Melanger tomates, oignon et herbes',
          'Ajouter vinaigre, huile et sel',
          'Laisser reposer 30 minutes avant de servir'
        ],
        cookingTimeMinutes: 0,
        preparationTimeMinutes: 15,
        servings: 4
      },
      {
        title: 'Vary amin anana',
        slug: 'vary-aminanana',
        content: `Riz aux bredis, plat quotidien tres apprecie a Madagascar.

## Ingrédients
- 300g de riz
- 200g de bredis
- 1 oignon
- Ail
- Huile

## Préparation
1. Cuire le riz
2. Preparer les bredis
3. Melanger le tout`,
        author: users[3]._id,
        categories: [categories[1]._id],
        tags: ['riz', 'bredis', 'quotidien'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 167,
        likes: [users[4]._id, users[5]._id],
        ingredients: [
          { name: 'Riz', quantity: '300', unit: 'g' },
          { name: 'Bredis', quantity: '200', unit: 'g' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Ail', quantity: '2', unit: 'gousses' },
          { name: 'Huile', quantity: '2', unit: 'c.à.s.' }
        ],
        steps: [
          'Laver et cuire le riz',
          'Laver et hacher les bredis',
          'Faire revenir l\'oignon et l\'ail',
          'Ajouter les bredis et cuire 10 minutes',
          'Melanger avec le riz cuit',
          'Assaisonner selon le gout'
        ],
        cookingTimeMinutes: 20,
        preparationTimeMinutes: 10,
        servings: 4
      },
      {
        title: 'Koba',
        slug: 'koba',
        content: `Gateau traditionnel malgache a base de farine de riz et de banane.

## Ingrédients
- 300g de farine de riz
- 4 bananes mures
- Sucre
- Lait de coco
- Arachides

## Préparation
1. Ecraser les bananes
2. Melanger les ingredients
3. Envelopper dans les feuilles
4. Cuire a la vapeur`,
        author: users[2]._id,
        categories: [categories[5]._id],
        tags: ['dessert', 'banane', 'traditionnel'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 134,
        likes: [users[5]._id, users[6]._id],
        ingredients: [
          { name: 'Farine de riz', quantity: '300', unit: 'g' },
          { name: 'Bananes mures', quantity: '4', unit: 'pièces' },
          { name: 'Sucre', quantity: '100', unit: 'g' },
          { name: 'Lait de coco', quantity: '200', unit: 'ml' },
          { name: 'Arachides', quantity: '50', unit: 'g' }
        ],
        steps: [
          'Ecraser les bananes en puree',
          'Ajouter la farine de riz et le sucre',
          'Incorporer le lait de coco',
          'Ajouter les arachides concassees',
          'Melanger jusqu\'a obtenir une pate homogene',
          'Envelopper dans les feuilles de bananier',
          'Cuire a la vapeur 2 heures'
        ],
        cookingTimeMinutes: 120,
        preparationTimeMinutes: 20,
        servings: 8
      },
      {
        title: 'Sambos',
        slug: 'sambos',
        content: `Beignets fourres malgaches, parfaits pour l\'apéritif.

## Ingrédients
- 300g de farine
- 1 œuf
- Viande hachee
- Oignon
- Epices
- Huile

## Préparation
1. Preparer la pate
2. Faire la farce
3. Former les sambos
4. Frire`,
        author: users[2]._id,
        categories: [categories[2]._id],
        tags: ['beignet', 'viande', 'friture'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 201,
        likes: [users[4]._id, users[6]._id],
        ingredients: [
          { name: 'Farine', quantity: '300', unit: 'g' },
          { name: 'Œuf', quantity: '1', unit: 'pièce' },
          { name: 'Viande hachee', quantity: '200', unit: 'g' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Epices', quantity: '2', unit: 'c.à.c.' },
          { name: 'Huile', quantity: '1', unit: 'litre' }
        ],
        steps: [
          'Preparer la pate avec farine, œuf et eau',
          'Faire revenir la viande avec oignon et epices',
          'Laisser refroidir la farce',
          'Etaler la pate et decouper des ronds',
          'Deposer la farce au centre',
          'Humecter les bords et fermer les sambos',
          'Frire dans l\'huile chaude'
        ],
        cookingTimeMinutes: 10,
        preparationTimeMinutes: 45,
        servings: 15
      },
      {
        title: 'Achard de legumes',
        slug: 'achard-legumes',
        content: `Legumes pickles malgaches, accompagnement acidule et parfume.

## Ingrédients
- 2 carottes
- 1 chou blanc
- 1 oignon
- Vinaigre
- Curcuma
- Sel

## Préparation
1. Couper les legumes
2. Preparer la saumure
3. Laisser mariner`,
        author: users[3]._id,
        categories: [categories[3]._id],
        tags: ['pickles', 'legumes', 'vinaigre'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 89,
        likes: [users[5]._id],
        ingredients: [
          { name: 'Carottes', quantity: '2', unit: 'pièces' },
          { name: 'Chou blanc', quantity: '1', unit: 'pièce' },
          { name: 'Oignon', quantity: '1', unit: 'pièce' },
          { name: 'Vinaigre', quantity: '500', unit: 'ml' },
          { name: 'Curcuma', quantity: '1', unit: 'c.à.c.' },
          { name: 'Sel', quantity: '2', unit: 'c.à.c.' }
        ],
        steps: [
          'Laver et couper les legumes en fines lamelles',
          'Faire chauffer le vinaigre avec le sel et le curcuma',
          'Verser la saumure chaude sur les legumes',
          'Melanger bien',
          'Laisser refroidir',
          'Transférer dans un bocal hermetique',
          'Laisser mariner 24 heures avant de consommer'
        ],
        cookingTimeMinutes: 0,
        preparationTimeMinutes: 30,
        servings: 6
      },
      {
        title: 'Jus de canne a sucre',
        slug: 'jus-canne-sucre',
        content: `Boisson traditionnelle rafraichissante de Madagascar.

## Ingrédients
- 2 cannes a sucre
- Glace
- Citron (optionnel)

## Préparation
1. Eplucher les cannes
2. Presser
3. Servir frais`,
        author: users[2]._id,
        categories: [categories[4]._id],
        tags: ['boisson', 'sucre', 'frais'],
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        viewsCount: 67,
        likes: [users[6]._id],
        ingredients: [
          { name: 'Canne a sucre', quantity: '2', unit: 'pièces' },
          { name: 'Glace', quantity: '10', unit: 'cubes' },
          { name: 'Citron', quantity: '1', unit: 'pièce' }
        ],
        steps: [
          'Couper et eplucher les cannes a sucre',
          'Les passer dans le pressoir',
          'Filtrer le jus obtenu',
          'Ajouter du jus de citron si desire',
          'Servir avec des glaçons'
        ],
        cookingTimeMinutes: 0,
        preparationTimeMinutes: 15,
        servings: 2
      }
    ];

    const createdRecipes = await this.articleModel.insertMany(recipes);
    console.log('Recipes created:', createdRecipes.length);
    return createdRecipes;
  }

  async seedComments(users: UserDocument[], recipes: ArticleDocument[]) {
    const comments = [
      {
        content: 'Excellent romazava ! J\'ai suivi la recette et c\'etait delicieux.',
        author: users[4]._id,
        article: recipes[0]._id,
        status: CommentStatus.APPROVED
      },
      {
        content: 'Merci pour cette recette de ravitoto. Ma famille a adore !',
        author: users[5]._id,
        article: recipes[1]._id,
        status: CommentStatus.APPROVED
      },
      {
        content: 'Le mofo gasy est parfait pour le petit-dejeuner. Tres bonne recette.',
        author: users[6]._id,
        article: recipes[3]._id,
        status: CommentStatus.APPROVED
      }
    ];

    const createdComments = await this.commentModel.insertMany(comments);
    console.log('Comments created:', createdComments.length);
    return createdComments;
  }

  async seedAll() {
    await this.cleanDatabase();
    
    const users = await this.seedUsers();
    const categories = await this.seedCategories();
    const recipes = await this.seedRecipes(users, categories);
    const comments = await this.seedComments(users, recipes);
    
    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Admin:', users[0].email, '/ password123');
    console.log('Editor:', users[1].email, '/ password123');
    console.log('Author 1:', users[2].email, '/ password123');
    console.log('Author 2:', users[3].email, '/ password123');
    console.log('User 1:', users[4].email, '/ password123');
    console.log('User 2:', users[5].email, '/ password123');
    console.log('User 3:', users[6].email, '/ password123');
    
    return { users, categories, recipes, comments };
  }
}
