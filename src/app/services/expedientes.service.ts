import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Expediente {
  id_expediente?: number;
  antecedentes?: string;
  historial_clinico?: string;
  seguro?: string;
  id_paciente?: number;
  paciente_nombre?: string; 
  paciente?: {
    id_usuario: number;
    nombre: string;
    apellido?: string;
  };
}

export interface CreateExpedienteRequest {
  antecedentes?: string;
  historial_clinico?: string;
  seguro?: string;
  id_paciente: number;
}

export interface UpdateExpedienteRequest {
  antecedentes?: string;
  historial_clinico?: string;
  seguro?: string;
  id_paciente?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedientesService extends BaseCrudService<Expediente> {
  protected override endpoint = 'expedientes';

  // Método específico para obtener expediente por paciente
  getByPaciente(pacienteId: number): Observable<CrudResponse<Expediente>> {
    return this.http.get<CrudResponse<Expediente>>(`${this.baseUrl}/${this.endpoint}/paciente/${pacienteId}`);
  }
}