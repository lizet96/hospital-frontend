import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: {
    id: number;
    nombre: string;
    permisos: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  mfa_code?: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  id_rol: number;
  fecha_nacimiento: string;
}

export interface AuthResponse {
  statusCode: number;
  body: {
    intCode: string;
    data: any[];
  };
}

export interface BackendLoginResponse {
  requires_mfa: boolean;
  qr_code_url?: string;
  secret?: string;
  backup_codes?: string[];
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  usuario?: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    fecha_nacimiento: string;
    id_rol: number;
    created_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'hospital_token';
  private initializationComplete = new BehaviorSubject<boolean>(false);
  public initialized$ = this.initializationComplete.asObservable();

  constructor(
    private http: HttpClient
  ) {
    // Verificar si hay un token guardado al inicializar
    this.checkStoredToken();
  }

  private checkStoredToken() {
    const token = this.getToken();
    if (token) {
      // Validar el token con el backend
      this.validateToken().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.initializationComplete.next(true);
        },
        error: () => {
          this.removeToken();
          this.currentUserSubject.next(null);
          this.initializationComplete.next(true);
        }
      });
    } else {
      // No hay token, marcar como inicializado
      this.initializationComplete.next(true);
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          // El registro exitoso tiene statusCode 201 y intCode "S02"
          if (response.statusCode === 201 && response.body.intCode === 'S02') {
            // Para el registro, no se devuelven tokens automáticamente
            // El usuario necesitará hacer login después del registro
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<BackendLoginResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map(response => {
          // Extraer los datos del formato del backend
          if (response.statusCode === 200 && response.body.data && response.body.data.length > 0) {
            return response.body.data[0] as BackendLoginResponse;
          }
          throw new Error('Respuesta inválida del servidor');
        }),
        tap(loginResponse => {
          // Si el login es exitoso y no requiere MFA, guardar tokens
          if (!loginResponse.requires_mfa && loginResponse.access_token && loginResponse.usuario) {
            this.setToken(loginResponse.access_token);
            const user: User = {
              id: loginResponse.usuario.id_usuario,
              nombre: loginResponse.usuario.nombre,
              apellido: loginResponse.usuario.apellido,
              email: loginResponse.usuario.email,
              rol: {
                id: loginResponse.usuario.id_rol,
                nombre: '',
                permisos: []
              }
            };
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  logout(): void {
    // Llamar al endpoint de logout del backend
    this.http.post(`${this.baseUrl}/auth/logout`, {}).pipe(
      catchError(() => of(null)) // Si falla, continuar con el logout local
    ).subscribe(() => {
      this.performLogout();
    });
  }

  performLogout(): void {
    this.removeToken();
    this.currentUserSubject.next(null);
  }

  validateToken(): Observable<User> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/perfil`).pipe(
      map(response => {
        // Manejar la respuesta del backend que puede tener estructura diferente
        if (response && response.data && response.data.length > 0) {
          const userData = response.data[0];
          return {
            id: userData.id_usuario || userData.id,
            nombre: userData.nombre,
            apellido: userData.apellido,
            email: userData.email,
            rol: {
              id: userData.id_rol || userData.rol?.id || 0,
              nombre: userData.rol?.nombre || '',
              permisos: userData.rol?.permisos || []
            }
          } as User;
        } else if (response && response.id) {
          // Si la respuesta ya tiene la estructura correcta
          return response as User;
        }
        throw new Error('Respuesta inválida del servidor');
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.rol.permisos.includes(permission) || false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  isInitialized(): boolean {
    return this.initializationComplete.value;
  }
}