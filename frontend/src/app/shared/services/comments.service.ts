import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Comment, 
  CreateCommentDto, 
  UpdateCommentDto,
  CommentsResponse,
  CommentStatus 
} from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getComments(
    page = 1,
    limit = 10,
    articleId?: string,
    status = CommentStatus.APPROVED
  ): Observable<CommentsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('status', status);

    if (articleId) {
      params = params.set('article', articleId);
    }

    return this.http.get<CommentsResponse>(this.apiUrl, { params });
  }

  getCommentsByArticle(
    articleId: string,
    page = 1,
    limit = 10
  ): Observable<CommentsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponse>(`${this.apiUrl}/article/${articleId}`, { params });
  }

  getCommentReplies(commentId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/replies/${commentId}`);
  }

  getComment(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/${id}`);
  }

  createComment(commentData: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, commentData);
  }

  updateComment(id: string, commentData: UpdateCommentDto): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}`, commentData);
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approveComment(id: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectComment(id: string, reason: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}/reject`, { reason });
  }

  markAsSpam(id: string): Observable<Comment> {
    return this.http.patch<Comment>(`${this.apiUrl}/${id}/spam`, {});
  }

  reportComment(id: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${id}/report`, {});
  }

  likeComment(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/like`, {});
  }

  unlikeComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/like`);
  }

  getPendingComments(page = 1, limit = 10): Observable<CommentsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponse>(`${this.apiUrl}/pending`, { params });
  }

  getReportedComments(page = 1, limit = 10): Observable<CommentsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<CommentsResponse>(`${this.apiUrl}/reported`, { params });
  }
}
