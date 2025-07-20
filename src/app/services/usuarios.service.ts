import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseCrudService, CrudResponse, StandardResponse } from './base-crud.service';

// Re-export CrudResponse for components that import from this service
export type { CrudResponse } from './base-crud.service';

export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido?: string;
  email?: string;
  fecha_nacimiento?: string;
  tipo?: string;
  id_rol?: number;
  rol_nombre?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido?: string;
  email?: string;
  password: string;
  fecha_nacimiento?: string;
  id_rol: number;
  activo?: boolean;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  fecha_nacimiento?: string;
  id_rol?: number;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseCrudService<Usuario, CreateUsuarioRequest, UpdateUsuarioRequest> {
  protected override endpoint = 'usuarios';

  // Método específico para obtener usuarios por rol
  getByRole(rolId: number): Observable<CrudResponse<Usuario[]>> {
    return this.http.get<any>(`${this.baseUrl}/${this.endpoint}/role/${rolId}`).pipe(
      map(response => {
        // La respuesta viene directamente como {success, data, total}
        return {
          success: response.success || false,
          data: response.data || [],
          total: response.total || 0,
          message: response.success ? 'Usuarios obtenidos correctamente' : 'Error al obtener usuarios'
        };
      })
    );
  }

  // Método para obtener roles disponibles
  getRoles(): Observable<CrudResponse<any[]>> {
    return this.http.get<any>(`${this.baseUrl}/roles`).pipe(
      map(response => {
        // La respuesta viene directamente como {success, data, total}
        return {
          success: response.success || false,
          data: response.data || [],
          total: response.total || 0,
          message: response.success ? 'Roles obtenidos correctamente' : 'Error al obtener roles'
        };
      })
    );
  }
}