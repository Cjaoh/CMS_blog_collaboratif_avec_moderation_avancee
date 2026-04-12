import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ArticlesListComponent } from './articles/articles-list/articles-list.component';
import { ArticleDetailComponent } from './articles/article-detail/article-detail.component';
import { ArticleEditorComponent } from './articles/article-editor/article-editor.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'articles',
    children: [
      { path: '', component: ArticlesListComponent },
      { path: ':id', component: ArticleDetailComponent },
      { path: 'new', component: ArticleEditorComponent, canActivate: [AuthGuard] },
      { path: 'edit/:id', component: ArticleEditorComponent, canActivate: [AuthGuard] },
    ],
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
