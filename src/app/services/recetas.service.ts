import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Receta {
  id_receta?: number;
  fecha?: string;
  medicamento?: string;
  dosis?: string;
  id_medico?: number;
  id_paciente?: number;
  id_consultorio?: number;
  medico?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
  };
  paciente?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
  };
  consultorio?: {
    id_consultorio: number;
    nombre_numero: string;
    ubicacion?: string;
  };
}

export interface CreateRecetaRequest {
  fecha?: string;
  medicamento?: string;
  dosis?: string;
  id_medico: number;
  id_paciente: number;
  id_consultorio: number;
}

export interface UpdateRecetaRequest {
  fecha?: string;
  medicamento?: string;
  dosis?: string;
  id_medico?: number;
  id_paciente?: number;
  id_consultorio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecetasService extends BaseCrudService<Receta> {
  protected override endpoint = 'recetas';

  // Método específico para obtener recetas por paciente
  getByPaciente(pacienteId: number): Observable<CrudResponse<Receta[]>> {
    return this.http.get<CrudResponse<Receta[]>>(`${this.baseUrl}/${this.endpoint}/paciente/${pacienteId}`);
  }

  // Método específico para obtener recetas por médico
  getByMedico(medicoId: number): Observable<CrudResponse<Receta[]>> {
    return this.http.get<CrudResponse<Receta[]>>(`${this.baseUrl}/${this.endpoint}/medico/${medicoId}`);
  }
}