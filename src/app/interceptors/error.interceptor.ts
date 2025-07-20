import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // No interceptar errores de autenticación (login, register, mfa) para permitir manejo específico
      if (req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/mfa')) {
        return throwError(() => error);
      }
      
      let errorMessage = 'Ha ocurrido un error';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 401:
            // Evitar bucle infinito: no hacer logout automático si la URL es logout
            if (!req.url.includes('/auth/logout')) {
              errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
              authService.performLogout(); // Usar performLogout en lugar de logout para evitar llamada HTTP
              router.navigate(['/auth/login']);
            } else {
              // Si es un error en logout, solo limpiar localmente
              errorMessage = 'Error al cerrar sesión en el servidor, pero la sesión local ha sido limpiada.';
              authService.performLogout();
            }
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor.';
            break;
          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }
      }
      
      return throwError(() => ({ message: errorMessage, originalError: error }));
    })
  );
};