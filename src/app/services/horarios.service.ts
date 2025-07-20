import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseCrudService, CrudResponse, StandardResponse } from './base-crud.service';

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
  getDisponibles(): Observable<CrudResponse<any[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/horarios/disponibles`).pipe(
      map(response => {
        try {
          console.log('Horarios disponibles raw response:', response);
          // Verificar si la respuesta tiene la estructura esperada
          if (!response || !response.body) {
            console.warn('Horarios response missing expected structure:', response);
            return {
              success: false,
              data: [],
              total: 0,
              message: 'Invalid response structure'
            };
          }
          
          // El backend devuelve {intCode, data} en response.body
          const horarios = response.body.data || [];
          
          return {
            success: response.statusCode >= 200 && response.statusCode < 300,
            data: Array.isArray(horarios) ? horarios : [],
            total: Array.isArray(horarios) ? horarios.length : 0,
            message: response.body.intCode || 'Success'
          };
        } catch (error) {
          console.error('Error processing horarios disponibles data:', error);
          return {
            success: false,
            data: [],
            total: 0,
            message: 'Error processing horarios data'
          };
        }
      }),
      catchError(error => {
        console.error('HTTP Error in horarios disponibles:', error);
        return of({
          success: false,
          data: [],
          total: 0,
          message: `HTTP Error: ${error.status} - ${error.message}`
        });
      })
    );
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