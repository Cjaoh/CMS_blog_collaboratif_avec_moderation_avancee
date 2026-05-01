import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { SeedDataService } from './scripts/seed-data';
import { UserSchema } from './users/schemas/user.schema';
import { ArticleSchema } from './articles/schemas/article.schema';
import { CategorySchema } from './categories/schemas/category.schema';
import { CommentSchema } from './comments/schemas/comment.schema';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Article', schema: ArticleSchema },
      { name: 'Category', schema: CategorySchema },
      { name: 'Comment', schema: CommentSchema },
    ]),
    AuthModule,
    UsersModule,
    ArticlesModule,
    CategoriesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    SeedDataService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
