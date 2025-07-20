import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CrudResponse<T> {
  success?: boolean;
  data?: T;
  total?: number;
  message?: string;
  error?: string;
}

// Nueva interfaz para el formato StandardResponse del backend
export interface StandardResponse<T> {
  statusCode: number;
  body: {
    intCode: string;
    data: T[];
  };
}

@Injectable({
  providedIn: 'root'
})
export abstract class BaseCrudService<T, CreateRequest = Partial<T>, UpdateRequest = Partial<T>> {
  protected baseUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  protected abstract endpoint: string;
  
  constructor(protected http: HttpClient) {}
  
  getAll(): Observable<CrudResponse<T[]>> {
    return this.http.get<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}`).pipe(
      map(response => {
        try {
          console.log('Raw response:', response);
          // Verificar si la respuesta tiene la estructura esperada
          if (!response || !response.body || !response.body.data) {
            console.warn('Response missing expected structure:', response);
            return {
              success: false,
              data: [],
              total: 0,
              message: 'Invalid response structure'
            };
          }
          
          // Adaptar el formato StandardResponse al formato CrudResponse esperado
          const adaptedData = response.body.data[0]; // Los datos están en el primer elemento del array
          const extractedData = adaptedData.usuarios || adaptedData.pacientes || adaptedData.consultas || adaptedData.horarios || adaptedData.consultorios || adaptedData.expedientes || adaptedData.recetas || adaptedData;
          
          return {
            success: response.statusCode >= 200 && response.statusCode < 300,
            data: Array.isArray(extractedData) ? extractedData : [],
            total: adaptedData.total || (Array.isArray(extractedData) ? extractedData.length : 0),
            message: response.body.intCode
          };
        } catch (error) {
          console.error('Error processing response data:', error);
          return {
            success: false,
            data: [],
            total: 0,
            message: 'Error processing data'
          };
        }
      }),
      catchError(error => {
        console.error('HTTP Error:', error);
        return of({
          success: false,
          data: [],
          total: 0,
          message: `HTTP Error: ${error.status} - ${error.message}`
        });
      })
    );
  }
  
  getById(id: number): Observable<CrudResponse<T>> {
    return this.http.get<StandardResponse<T>>(`${this.baseUrl}/${this.endpoint}/${id}`).pipe(
      map(response => ({
        success: response.statusCode >= 200 && response.statusCode < 300,
        data: response.body.data[0] as T,
        message: response.body.intCode
      }))
    );
  }
  
  create(data: CreateRequest): Observable<CrudResponse<T>> {
    return this.http.post<StandardResponse<T>>(`${this.baseUrl}/${this.endpoint}`, data).pipe(
      map(response => ({
        success: response.statusCode >= 200 && response.statusCode < 300,
        data: response.body.data[0] as T,
        message: response.body.intCode
      }))
    );
  }
  
  update(id: number, data: UpdateRequest): Observable<CrudResponse<T>> {
    return this.http.put<StandardResponse<T>>(`${this.baseUrl}/${this.endpoint}/${id}`, data).pipe(
      map(response => ({
        success: response.statusCode >= 200 && response.statusCode < 300,
        data: response.body.data[0] as T,
        message: response.body.intCode
      }))
    );
  }
  
  delete(id: number): Observable<CrudResponse<any>> {
    return this.http.delete<StandardResponse<any>>(`${this.baseUrl}/${this.endpoint}/${id}`).pipe(
      map(response => ({
        success: response.statusCode >= 200 && response.statusCode < 300,
        data: response.body.data[0],
        message: response.body.intCode
      }))
    );
  }
}