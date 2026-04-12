import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ArticlesService } from '../shared/services/articles.service';
import { CategoriesService } from '../shared/services/categories.service';
import { UsersService } from '../shared/services/users.service';
import { User } from '../shared/models/user.model';
import { Article } from '../shared/models/article.model';
import { Category } from '../shared/models/category.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private articlesService = inject(ArticlesService);
  private categoriesService = inject(CategoriesService);
  private usersService = inject(UsersService);

  currentUser: User | null = null;
  recentArticles: Article[] = [];
  popularCategories: Category[] = [];
  stats = {
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  };
  isLoading = true;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Charger les articles récents
    this.articlesService.getArticles(1, 5).subscribe({
      next: (data) => {
        this.recentArticles = data.articles;
        this.calculateStats();
      },
      error: (err) => console.error('Error loading articles:', err)
    });

    // Charger les catégories populaires
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.popularCategories = categories
          .sort((a, b) => b.articlesCount - a.articlesCount)
          .slice(0, 6);
      },
      error: (err) => console.error('Error loading categories:', err)
    });

    // Simuler le chargement des statistiques
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private calculateStats(): void {
    this.stats.totalArticles = this.recentArticles.length;
    this.stats.totalViews = this.recentArticles.reduce((sum, article) => sum + article.viewsCount, 0);
    this.stats.totalLikes = this.recentArticles.reduce((sum, article) => sum + article.likesCount, 0);
    this.stats.totalComments = this.recentArticles.reduce((sum, article) => sum + article.commentsCount, 0);
  }

  createNewArticle(): void {
    this.router.navigate(['/articles/new']);
  }

  viewAllArticles(): void {
    this.router.navigate(['/articles']);
  }

  viewArticle(articleId: string): void {
    this.router.navigate(['/articles', articleId]);
  }

  viewCategory(categoryId: string): void {
    this.router.navigate(['/articles'], { 
      queryParams: { category: categoryId } 
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  get isEditor(): boolean {
    return this.authService.isEditor;
  }

  get isAuthor(): boolean {
    return this.authService.isAuthor;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
