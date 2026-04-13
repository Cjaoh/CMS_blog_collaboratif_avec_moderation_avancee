import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ArticlesService } from '../shared/services/articles.service';
import { CategoriesService } from '../shared/services/categories.service';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { Article, Activity, ModerationStats } from '../shared/models/article.model';
import { User } from '../shared/models/user.model';
import { interval, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { DestroyRef, ChangeDetectorRef } from '@angular/core';

interface Stats {
  publishedArticles: number;
  activeAuthors: number;
  monthlyReaders: number;
  qualityRate: number;
}

interface Category {
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private articlesService = inject(ArticlesService);
  private categoriesService = inject(CategoriesService);
  private userService = inject(UserService);
  public authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  loading = true;
  featuredArticles: Article[] = [];
  recentActivity: Activity[] = [];
  topAuthors: User[] = [];
  moderationStats: ModerationStats = {
    published: 0,
    pending: 0,
    rejected: 0,
    total: 0
  };
  stats: Stats = {
    publishedArticles: 0,
    activeAuthors: 0,
    monthlyReaders: 0,
    qualityRate: 0
  };
  categories: Category[] = [
    { name: 'Entrées', icon: '🥗', count: 0 },
    { name: 'Plats', icon: '🍖', count: 0 },
    { name: 'Desserts', icon: '🍰', count: 0 },
    { name: 'Cuisine du monde', icon: '🌍', count: 0 }
  ];

  ngOnInit(): void {
    // Charger les données mockées immédiatement pour l'affichage
    this.loadMockData();
    
    // Essayer de charger les données réelles en arrière-plan
    this.loadData();
    
    // Rafraîchir l'activité toutes les 30 secondes
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadRecentActivity();
      });
  }

  private loadMockData(): void {
    // Charger les articles mockés
    this.featuredArticles = this.getMockFeaturedArticles();
    this.recentActivity = this.getMockRecentActivity();
    this.categories = this.getMockCategories();
    this.stats = this.getMockStats();
    
    if (this.authService.isModerator) {
      this.moderationStats = this.getMockModerationStats();
    }
    
    this.loading = false;
    // Forcer la détection de changement après la mise à jour des données
    this.cdr.detectChanges();
  }

  private getMockStats(): any {
    return {
      published: 156,
      activeUsers: 89,
      readers: 1247,
      qualityRate: 92
    };
  }

  private getMockRecentActivity(): Activity[] {
    return [
      {
        type: 'approved',
        user: { _id: 'u1', firstName: 'Marie', lastName: 'Dubois' },
        article: { _id: 'a1', title: 'Risotto aux Champignons' },
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        badge: 'Publiée'
      },
      {
        type: 'approved',
        user: { _id: 'u2', firstName: 'Pierre', lastName: 'Martin' },
        article: { _id: 'a2', title: 'Tarte Tatin' },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        badge: 'Approuvée'
      },
      {
        type: 'commented',
        user: { _id: 'u3', firstName: 'Sophie', lastName: 'Leroy' },
        article: { _id: 'a3', title: 'Saumon Teriyaki' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        badge: 'Commentée'
      },
      {
        type: 'approved',
        user: { _id: 'u4', firstName: 'Luc', lastName: 'Bernard' },
        article: { _id: 'a4', title: 'Salade Méditerranéenne' },
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        badge: 'Publiée'
      }
    ];
  }

  private getMockCategories(): any[] {
    return [
      { name: 'Entrées', icon: 'salad', count: 28 },
      { name: 'Plats', icon: 'dinner_dining', count: 67 },
      { name: 'Desserts', icon: 'cake', count: 34 },
      { name: 'Cuisine du monde', icon: 'public', count: 27 }
    ];
  }

  private getMockTopAuthors(): User[] {
    return [
      {
        _id: 'u1',
        firstName: 'Marie',
        lastName: 'Dubois',
        email: 'marie@example.com',
        role: 'author' as any,
        status: 'active' as any,
        articlesCount: 23,
        level: 'Expert',
        specialties: ['cuisine française'],
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'u2',
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre@example.com',
        role: 'author' as any,
        status: 'active' as any,
        articlesCount: 18,
        level: 'Avancé',
        specialties: ['cuisine italienne'],
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'u3',
        firstName: 'Sophie',
        lastName: 'Leroy',
        email: 'sophie@example.com',
        role: 'author' as any,
        status: 'active' as any,
        articlesCount: 15,
        level: 'Intermédiaire',
        specialties: ['cuisine végétarienne'],
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getMockModerationStats(): ModerationStats {
    return {
      published: 156,
      pending: 12,
      rejected: 8,
      total: 176
    };
  }

  private loadData(): void {
    this.loading = true;
    
    // Charger toutes les données en parallèle
    this.articlesService.getFeaturedArticles().subscribe({
      next: (articles) => {
        this.featuredArticles = articles;
        this.updateCategoryCounts();
      },
      error: () => {
        this.featuredArticles = this.getMockFeaturedArticles();
        this.updateCategoryCounts();
      }
    });

    this.loadRecentActivity();

    this.userService.getTopAuthors().subscribe({
      next: (authors: User[]) => {
        this.topAuthors = authors;
        this.stats.activeAuthors = authors.length;
      },
      error: () => {
        this.topAuthors = this.getMockTopAuthors();
        this.stats.activeAuthors = this.topAuthors.length;
      }
    });

    // Simuler les stats (à remplacer par de vrais appels API)
    this.stats = {
      publishedArticles: 156,
      activeAuthors: 42,
      monthlyReaders: 2847,
      qualityRate: 94
    };

    this.loading = false;
  }

  private loadRecentActivity(): void {
    this.articlesService.getRecentActivity().subscribe({
      next: (activities) => {
        this.recentActivity = activities.slice(0, 4);
      },
      error: () => {
        this.recentActivity = this.getMockRecentActivity();
      }
    });
  }

  private updateCategoryCounts(): void {
    // Compter les articles par catégorie
    const categoryCounts: { [key: string]: number } = {};
    
    this.featuredArticles.forEach(article => {
      article.categories.forEach(category => {
        const categoryName = this.mapCategoryName(category.name);
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });
    });

    this.categories.forEach(category => {
      category.count = categoryCounts[category.name] || Math.floor(Math.random() * 50) + 10;
    });
  }

  private mapCategoryName(categoryName: string): string {
    const mapping: { [key: string]: string } = {
      'appetizers': 'Entrées',
      'starters': 'Entrées',
      'main-courses': 'Plats',
      'mains': 'Plats',
      'desserts': 'Desserts',
      'international': 'Cuisine du monde',
      'world-cuisine': 'Cuisine du monde'
    };
    return mapping[categoryName.toLowerCase()] || categoryName;
  }

  // TrackBy functions pour performance
  trackByActivityId(index: number, activity: Activity): string {
    return `${activity.user._id}-${activity.article._id}-${activity.timestamp}`;
  }

  trackByArticleId(index: number, article: Article): string {
    return article._id;
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.name;
  }

  // Helper functions pour l'affichage
  getActivityEmoji(type: string): string {
    const emojis: { [key: string]: string } = {
      submitted: '📝',
      approved: '✅',
      rejected: '❌',
      commented: '💬'
    };
    return emojis[type] || '📄';
  }

  getActivityIconClass(type: string): string {
    return type;
  }

  getActivityBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      submitted: 'badge-pending',
      approved: 'badge-published',
      rejected: 'badge-rejected',
      commented: 'badge-commented'
    };
    return classes[type] || 'badge-default';
  }

  getActivityText(type: string): string {
    const texts: { [key: string]: string } = {
      submitted: 'a soumis',
      approved: 'a approuvé',
      rejected: 'a rejeté',
      commented: 'a commenté sur'
    };
    return texts[type] || 'a modifié';
  }

  getArticleEmoji(article: Article): string {
    const categoryEmojis: { [key: string]: string } = {
      'entrées': '🥗',
      'plats': '🍖',
      'desserts': '🍰',
      'cuisine du monde': '🌍'
    };
    
    const categoryName = article.categories[0]?.name.toLowerCase();
    for (const [key, emoji] of Object.entries(categoryEmojis)) {
      if (categoryName.includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '🍽️';
  }

  getCategoryColorClass(categoryName?: string): string {
    if (!categoryName) return '';
    
    const name = categoryName.toLowerCase();
    if (name.includes('entr') || name.includes('appetiz') || name.includes('start')) return 'entrées';
    if (name.includes('plat') || name.includes('main')) return 'plats';
    if (name.includes('dessert') || name.includes('sweet')) return 'desserts';
    if (name.includes('monde') || name.includes('world') || name.includes('international')) return 'cuisine-du-monde';
    
    return '';
  }

  getRating(article: Article): number {
    // Calculer la note moyenne (likes + commentaires / vues)
    if (article.viewsCount === 0) return 0;
    const engagement = (article.likesCount + article.commentsCount) / article.viewsCount;
    return Math.min(5, Math.round(engagement * 20) / 10); // Note sur 5
  }

  formatTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `il y a ${diffHours}h`;
    
    return time.toLocaleDateString('fr-FR');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Mock data pour le développement
  private getMockFeaturedArticles(): Article[] {
    return this.getMockArticles();
  }

  private getMockArticles(): Article[] {
    return [
      {
        _id: '1',
        title: 'Risotto aux Champignons Sauvages',
        slug: 'risotto-champignons',
        excerpt: 'Un risotto crémeux et parfumé avec des champignons des bois',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>300g de riz Arborio</li>
            <li>500g de champignons des bois (cèpes, girolles)</li>
            <li>1 oignon</li>
            <li>2 gousses d'ail</li>
            <li>1L de bouillon de volaille</li>
            <li>100ml de vin blanc sec</li>
            <li>50g de parmesan râpé</li>
            <li>30g de beurre</li>
            <li>Persil frais</li>
            <li>Sel et poivre</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Nettoyer et couper les champignons en lamelles</li>
            <li>Faire revenir l'oignon haché dans le beurre</li>
            <li>Ajouter les champignons et cuire 5 minutes</li>
            <li>Ajouter le riz et le remuer 2 minutes jusqu'à ce qu'il devienne translucide</li>
            <li>Verser le vin blanc et laisser évaporer</li>
            <li>Ajouter le bouillon chaud louche par louche en remuant constamment</li>
            <li>Cuire 18-20 minutes jusqu'à ce que le riz soit crémeux</li>
            <li>Hors du feu, ajouter le parmesan et le persil</li>
            <li>Servir immédiatement</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 15 minutes<br>Cuisson: 25 minutes</p>
        `,
        author: { _id: 'a1', firstName: 'Marie', lastName: 'Dubois', avatar: 'https://picsum.photos/seed/marie/100/100' },
        categories: [{ _id: 'c1', name: 'Plats principaux', slug: 'plats-principaux' }],
        tags: ['risotto', 'champignons', 'italien'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 1250,
        likesCount: 89,
        commentsCount: 23,
        images: ['https://picsum.photos/seed/risotto/800/600'],
        featuredImage: 'https://picsum.photos/seed/risotto/800/600',
        metaTitle: 'Risotto aux Champignons Sauvages',
        metaDescription: 'Recette italienne traditionnelle avec des champignons des bois',
        metaKeywords: ['risotto', 'champignons', 'italien', 'cuisine'],
        publishedAt: new Date('2024-01-15').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 25,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        _id: '2',
        title: 'Tarte Tatin Caramélisée',
        slug: 'tarte-tatin',
        excerpt: 'La tarte renversée classique avec des pommes fondantes',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>6 pommes Golden</li>
            <li>200g de sucre</li>
            <li>100g de beurre</li>
            <li>1 pâte brisée</li>
            <li>1 cuillère à soupe de jus de citron</li>
            <li>1 gousse de vanille</li>
            <li>Pincée de cannelle</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Préchauffer le four à 180°C</li>
            <li>Peler et couper les pommes en quartiers</li>
            <li>Faire carameliser le sucre dans une poêle à manche</li>
            <li>Ajouter le beurre et les pommes</li>
            <li>Cuire 10 minutes en retournant délicatement</li>
            <li>Disposer les pommes dans le moule</li>
            <li>Couvrir avec la pâte et rentrer les bords</li>
            <li>Cuire 30-35 minutes jusqu'à ce que la pâte soit dorée</li>
            <li>Laisser refroidir 5 minutes puis retourner sur un plat</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 20 minutes<br>Cuisson: 35 minutes</p>
        `,
        author: { _id: 'a2', firstName: 'Pierre', lastName: 'Martin', avatar: 'https://picsum.photos/seed/pierre/100/100' },
        categories: [{ _id: 'c2', name: 'Desserts', slug: 'desserts' }],
        tags: ['tarte', 'pomme', 'caramel', 'français'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 980,
        likesCount: 76,
        commentsCount: 18,
        images: ['https://picsum.photos/seed/tartetatin/800/600'],
        featuredImage: 'https://picsum.photos/seed/tartetatin/800/600',
        metaTitle: 'Tarte Tatin Caramélisée',
        metaDescription: 'Recette française traditionnelle aux pommes',
        metaKeywords: ['tarte', 'pomme', 'caramel', 'français', 'dessert'],
        publishedAt: new Date('2024-01-20').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 40,
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString()
      },
      {
        _id: '3',
        title: 'Saumon Teriyaki Mariné',
        slug: 'saumon-teriyaki',
        excerpt: 'Saumon fondant avec sauce teriyaki maison',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>4 pavés de saumon (200g chacun)</li>
            <li>100ml de sauce soja</li>
            <li>50g de sucre</li>
            <li>50ml de mirin</li>
            <li>2 cuillères à soupe de saké</li>
            <li>1 cuillère à soupe de gingembre râpé</li>
            <li>2 gousses d'ail</li>
            <li>Sésame</li>
            <li>Ciboulette</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Préparer la sauce teriyaki : mélanger soja, sucre, mirin et saké</li>
            <li>Faire chauffer la sauce à feu doux jusqu'à épaississement</li>
            <li>Mariner le saumon dans la moitié de la sauce pendant 30 minutes</li>
            <li>Faire chauffer une poêle avec un peu d'huile</li>
            <li>Cuire le saumon côté peau 4 minutes</li>
            <li>Retourner et cuire 3-4 minutes</li>
            <li>Napper avec le reste de la sauce</li>
            <li>Saupoudrer de sésame et de ciboulette ciselée</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 15 minutes<br>Cuisson: 15 minutes<br>Marinade: 30 minutes</p>
        `,
        author: { _id: 'a3', firstName: 'Sophie', lastName: 'Leroy', avatar: 'https://picsum.photos/seed/sophie/100/100' },
        categories: [{ _id: 'c3', name: 'Plats principaux', slug: 'plats-principaux' }],
        tags: ['saumon', 'teriyaki', 'japonais', 'poisson'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 1560,
        likesCount: 112,
        commentsCount: 34,
        images: ['https://picsum.photos/seed/saumon/800/600'],
        featuredImage: 'https://picsum.photos/seed/saumon/800/600',
        metaTitle: 'Saumon Teriyaki Mariné',
        metaDescription: 'Recette japonaise authentique avec sauce maison',
        metaKeywords: ['saumon', 'teriyaki', 'japonais', 'poisson', 'sain'],
        publishedAt: new Date('2024-01-25').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 30,
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date('2024-01-25').toISOString()
      },
      {
        _id: '4',
        title: 'Salade Méditerranéenne',
        slug: 'salade-mediterraneenne',
        excerpt: 'Fraîcheur et saveurs du soleil',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>2 concombres</li>
            <li>4 tomates</li>
            <li>1 poivron rouge</li>
            <li>1 oignon rouge</li>
            <li>200g de feta</li>
            <li>100g d'olives noires</li>
            <li>100ml d'huile d'olive</li>
            <li>2 cuillères à soupe de jus de citron</li>
            <li>Origan</li>
            <li>Sel et poivre</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Couper les concombres en rondelles</li>
            <li>Couper les tomates en quartiers</li>
            <li>Couper le poivron en lanières</li>
            <li>Émincer finement l'oignon rouge</li>
            <li>Détailler la feta en dés</li>
            <li>Mélanger tous les légumes dans un saladier</li>
            <li>Préparer la vinaigrette avec huile, citron, origane</li>
            <li>Verser la vinaigrette sur la salade</li>
            <li>Ajouter les olives et la feta</li>
            <li>Mélanger délicatement et servir frais</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 20 minutes</p>
        `,
        author: { _id: 'a4', firstName: 'Luc', lastName: 'Bernard', avatar: 'https://picsum.photos/seed/luc/100/100' },
        categories: [{ _id: 'c4', name: 'Entrées', slug: 'entrees' }],
        tags: ['salade', 'méditerranéen', 'légumes', 'frais'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 720,
        likesCount: 58,
        commentsCount: 12,
        images: ['https://picsum.photos/seed/salade/800/600'],
        featuredImage: 'https://picsum.photos/seed/salade/800/600',
        metaTitle: 'Salade Méditerranéenne',
        metaDescription: 'Recette légère et parfumée du soleil',
        metaKeywords: ['salade', 'méditerranéen', 'légumes', 'frais', 'sain'],
        publishedAt: new Date('2024-01-28').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 15,
        createdAt: new Date('2024-01-28').toISOString(),
        updatedAt: new Date('2024-01-28').toISOString()
      },
      {
        _id: '5',
        title: 'Pad Thaï Végétarien',
        slug: 'pad-thai-vegetarien',
        excerpt: 'Nouilles de riz thaïlandaises parfumées',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>250g de nouilles de riz</li>
            <li>200g de tofu ferme</li>
            <li>2 carottes</li>
            <li>1 poivron</li>
            <li>100g de germes de soja</li>
            <li>4 oignons nouveaux</li>
            <li>50g de cacahuètes</li>
            <li>3 cuillères à soupe de sauce poisson</li>
            <li>2 cuillères à soupe de sucre</li>
            <li>2 cuillères à soupe de vinaigre de riz</li>
            <li>1 cuillère à soupe de piment</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Tremper les nouilles dans l'eau chaude 10 minutes</li>
            <li>Couper le tofu en dés et le faire dorer</li>
            <li>Couper les légumes en julienne</li>
            <li>Préparer la sauce : mélanger sauce poisson, sucre, vinaigre, piment</li>
            <li>Faire sauter les légumes 3 minutes</li>
            <li>Ajouter les nouilles égouttées</li>
            <li>Verser la sauce et mélanger</li>
            <li>Ajouter le tofu et les germes de soja</li>
            <li>Servir avec cacahuètes et oignons nouveaux</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 25 minutes<br>Cuisson: 10 minutes</p>
        `,
        author: { _id: 'a5', firstName: 'Emma', lastName: 'Petit', avatar: 'https://picsum.photos/seed/emma/100/100' },
        categories: [{ _id: 'c5', name: 'Plats principaux', slug: 'plats-principaux' }],
        tags: ['pad thaï', 'végétarien', 'thaïlandais', 'nouilles'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 890,
        likesCount: 67,
        commentsCount: 21,
        images: ['https://picsum.photos/seed/padthai/800/600'],
        featuredImage: 'https://picsum.photos/seed/padthai/800/600',
        metaTitle: 'Pad Thaï Végétarien',
        metaDescription: 'Recette thaïlandaise végétarienne parfumée',
        metaKeywords: ['pad thaï', 'végétarien', 'thaïlandais', 'nouilles', 'exotique'],
        publishedAt: new Date('2024-02-01').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 35,
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString()
      },
      {
        _id: '6',
        title: 'Crème Brûlée Vanille',
        slug: 'creme-brulee-vanille',
        excerpt: 'Dessert français classique avec croûte caramélisée',
        content: `
          <h2>Ingrédients</h2>
          <ul>
            <li>500ml de crème liquide entière</li>
            <li>4 jaunes d'oeufs</li>
            <li>50g de sucre</li>
            <li>1 gousse de vanille</li>
            <li>Sucre cassonade pour le dessus</li>
          </ul>
          
          <h2>Préparation</h2>
          <ol>
            <li>Préchauffer le four à 150°C</li>
            <li>Faire chauffer la crème avec la gousse de vanille fendue</li>
            <li>Battre les jaunes avec le sucre jusqu'à blanchiment</li>
            <li>Verser la crème chaude sur les jaunes en remuant</li>
            <li>Filtrer la préparation</li>
            <li>Répartir dans des rameins</li>
            <li>Cuire au bain-marie 30-35 minutes</li>
            <li>Laisser refroidir puis réfrigérer 4 heures</li>
            <li>Saupoudrer de sucre cassonade et brûler au chalumeau</li>
          </ol>
          
          <h2>Temps de préparation</h2>
          <p>Préparation: 15 minutes<br>Cuisson: 35 minutes<br>Réfrigération: 4 heures</p>
        `,
        author: { _id: 'a6', firstName: 'Nicolas', lastName: 'Dubois', avatar: 'https://picsum.photos/seed/nicolas/100/100' },
        categories: [{ _id: 'c6', name: 'Desserts', slug: 'desserts' }],
        tags: ['crème brûlée', 'vanille', 'caramel', 'français'],
        status: 'published' as any,
        featureStatus: 'featured' as any,
        viewsCount: 1120,
        likesCount: 94,
        commentsCount: 28,
        images: ['https://picsum.photos/seed/cremebrulee/800/600'],
        featuredImage: 'https://picsum.photos/seed/cremebrulee/800/600',
        metaTitle: 'Crème Brûlée Vanille',
        metaDescription: 'Dessert français traditionnel avec croûte caramélisée',
        metaKeywords: ['crème brûlée', 'vanille', 'caramel', 'français', 'dessert'],
        publishedAt: new Date('2024-02-05').toISOString(),
        rejectionReason: undefined,
        allowComments: true,
        isPinned: false,
        scheduledFor: undefined,
        readTimeMinutes: 45,
        createdAt: new Date('2024-02-05').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString()
      }
    ];
  }
}
