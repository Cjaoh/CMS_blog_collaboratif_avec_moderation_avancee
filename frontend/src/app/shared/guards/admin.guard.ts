import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On utilise le pipe pour attendre que l'utilisateur soit chargé
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // On vérifie si l'utilisateur existe et s'il a le rôle admin
      if (user && user.role === 'admin') {
        return true;
      }

      // Sinon, on redirige vers l'accueil ou le login
      console.warn('Accès refusé : Droits administrateur requis');
      return router.createUrlTree(['/login']);
    })
  );
};