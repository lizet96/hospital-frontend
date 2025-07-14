import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Horario {
  id_horario?: number;
  turno: string;
  id_medico: number;
  id_consultorio: number;
  consulta_disponible: boolean;
  fecha_hora?: string;
  created_at?: string;
  updated_at?: string;
  // Campos adicionales para mostrar información relacionada
  medico_nombre?: string;
  consultorio_nombre?: string;
}

export interface CreateHorarioRequest {
  turno: string;
  id_medico: number;
  id_consultorio: number;
  consulta_disponible?: boolean;
  fecha_hora?: string;
}

export interface UpdateHorarioRequest {
  turno?: string;
  id_medico?: number;
  id_consultorio?: number;
  consulta_disponible?: boolean;
  fecha_hora?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService extends BaseCrudService<Horario, CreateHorarioRequest, UpdateHorarioRequest> {
  protected override endpoint = 'horarios';

  // Método específico para obtener horarios disponibles
  getDisponibles(): Observable<CrudResponse<Horario[]>> {
    return this.http.get<CrudResponse<Horario[]>>(`${this.baseUrl}/${this.endpoint}/disponibles`);
  }

  // Método específico para obtener horarios por médico
  getByMedico(medicoId: number): Observable<CrudResponse<Horario[]>> {
    return this.http.get<CrudResponse<Horario[]>>(`${this.baseUrl}/${this.endpoint}/medico/${medicoId}`);
  }

  // Método específico para cambiar disponibilidad
  cambiarDisponibilidad(horarioId: number, disponible: boolean): Observable<CrudResponse<any>> {
    return this.http.patch<CrudResponse<any>>(`${this.baseUrl}/${this.endpoint}/${horarioId}/disponibilidad`, { disponible });
  }
}