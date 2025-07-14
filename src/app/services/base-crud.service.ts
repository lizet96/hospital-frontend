import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CrudResponse<T> {
  success?: boolean;
  data?: T;
  total?: number;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export abstract class BaseCrudService<T, CreateRequest = Partial<T>, UpdateRequest = Partial<T>> {
  protected baseUrl = environment.apiUrl || 'http://localhost:8080/api';
  protected abstract endpoint: string;
  
  constructor(protected http: HttpClient) {}
  
  getAll(): Observable<CrudResponse<T[]>> {
    return this.http.get<CrudResponse<T[]>>(`${this.baseUrl}/${this.endpoint}`);
  }
  
  getById(id: number): Observable<CrudResponse<T>> {
    return this.http.get<CrudResponse<T>>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }
  
  create(data: CreateRequest): Observable<CrudResponse<T>> {
    return this.http.post<CrudResponse<T>>(`${this.baseUrl}/${this.endpoint}`, data);
  }
  
  update(id: number, data: UpdateRequest): Observable<CrudResponse<T>> {
    return this.http.put<CrudResponse<T>>(`${this.baseUrl}/${this.endpoint}/${id}`, data);
  }
  
  delete(id: number): Observable<CrudResponse<any>> {
    return this.http.delete<CrudResponse<any>>(`${this.baseUrl}/${this.endpoint}/${id}`);
  }
}