import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { BaseCrudService, CrudResponse, StandardResponse } from './base-crud.service';

export interface Consulta {
  id_consulta?: number;
  tipo?: string;
  diagnostico?: string;
  costo?: number;
  id_paciente?: number;
  id_medico?: number;
  id_horario?: number;
  hora?: string;
  paciente_nombre?: string;
  medico_nombre?: string;
  consultorio_nombre?: string;
  horario_turno?: string;
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
  hora: string;
}

export interface UpdateConsultaRequest {
  tipo?: string;
  diagnostico?: string;
  costo?: number;
  id_paciente?: number;
  id_medico?: number;
  id_horario?: number;
  hora?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultasService extends BaseCrudService<Consulta> {
  protected override endpoint = 'consultas';

  // Sobrescribir getAll para manejar específicamente las consultas
  override getAll(): Observable<CrudResponse<Consulta[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}`).pipe(
      map(response => {
        try {
          console.log('Consultas raw response:', response);
          console.log('Response body:', response.body);
          console.log('Response body data:', response.body.data);
          
          if (!response || !response.body || !response.body.data) {
            console.warn('Response missing expected structure:', response);
            return {
              success: false,
              data: [],
              total: 0,
              message: 'Invalid response structure'
            };
          }
          
          const adaptedData = response.body.data[0];
          console.log('Adapted data:', adaptedData);
          console.log('Adapted data keys:', Object.keys(adaptedData));
          
          const consultas = adaptedData.consultas || [];
          console.log('Extracted consultas:', consultas);
          
          return {
            success: response.statusCode >= 200 && response.statusCode < 300,
            data: Array.isArray(consultas) ? consultas : [],
            total: adaptedData.total || consultas.length,
            message: response.body.intCode
          };
        } catch (error) {
          console.error('Error processing consultas response:', error);
          return {
            success: false,
            data: [],
            total: 0,
            message: 'Error processing data'
          };
        }
      }),
      catchError(error => {
        console.error('HTTP Error in consultas:', error);
        return of({
          success: false,
          data: [],
          total: 0,
          message: `HTTP Error: ${error.status} - ${error.message}`
        });
      })
    );
  }

  getByPaciente(pacienteId: number): Observable<CrudResponse<Consulta[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}/paciente/${pacienteId}`).pipe(
      map(response => {
        const adaptedData = response.body.data[0];
        const consultas = adaptedData.consultas || adaptedData;
        return {
          success: response.statusCode >= 200 && response.statusCode < 300,
          data: Array.isArray(consultas) ? consultas : [],
          total: adaptedData.total || (Array.isArray(adaptedData) ? adaptedData.length : 0),
          message: response.body.intCode
        };
      })
    );
  }

  getByMedico(medicoId: number): Observable<CrudResponse<Consulta[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}/medico/${medicoId}`).pipe(
      map(response => {
        const adaptedData = response.body.data[0];
        const consultas = adaptedData.consultas || adaptedData;
        return {
          success: response.statusCode >= 200 && response.statusCode < 300,
          data: Array.isArray(consultas) ? consultas : [],
          total: adaptedData.total || (Array.isArray(adaptedData) ? adaptedData.length : 0),
          message: response.body.intCode
        };
      })
    );
  }
}
