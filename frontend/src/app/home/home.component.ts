import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, finalize } from 'rxjs';

import { ArticlesService } from '../shared/services/articles.service';
import { AuthService } from '../shared/services/auth.service';
import { Article, Activity, ModerationStats, ModerationStatsResponse } from '../shared/models/article.model';
import { Category } from '../shared/models/category.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // =========================
  // INJECTIONS
  // =========================
  private articlesService = inject(ArticlesService);
  public authService = inject(AuthService);

  // =========================
  // STATE
  // =========================
  isLoading: boolean = true;
  articles: Article[] = [];
  categories: Category[] = [];
  featuredArticles: Article[] = [];
  recentActivity: Activity[] = [];
  stats: ModerationStats = {
    published: 0,
    pending: 0,
    rejected: 0,
    total: 0
  };

  // =========================
  // LIFECYCLE
  // =========================
  ngOnInit(): void {
    this.loadHomeData();
  }

  // =========================
  // DATA LOADING
  // =========================
  loadHomeData(): void {
    this.isLoading = true;

    // Utilisation de forkJoin pour le chargement parallèle
    forkJoin({
      articles: this.articlesService.getArticles({ status: 'published', limit: 6 }),
      categories: this.articlesService.getCategories(),
      featured: this.articlesService.getFeaturedArticles(),
      activity: this.articlesService.getLatestActivity(),
      stats: this.articlesService.getModerationStats()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (results) => {
        console.log('Données reçues:', results);
        this.articles = results.articles.articles || [];
        this.categories = results.categories || [];
        this.featuredArticles = results.featured || [];
        this.recentActivity = results.activity || [];
        this.stats = results.stats?.data || this.stats;
        console.log('Stats après mise à jour:', this.stats);
      },
      error: (error) => {
        console.error('Error loading home data:', error);
        console.log('Détails de l\'erreur:', error);
        // En cas d'erreur, on peut quand même afficher des données vides
        this.articles = [];
        this.categories = [];
        this.featuredArticles = [];
        this.recentActivity = [];
      }
    });
  }

  // =========================
  // HELPERS UI
  // =========================

  getActivityText(type: string): string {
    const texts: Record<string, string> = {
      submitted: 'a soumis un article',
      approved: 'a approuvé un article',
      rejected: 'a rejeté un article',
      commented: 'a commenté un article'
    };
    return texts[type] || 'a interagi avec le blog';
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return 'Récemment';
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return 'Récemment';
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getActivityBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      submitted: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
      commented: 'badge-commented'
    };
    return classes[type] || 'badge-default';
  }

  getActivityIconClass(type: string): string {
    return `icon-${type}`;
  }

  getActivityEmoji(type: string): string {
    const emojis: Record<string, string> = {
      submitted: '📝',
      approved: '✅',
      rejected: '❌',
      commented: '💬'
    };
    return emojis[type] || '🔔';
  }

  getCategorySlug(category?: Partial<Category>): string {
    return category?.slug || 'divers';
  }

  getCategoryName(category?: Partial<Category> | undefined): string {
    if (!category) return 'Divers';
    return category.name || 'Divers';
  }

  // =========================
  // TRACKBY (PERFORMANCE)
  // =========================

  trackByArticleId(index: number, article: Article): string {
    return article._id || index.toString();
  }

  trackByActivityId(index: number, activity: Activity): string {
    return (activity as any)._id || index.toString();
  }

  trackByCategoryId(index: number, category: Category): string {
    return category._id || index.toString();
  }

  // =========================
  // ACTIONS
  // =========================

  onArticleClick(article: Article): void {
    // Incrémenter les vues
    this.articlesService.incrementViews(article._id).subscribe({
      error: (err) => console.warn('Failed to increment views:', err)
    });
  }

  onCategoryClick(category: Category): void {
    // Navigation vers la catégorie (implémenter plus tard)
    console.log('Navigate to category:', category.slug);
  }

  onRefresh(): void {
    this.loadHomeData();
  }
}