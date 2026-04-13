import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Article, 
  CreateArticleDto, 
  UpdateArticleDto, 
  ArticlesResponse,
  ArticleStatus,
  ModerationStats,
  Activity
} from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private readonly apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  
  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  getArticleBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/slug/${slug}`);
  }

  createArticle(articleData: CreateArticleDto): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, articleData);
  }

  updateArticle(id: string, articleData: UpdateArticleDto): Observable<Article> {
    return this.http.patch<Article>(`${this.apiUrl}/${id}`, articleData);
  }

  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchArticles(query: string, page = 1, limit = 10): Observable<ArticlesResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ArticlesResponse>(`${this.apiUrl}/search`, { params });
  }

  getPendingArticles(page = 1, limit = 10): Observable<ArticlesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ArticlesResponse>(`${this.apiUrl}/pending`, { params });
  }

  approveArticle(id: string): Observable<Article> {
    return this.http.patch<Article>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectArticle(id: string, reason: string): Observable<Article> {
    return this.http.patch<Article>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  incrementViews(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/views`, {});
  }

  likeArticle(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikeArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/like`);
  }

  getFeaturedArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/featured`);
  }

  getRecentActivity(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/activity`);
  }

  getModerationStats(): Observable<ModerationStats> {
    return this.http.get<ModerationStats>(`${this.apiUrl}/moderation/stats`);
  }

  getArticles(filters: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    author?: string;
    search?: string;
    sortBy?: string;
  }): Observable<ArticlesResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.author) params = params.set('author', filters.author);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);

    return this.http.get<ArticlesResponse>(this.apiUrl, { params });
  }
}
