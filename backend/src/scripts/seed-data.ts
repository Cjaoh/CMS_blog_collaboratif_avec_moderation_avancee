import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from '../users/schemas/user.schema';
import { Article, ArticleStatus, ArticleFeatureStatus } from '../articles/schemas/article.schema';
import { Category, CategoryStatus } from '../categories/schemas/category.schema';
import { Comment, CommentStatus } from '../comments/schemas/comment.schema';

@Injectable()
export class SeedDataService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Article') private articleModel: Model<Article>,
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('Comment') private commentModel: Model<Comment>,
  ) {}

  async seedAll() {
    console.log('Début du seeding des données...');
    
    await this.seedUsers();
    await this.seedCategories();
    await this.seedArticles();
    await this.seedComments();
    
    console.log('Seeding des données terminé!');
  }

  private async seedUsers() {
    console.log('Création des utilisateurs...');
    
    const users = [
      {
        email: 'admin@recettes.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'System',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: 'Administrateur du système',
        specialties: ['Plats traditionnels', 'Pâtisserie'],
        articlesCount: 0
      },
      {
        email: 'chef.marie@recettes.com',
        password: await bcrypt.hash('chef123', 10),
        firstName: 'Marie',
        lastName: 'Dubois',
        role: UserRole.EDITOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: 'Chef professionnelle passionnée par la cuisine française',
        specialties: ['Cuisine française', 'Pâtisserie', 'Vin'],
        articlesCount: 0
      },
      {
        email: 'paul.cuisine@recettes.com',
        password: await bcrypt.hash('paul123', 10),
        firstName: 'Paul',
        lastName: 'Martin',
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: 'Amateur de cuisine et food blogger',
        specialties: ['Cuisine italienne', 'Desserts'],
        articlesCount: 0
      },
      {
        email: 'sophie.veggie@recettes.com',
        password: await bcrypt.hash('sophie123', 10),
        firstName: 'Sophie',
        lastName: 'Leroy',
        role: UserRole.AUTHOR,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        bio: 'Végétarienne passionnée et créative',
        specialties: ['Cuisine végétarienne', 'Bio', 'Sans gluten'],
        articlesCount: 0
      }
    ];

    for (const userData of users) {
      const existingUser = await this.userModel.findOne({ email: userData.email });
      if (!existingUser) {
        await this.userModel.create(userData);
        console.log(`Utilisateur créé: ${userData.email}`);
      }
    }
  }

  private async seedCategories() {
    console.log('Création des catégories...');
    
    const categories = [
      {
        name: 'Entrées',
        slug: 'entrees',
        description: 'Recettes de starters et apéritifs',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 1
      },
      {
        name: 'Plats principaux',
        slug: 'plats-principaux',
        description: 'Recettes complètes et équilibrées',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 2
      },
      {
        name: 'Desserts',
        slug: 'desserts',
        description: 'Pâtisseries et douceurs sucrées',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 3
      },
      {
        name: 'Boissons',
        slug: 'boissons',
        description: 'Cocktails, jus et boissons variées',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 4
      },
      {
        name: 'Végétarien',
        slug: 'vegetarien',
        description: 'Recettes sans viande',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 5
      },
      {
        name: 'Cuisine rapide',
        slug: 'cuisine-rapide',
        description: 'Recettes faciles et rapides à préparer',
        status: CategoryStatus.ACTIVE,
        articlesCount: 0,
        sortOrder: 6
      }
    ];

    for (const categoryData of categories) {
      const existingCategory = await this.categoryModel.findOne({ slug: categoryData.slug });
      if (!existingCategory) {
        await this.categoryModel.create(categoryData);
        console.log(`Catégorie créée: ${categoryData.name}`);
      }
    }
  }

  private async seedArticles() {
    console.log('Création des articles...');
    
    const users = await this.userModel.find().exec();
    const categories = await this.categoryModel.find().exec();
    
    if (users.length === 0 || categories.length === 0) {
      console.log('Impossible de créer des articles: pas d\'utilisateurs ou de catégories');
      return;
    }

    const articles = [
      {
        title: 'Ratatouille traditionnelle provençale',
        slug: 'ratatouille-traditionnelle-provencale',
        excerpt: 'Découvrez la recette authentique de la ratatouille, un plat méditerranéen plein de saveurs',
        content: `La ratatouille est un plat traditionnel de la cuisine provençale qui met en valeur les légumes du soleil. 

## Ingrédients
- 2 aubergines
- 3 courgettes  
- 4 tomates mûres
- 2 poivrons (1 rouge, 1 vert)
- 1 oignon
- 3 gousses d'ail
- Herbes de Provence
- Huile d'olive

## Préparation
1. Coupez tous les légumes en dés
2. Faites revenir l'oignon dans l'huile d'olive
3. Ajoutez les aubergines et les poivrons
4. Incorporez les courgettes et les tomates
5. Assaisonnez avec les herbes de Provence
6. Laissez mijoter pendant 30 minutes

Ce plat se déguste chaud ou froid, accompagné de pain frais.`,
        author: users[1]._id.toString(), // Chef Marie
        categories: [categories[1]._id.toString(), categories[4]._id.toString()], // Plats principaux, Végétarien
        tags: ['légumes', 'méditerranéen', 'traditionnel', 'été'],
        status: ArticleStatus.PUBLISHED,
        featureStatus: ArticleFeatureStatus.FEATURED,
        viewsCount: 1250,
        likesCount: 89,
        commentsCount: 12,
        allowComments: true,
        isPinned: true,
        readTimeMinutes: 25,
        publishedAt: new Date()
      },
      {
        title: 'Tiramisu maison facile',
        slug: 'tiramisu-maison-facile',
        excerpt: 'La recette du tiramisu italien classique, crémeux et délicieux',
        content: `Le tiramisu est le dessert italien par excellence. Voici une version facile à réaliser chez vous.

## Ingrédients
- 300g de biscuits à la cuillère
- 500g de mascarpone
- 4 jaunes d'oeufs
- 100g de sucre
- 3 blancs d'oeufs
- 300ml de café fort
- 50ml de Marsala ou Amaretto
- Cacao en poudre

## Préparation
1. Séparez les jaunes des blancs
2. Fouettez les jaunes avec le sucre
3. Ajoutez la mascarpone
4. Montez les blancs en neige et incorporez-les délicatement
5. Trempez les biscuits dans le café
6. Montez le tiramisu en couches
7. Saupoudrez de cacao avant de servir

Laissez reposer au moins 4 heures au réfrigérateur.`,
        author: users[2]._id.toString(), // Paul
        categories: [categories[2]._id.toString()], // Desserts
        tags: ['dessert', 'italien', 'café', 'crémeux'],
        status: ArticleStatus.PUBLISHED,
        featureStatus: ArticleFeatureStatus.TRENDING,
        viewsCount: 890,
        likesCount: 67,
        commentsCount: 8,
        allowComments: true,
        isPinned: false,
        readTimeMinutes: 20,
        publishedAt: new Date()
      },
      {
        title: 'Smoothie vert détox',
        slug: 'smoothie-vert-detox',
        excerpt: 'Un smoothie plein de vitamines pour bien commencer la journée',
        content: `Ce smoothie vert est parfait pour une cure détox ou pour faire le plein d'énergie le matin.

## Ingrédients
- 2 poires
- 1 concombre
- Une poignée d'épinards frais
- Le jus d'un citron
- 200ml d'eau de coco
- 1 cuillère de graines de chia

## Préparation
1. Lavez bien tous les ingrédients
2. Coupez les poires et le concombre en morceaux
3. Mixez tous les ingrédients ensemble
4. Ajoutez les graines de chia et laissez reposer 5 minutes

Buvez immédiatement pour profiter de tous les bienfaits!`,
        author: users[3]._id.toString(), // Sophie
        categories: [categories[3]._id.toString(), categories[4]._id.toString()], // Boissons, Végétarien
        tags: ['smoothie', 'détox', 'santé', 'vitamines'],
        status: ArticleStatus.PUBLISHED,
        featureStatus: ArticleFeatureStatus.NONE,
        viewsCount: 456,
        likesCount: 34,
        commentsCount: 5,
        allowComments: true,
        isPinned: false,
        readTimeMinutes: 5,
        publishedAt: new Date()
      },
      {
        title: 'Quiche lorraine rapide',
        slug: 'quiche-lorraine-rapide',
        excerpt: 'La recette classique de la quiche lorraine, facile et rapide',
        content: `Une recette indémodable de la cuisine française, parfaite pour un déjeuner ou un dîner léger.

## Ingrédients
- 1 pâte brisée
- 200g de lardons fumés
- 3 oeufs
- 300ml de crème liquide
- 100g de gruyère râpé
- Noix de muscade
- Sel, poivre

## Préparation
1. Préchauffez le four à 180°C
2. Faites revenir les lardons
3. Étalez la pâte dans un moule à tarte
4. Battez les oeufs avec la crème
5. Ajoutez les lardons et le fromage
6. Versez sur la pâte
7. Enfournez pour 30-35 minutes

Servez chaud avec une salade verte.`,
        author: users[1]._id.toString(), // Chef Marie
        categories: [categories[0]._id.toString(), categories[5]._id.toString()], // Entrées, Cuisine rapide
        tags: ['quiche', 'lorraine', 'rapide', 'fromage'],
        status: ArticleStatus.PUBLISHED,
        featureStatus: ArticleFeatureStatus.NONE,
        viewsCount: 678,
        likesCount: 45,
        commentsCount: 7,
        allowComments: true,
        isPinned: false,
        readTimeMinutes: 15,
        publishedAt: new Date()
      }
    ];

    for (const articleData of articles) {
      const existingArticle = await this.articleModel.findOne({ slug: articleData.slug });
      if (!existingArticle) {
        await this.articleModel.create(articleData);
        console.log(`Article créé: ${articleData.title}`);
      }
    }
  }

  private async seedComments() {
    console.log('Création des commentaires...');
    
    const users = await this.userModel.find().exec();
    const articles = await this.articleModel.find().exec();
    
    if (users.length === 0 || articles.length === 0) {
      console.log('Impossible de créer des commentaires: pas d\'utilisateurs ou d\'articles');
      return;
    }

    const comments = [
      {
        content: 'Excellent recette! J\'ai fait cette ratatouille hier soir et toute ma famille a adoré. Merci pour le partage!',
        author: users[2]._id.toString(), // Paul
        article: articles[0]._id.toString(), // Ratatouille
        status: CommentStatus.APPROVED,
        likesCount: 12,
        isEdited: false
      },
      {
        content: 'Le tiramisu est parfait! Juste le bon équilibre entre le café et la douceur. Je vais refaire ça pour le prochain anniversaire.',
        author: users[3]._id.toString(), // Sophie
        article: articles[1]._id.toString(), // Tiramisu
        status: CommentStatus.APPROVED,
        likesCount: 8,
        isEdited: false
      },
      {
        content: 'J\'ajoute toujours une touche de gingembre dans mon smoothie vert, ça donne un petit peps supplémentaire!',
        author: users[1]._id.toString(), // Chef Marie
        article: articles[2]._id.toString(), // Smoothie
        status: CommentStatus.APPROVED,
        likesCount: 15,
        isEdited: false
      },
      {
        content: 'Super rapide et délicieux! Parfait pour un soir où on n\'a pas beaucoup de temps.',
        author: users[2]._id.toString(), // Paul
        article: articles[3]._id.toString(), // Quiche
        status: CommentStatus.APPROVED,
        likesCount: 6,
        isEdited: false
      },
      {
        content: 'Peut-on remplacer la mascarpone par du fromage blanc pour une version plus légère?',
        author: users[3]._id.toString(), // Sophie
        article: articles[1]._id.toString(), // Tiramisu
        status: CommentStatus.APPROVED,
        likesCount: 4,
        isEdited: false
      }
    ];

    for (const commentData of comments) {
      const existingComment = await this.commentModel.findOne({
        content: commentData.content
      });
      if (!existingComment) {
        await this.commentModel.create(commentData);
        console.log('Commentaire créé');
      }
    }
  }
}
