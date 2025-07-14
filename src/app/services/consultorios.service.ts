import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService, CrudResponse } from './base-crud.service';

export interface Consultorio {
  id_consultorio?: number;
  ubicacion?: string;
  nombre_numero?: string;
}

export interface CreateConsultorioRequest {
  ubicacion?: string;
  nombre_numero?: string;
}

export interface UpdateConsultorioRequest {
  ubicacion?: string;
  nombre_numero?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultoriosService extends BaseCrudService<Consultorio> {
  protected override endpoint = 'consultorios';

  // Método específico para obtener consultorios disponibles
  getDisponibles(): Observable<CrudResponse<Consultorio[]>> {
    return this.http.get<CrudResponse<Consultorio[]>>(`${this.baseUrl}/${this.endpoint}/disponibles`);
  }
}