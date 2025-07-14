import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { PermissionsService } from '../services/permissions.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {

  constructor(
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Obtener los permisos requeridos de la ruta
    const requiredPermissions = route.data['permissions'] as string[];
    const requiredResource = route.data['resource'] as string;
    const requiredAction = route.data['action'] as string;

    // Si no hay permisos específicos requeridos, permitir acceso
    if (!requiredPermissions && !requiredResource) {
      return true;
    }

    // Verificar permisos usando el servicio
    return this.permissionsService.userPermissions$.pipe(
      take(1),
      map(permissions => {
        // Si se especificaron permisos por nombre
        if (requiredPermissions && requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission => 
            this.permissionsService.hasPermission(permission)
          );
          
          if (!hasPermission) {
            this.router.navigate(['/dashboard']);
            return false;
          }
        }

        // Si se especificó recurso y acción
        if (requiredResource && requiredAction) {
          const canPerformAction = this.permissionsService.canPerformAction(requiredResource, requiredAction);
          
          if (!canPerformAction) {
            this.router.navigate(['/dashboard']);
            return false;
          }
        }

        return true;
      })
    );
  }
}

/**
 * Guard específico para verificar permisos de lectura
 */
@Injectable({
  providedIn: 'root'
})
export class CanReadGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const resource = route.data['resource'] as string;
    if (!resource) return true;

    const canRead = this.permissionsService.canRead(resource);
    if (!canRead) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

/**
 * Guard específico para verificar permisos de escritura (crear/actualizar)
 */
@Injectable({
  providedIn: 'root'
})
export class CanWriteGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const resource = route.data['resource'] as string;
    const action = route.data['action'] as 'create' | 'update';
    
    if (!resource || !action) return true;

    const canWrite = action === 'create' 
      ? this.permissionsService.canCreate(resource)
      : this.permissionsService.canUpdate(resource);

    if (!canWrite) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}

/**
 * Guard específico para verificar permisos de eliminación
 */
@Injectable({
  providedIn: 'root'
})
export class CanDeleteGuard implements CanActivate {
  constructor(
    private permissionsService: PermissionsService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const resource = route.data['resource'] as string;
    if (!resource) return true;

    const canDelete = this.permissionsService.canDelete(resource);
    if (!canDelete) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}