import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticlesService } from '../../shared/services/articles.service';
import { CommentsService } from '../../shared/services/comments.service';
import { AuthService } from '../../shared/services/auth.service';
import { Article } from '../../shared/models/article.model';
import { Comment } from '../../shared/models/comment.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articlesService = inject(ArticlesService);
  private commentsService = inject(CommentsService);
  public authService = inject(AuthService);

  article: Article | null = null;
  comments: Comment[] = [];
  newComment = '';
  isLoading = true;

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(articleId);
      this.loadComments(articleId);
    }
  }

  loadArticle(id: string): void {
    this.articlesService.getArticle(id).subscribe({
      next: (article) => {
        this.article = article;
        this.isLoading = false;
        // Incrémenter les vues
        this.articlesService.incrementViews(id).subscribe();
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.isLoading = false;
      }
    });
  }

  loadComments(articleId: string): void {
    this.commentsService.getCommentsByArticle(articleId).subscribe({
      next: (response) => {
        this.comments = response.comments;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  likeArticle(): void {
    if (this.article) {
      this.articlesService.likeArticle(this.article._id).subscribe({
        next: () => {
          if (this.article) {
            this.article.likesCount++;
          }
        },
        error: (err) => console.error('Error liking article:', err)
      });
    }
  }

  shareArticle(): void {
    if (this.article) {
      if (navigator.share) {
        navigator.share({
          title: this.article.title,
          text: this.article.excerpt,
          url: window.location.href
        });
      } else {
        // Fallback: copier dans le presse-papiers
        navigator.clipboard.writeText(window.location.href);
      }
    }
  }

  addComment(): void {
    if (this.newComment.trim() && this.article && this.authService.currentUser) {
      const commentData = {
        content: this.newComment,
        article: this.article._id
      };

      this.commentsService.createComment(commentData).subscribe({
        next: (comment) => {
          this.comments.unshift(comment);
          this.newComment = '';
          if (this.article) {
            this.article.commentsCount++;
          }
        },
        error: (err) => console.error('Error adding comment:', err)
      });
    }
  }

  // Helper methods pour extraire le contenu
  getAuthorInitials(author: any): string {
    if (author?.firstName && author?.lastName) {
      return `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
    }
    return '??';
  }

  extractIngredients(content: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const h2Elements = tempDiv.querySelectorAll('h2');
    for (const h2 of h2Elements) {
      if (h2.textContent?.toLowerCase().includes('ingrédients')) {
        const ul = h2.nextElementSibling;
        if (ul && ul.tagName === 'UL') {
          return ul.outerHTML;
        }
      }
    }
    
    return '<ul><li>Ingrédients non disponibles</li></ul>';
  }

  extractPreparation(content: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const h2Elements = tempDiv.querySelectorAll('h2');
    for (const h2 of h2Elements) {
      if (h2.textContent?.toLowerCase().includes('préparation')) {
        const ol = h2.nextElementSibling;
        if (ol && ol.tagName === 'OL') {
          return ol.outerHTML;
        }
      }
    }
    
    return '<ol><li>Préparation non disponible</li></ol>';
  }

  extractTiming(content: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const h2Elements = tempDiv.querySelectorAll('h2');
    for (const h2 of h2Elements) {
      if (h2.textContent?.toLowerCase().includes('temps')) {
        const p = h2.nextElementSibling;
        if (p && p.tagName === 'P') {
          return p.outerHTML;
        }
      }
    }
    
    return '';
  }

  printRecipe(): void {
    window.print();
  }
}