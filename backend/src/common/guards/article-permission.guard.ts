import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ArticleStatus } from '../../articles/schemas/article.schema';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class ArticlePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const article = request.article || request.body;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.checkPermission(user, article, request.method);
  }

  private checkPermission(user: any, article: any, method: string): boolean {
    const { role, userId } = user;
    const isAuthor = role === UserRole.AUTHOR;
    const isEditor = role === UserRole.EDITOR;
    const isAdmin = role === UserRole.ADMIN;

    // ADMIN a un accès complet
    if (isAdmin) {
      return true;
    }

    // EDITOR peut tout sauf supprimer les articles d'autres auteurs
    if (isEditor) {
      if (method === 'DELETE') {
        throw new ForbiddenException('Editors cannot delete articles');
      }
      return true;
    }

    // AUTHOR peut seulement gérer ses propres articles
    if (isAuthor) {
      if (!article.author || article.author.toString() !== userId) {
        throw new ForbiddenException('You can only manage your own articles');
      }

      // AUTHOR ne peut pas publier directement
      if (method === 'PATCH' && article.status === ArticleStatus.PUBLISHED) {
        throw new ForbiddenException('Authors cannot edit published articles');
      }

      if (method === 'POST' && article.status === ArticleStatus.PUBLISHED) {
        throw new ForbiddenException('Authors cannot publish articles directly');
      }

      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
