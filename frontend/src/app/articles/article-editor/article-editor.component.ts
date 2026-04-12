import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesService } from '../../shared/services/articles.service';
import { Article, CreateArticleDto, ArticleStatus } from '../../shared/models/article.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.css']
})
export class ArticleEditorComponent {
  private fb = inject(FormBuilder);
  private articlesService = inject(ArticlesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  articleForm = this.fb.group({
    title: ['', Validators.required],
    excerpt: ['', Validators.required],
    content: ['', Validators.required],
    tags: [''],
    status: [ArticleStatus.DRAFT],
  });

  isEditing = false;
  isLoading = false;
  articleId: string | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing = true;
      this.articleId = id;
      this.loadArticle(id);
    }
  }

  loadArticle(id: string): void {
    this.articlesService.getArticle(id).subscribe({
      next: (article) => {
        this.articleForm.patchValue({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          tags: article.tags.join(', '),
          status: article.status,
        });
      },
      error: (err) => {
        console.error('Error loading article:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.isLoading = true;
      
      const formData = this.articleForm.value;
      const articleData: CreateArticleDto = {
        title: formData.title!,
        excerpt: formData.excerpt!,
        content: formData.content!,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        status: formData.status as ArticleStatus,
      };

      const operation = this.isEditing && this.articleId
        ? this.articlesService.updateArticle(this.articleId, articleData)
        : this.articlesService.createArticle(articleData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (err) => {
          console.error('Error saving article:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/articles']);
  }
}
