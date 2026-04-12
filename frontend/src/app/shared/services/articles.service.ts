import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Article, 
  CreateArticleDto, 
  UpdateArticleDto, 
  ArticlesResponse,
  ArticleStatus 
} from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private readonly apiUrl = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getArticles(
    page = 1,
    limit = 10,
    status = ArticleStatus.PUBLISHED,
    category?: string,
    author?: string
  ): Observable<ArticlesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status);

    if (category) {
      params = params.set('category', category);
    }

    if (author) {
      params = params.set('author', author);
    }

    return this.http.get<ArticlesResponse>(this.apiUrl, { params });
  }

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
}
