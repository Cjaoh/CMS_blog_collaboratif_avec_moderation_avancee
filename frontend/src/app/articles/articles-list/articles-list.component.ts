import { Component, inject, OnInit } from '@angular/core';
import { ArticlesService } from '../../shared/services/articles.service';
import { CategoriesService } from '../../shared/services/categories.service';
import { AuthService } from '../../shared/services/auth.service';
import { Article, ArticleStatus } from '../../shared/models/article.model';
import { Category } from '../../shared/models/category.model';
import { ArticlesResponse } from '../../shared/models/article.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {
  private articlesService = inject(ArticlesService);
  private categoriesService = inject(CategoriesService);
  public authService = inject(AuthService);
  
  articles: Article[] = [];
  categories: Category[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchQuery = '';
  selectedCategory = '';

  ngOnInit(): void {
    this.loadArticles();
    this.loadCategories();
  }

  loadArticles(): void {
    this.articlesService.getArticles(
      this.currentPage,
      this.pageSize,
      ArticleStatus.PUBLISHED,
      this.selectedCategory || undefined
    ).subscribe({
      next: (data: ArticlesResponse) => {
        this.articles = data.articles;
        this.total = data.total;
      },
      error: (err) => console.error('Error fetching articles:', err),
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    if (this.searchQuery.length > 2 || this.searchQuery.length === 0) {
      this.searchArticles();
    }
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadArticles();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadArticles();
  }

  searchArticles(): void {
    if (this.searchQuery.trim()) {
      this.articlesService.searchArticles(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (data: ArticlesResponse) => {
          this.articles = data.articles;
          this.total = data.total;
        },
        error: (err) => console.error('Error searching articles:', err),
      });
    } else {
      this.loadArticles();
    }
  }
}
