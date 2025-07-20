import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseCrudService, CrudResponse, StandardResponse } from './base-crud.service';

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
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}/disponibles`).pipe(
      map(response => {
        try {
          // Adaptar el formato StandardResponse al formato CrudResponse esperado
          const adaptedData = response.body.data[0]; // Los datos están en el primer elemento del array
          const consultorios = adaptedData.consultorios_disponibles || adaptedData.consultorios || [];
          return {
            success: response.statusCode >= 200 && response.statusCode < 300,
            data: Array.isArray(consultorios) ? consultorios : [],
            total: adaptedData.total || consultorios.length,
            message: response.body.intCode
          };
        } catch (error) {
          console.error('Error processing consultorios disponibles:', error);
          return {
            success: false,
            data: [],
            total: 0,
            message: 'Error processing data'
          };
        }
      })
    );
  }
}