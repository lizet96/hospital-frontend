import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Consulta {
  id_consulta?: number;
  tipo?: string;
  diagnostico?: string;
  costo?: number;
  id_paciente?: number;
  id_medico?: number;
  id_horario?: number;
  paciente?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
  };
  medico?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
  };
  horario?: {
    id_horario: number;
    turno: string;
  };
}

export interface CreateConsultaRequest {
  tipo?: string;
  diagnostico?: string;
  costo?: number;
  id_paciente: number;
  id_medico: number;
  id_horario: number;
}

export interface UpdateConsultaRequest {
  tipo?: string;
  diagnostico?: string;
  costo?: number;
  id_paciente?: number;
  id_medico?: number;
  id_horario?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultasService extends BaseCrudService<Consulta> {
  protected override endpoint = 'consultas';

  // Método específico para obtener consultas por paciente
  getByPaciente(pacienteId: number): Observable<CrudResponse<Consulta[]>> {
    return this.http.get<CrudResponse<Consulta[]>>(`${this.baseUrl}/${this.endpoint}/paciente/${pacienteId}`);
  }

  // Método específico para obtener consultas por médico
  getByMedico(medicoId: number): Observable<CrudResponse<Consulta[]>> {
    return this.http.get<CrudResponse<Consulta[]>>(`${this.baseUrl}/${this.endpoint}/medico/${medicoId}`);
  }
}