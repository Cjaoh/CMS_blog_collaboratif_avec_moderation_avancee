import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): any {
    return {
      name: 'CMS Blog Collaboratif API',
      version: '1.0.0',
      description: 'API pour le blog collaboratif de recettes de cuisine',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        articles: '/api/articles',
        categories: '/api/categories',
        comments: '/api/comments'
      },
      status: 'active',
      timestamp: new Date().toISOString()
    };
  }
}
