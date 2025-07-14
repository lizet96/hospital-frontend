import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, filter, take } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que se complete la inicialización
  return authService.initialized$.pipe(
    filter(initialized => initialized), // Solo continuar cuando esté inicializado
    take(1), // Tomar solo el primer valor
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/auth/login']);
      return false;
    })
  );
};