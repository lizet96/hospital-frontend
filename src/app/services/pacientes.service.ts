import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseCrudService, CrudResponse, StandardResponse } from './base-crud.service';

export interface Paciente {
  id?: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  numero_expediente?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreatePacienteRequest {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  genero: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdatePacienteRequest {
  nombre?: string;
  apellido?: string;
  fecha_nacimiento?: string;
  genero?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService extends BaseCrudService<Paciente> {
  protected override endpoint = 'pacientes';

  // Método específico para buscar pacientes por nombre
  searchByName(nombre: string): Observable<CrudResponse<Paciente[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}/search?nombre=${encodeURIComponent(nombre)}`).pipe(
      map(response => {
        const adaptedData = response.body.data[0];
        return {
          success: response.statusCode >= 200 && response.statusCode < 300,
          data: adaptedData.pacientes || adaptedData,
          total: adaptedData.total || (Array.isArray(adaptedData) ? adaptedData.length : 0),
          message: response.body.intCode
        };
      })
    );
  }

  // Método específico para obtener pacientes por género
  getByGender(genero: string): Observable<CrudResponse<Paciente[]>> {
    return this.http.get<CrudResponse<Paciente[]>>(`${this.baseUrl}/${this.endpoint}/gender/${genero}`);
  }

  // Método para obtener el historial médico de un paciente
  getMedicalHistory(id: number): Observable<CrudResponse<any[]>> {
    return this.http.get<CrudResponse<any[]>>(`${this.baseUrl}/${this.endpoint}/${id}/history`);
  }
}