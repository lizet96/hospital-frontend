import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of, interval } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

export interface Permission {
  id_permiso: number;
  nombre: string;
  descripcion: string;
  recurso: string;
  accion: string;
}

export interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  permisos: Permission[];
}

export interface JWTPayload {
  user_id: number;
  id_rol: number;
  exp: number;
  iat: number;
  sub: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private baseUrl = environment.apiUrl;
  private userPermissionsSubject = new BehaviorSubject<Permission[]>([]);
  public userPermissions$ = this.userPermissionsSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<Role | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {
    // Verificar permisos cada vez que cambie el token
    this.initializePermissionsWatcher();
  }

  private initializePermissionsWatcher(): void {
    // Verificar permisos al inicializar
    this.loadUserPermissions();
    
    // Verificar cambios en el token cada 5 segundos
    interval(5000).subscribe(() => {
      const currentToken = localStorage.getItem('hospital_token');
      if (currentToken && this.userPermissionsSubject.value.length === 0) {
        this.loadUserPermissions();
      } else if (!currentToken && this.userPermissionsSubject.value.length > 0) {
        this.clearPermissions();
      }
    });
  }

  /**
   * Decodifica el JWT y obtiene el id_rol del usuario
   */
  private getUserRoleFromToken(): number | null {
    const token = localStorage.getItem('hospital_token');
    if (!token) return null;

    try {
      const decoded: JWTPayload = jwtDecode(token);
      return decoded.id_rol;
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Carga los permisos del usuario desde el backend
   */
  loadUserPermissions(): void {
    const roleId = this.getUserRoleFromToken();
    if (!roleId) return;

    this.getRolePermissions(roleId).subscribe({
      next: (role) => {
        this.userRoleSubject.next(role);
        this.userPermissionsSubject.next(role.permisos);
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.userPermissionsSubject.next([]);
        this.userRoleSubject.next(null);
      }
    });
  }

  /**
   * Obtiene los permisos de un rol específico desde el backend
   */
  private getRolePermissions(roleId: number): Observable<Role> {
    return this.http.get<any>(`${this.baseUrl}/v1/roles/${roleId}/permisos`)
      .pipe(
        map(response => {
          // Adaptar la respuesta del backend al formato esperado
          if (response.statusCode === 200 && response.body.data && response.body.data.length > 0) {
            return response.body.data[0] as Role;
          }
          throw new Error('Respuesta inválida del servidor');
        }),
        catchError(error => {
          console.error('Error obteniendo permisos del rol:', error);
          return of({
            id_rol: roleId,
            nombre: 'unknown',
            descripcion: '',
            permisos: []
          } as Role);
        })
      );
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permissionName: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(permission => permission.nombre === permissionName);
  }

  /**
   * Verifica si el usuario puede realizar una acción en un recurso
   */
  canPerformAction(resource: string, action: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(permission => 
      permission.recurso === resource && permission.accion === action
    );
  }

  /**
   * Obtiene todos los permisos del usuario actual
   */
  getUserPermissions(): Permission[] {
    return this.userPermissionsSubject.value;
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): Role | null {
    return this.userRoleSubject.value;
  }

  /**
   * Obtiene los recursos a los que el usuario tiene acceso
   */
  getAccessibleResources(): string[] {
    const permissions = this.userPermissionsSubject.value;
    const resources = permissions.map(permission => permission.recurso);
    return [...new Set(resources)]; // Eliminar duplicados
  }

  /**
   * Obtiene las acciones que el usuario puede realizar en un recurso específico
   */
  getResourceActions(resource: string): string[] {
    const permissions = this.userPermissionsSubject.value;
    return permissions
      .filter(permission => permission.recurso === resource)
      .map(permission => permission.accion);
  }

  /**
   * Verifica si el usuario tiene acceso de lectura a un recurso
   */
  canRead(resource: string): boolean {
    return this.canPerformAction(resource, 'read');
  }

  /**
   * Verifica si el usuario puede crear en un recurso
   */
  canCreate(resource: string): boolean {
    return this.canPerformAction(resource, 'create');
  }

  /**
   * Verifica si el usuario puede actualizar un recurso
   */
  canUpdate(resource: string): boolean {
    return this.canPerformAction(resource, 'update');
  }

  /**
   * Verifica si el usuario puede eliminar un recurso
   */
  canDelete(resource: string): boolean {
    return this.canPerformAction(resource, 'delete');
  }

  /**
   * Limpia los permisos del usuario
   */
  clearPermissions(): void {
    this.userPermissionsSubject.next([]);
    this.userRoleSubject.next(null);
  }

  /**
   * Fuerza la recarga de permisos
   */
  refreshPermissions(): void {
    this.loadUserPermissions();
  }
}