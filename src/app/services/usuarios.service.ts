import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido?: string;
  email?: string;
  fecha_nacimiento?: string;
  tipo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  apellido?: string;
  email?: string;
  fecha_nacimiento?: string;
  tipo?: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  fecha_nacimiento?: string;
  tipo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseCrudService<Usuario, CreateUsuarioRequest, UpdateUsuarioRequest> {
  protected override endpoint = 'usuarios';

  // Método específico para obtener usuarios por rol
  getByRole(rolId: number): Observable<CrudResponse<Usuario[]>> {
    return this.http.get<CrudResponse<Usuario[]>>(`${this.baseUrl}/${this.endpoint}/role/${rolId}`);
  }

  // Método para obtener roles disponibles
  getRoles(): Observable<CrudResponse<any[]>> {
    return this.http.get<CrudResponse<any[]>>(`${this.baseUrl}/roles`);
  }
}