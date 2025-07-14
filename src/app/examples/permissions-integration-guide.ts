/**
 * GUÍA DE INTEGRACIÓN DEL SISTEMA DE PERMISOS
 * 
 * Este archivo muestra cómo integrar correctamente el sistema de permisos
 * en tu aplicación Angular.
 */

// ============================================================================
// 1. CONFIGURACIÓN EN APP.MODULE.TS (si usas módulos)
// ============================================================================

/*
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PermissionsService } from './services/permissions.service';
import { AuthService } from './services/auth.service';

// Importar guards
import { PermissionsGuard, CanReadGuard, CanWriteGuard, CanDeleteGuard } from './guards/permissions.guard';

// Importar directivas
import { HasPermissionDirective, CanReadDirective, CanCreateDirective, CanUpdateDirective, CanDeleteDirective } from './directives/has-permission.directive';

@NgModule({
  declarations: [
    AppComponent,
    // Agregar las directivas aquí si no son standalone
    HasPermissionDirective,
    CanReadDirective,
    CanCreateDirective,
    CanUpdateDirective,
    CanDeleteDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      // Tus rutas aquí
    ])
  ],
  providers: [
    PermissionsService,
    AuthService,
    PermissionsGuard,
    CanReadGuard,
    CanWriteGuard,
    CanDeleteGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
*/

// ============================================================================
// 2. CONFIGURACIÓN EN MAIN.TS (si usas standalone components)
// ============================================================================

/*
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Los servicios se inyectan automáticamente cuando son necesarios
  ]
});
*/

// ============================================================================
// 3. CONFIGURACIÓN DE RUTAS CON GUARDS
// ============================================================================

/*
import { Routes } from '@angular/router';
import { PermissionsGuard, CanReadGuard, CanWriteGuard, CanDeleteGuard } from './guards/permissions.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [PermissionsGuard],
    data: { requiredPermissions: ['Acceso Dashboard'] }
  },
  {
    path: 'usuarios',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/usuarios/lista-usuarios.component').then(m => m.ListaUsuariosComponent),
        canActivate: [CanReadGuard],
        data: { resource: 'usuarios' }
      },
      {
        path: 'crear',
        loadComponent: () => import('./pages/usuarios/crear-usuario.component').then(m => m.CrearUsuarioComponent),
        canActivate: [CanWriteGuard],
        data: { resource: 'usuarios' }
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./pages/usuarios/editar-usuario.component').then(m => m.EditarUsuarioComponent),
        canActivate: [CanWriteGuard],
        data: { resource: 'usuarios' }
      }
    ]
  },
  {
    path: 'pacientes',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/pacientes/lista-pacientes.component').then(m => m.ListaPacientesComponent),
        canActivate: [CanReadGuard],
        data: { resource: 'pacientes' }
      },
      {
        path: 'crear',
        loadComponent: () => import('./pages/pacientes/crear-paciente.component').then(m => m.CrearPacienteComponent),
        canActivate: [CanWriteGuard],
        data: { resource: 'pacientes' }
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [PermissionsGuard],
    data: { requiredPermissions: ['Administrar Sistema'] }
  }
];
*/

// ============================================================================
// 4. EJEMPLO DE COMPONENTE CON PERMISOS
// ============================================================================

/*
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../services/permissions.service';
import { HasPermissionDirective, CanReadDirective, CanCreateDirective } from '../directives/has-permission.directive';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [
    CommonModule,
    HasPermissionDirective,
    CanReadDirective,
    CanCreateDirective
  ],
  template: `
    <!-- Mostrar solo si tiene permiso específico -->
    <div *appHasPermission="'Gestionar Usuarios'">
      <h3>Panel de Administración de Usuarios</h3>
    </div>
    
    <!-- Mostrar solo si puede leer el recurso -->
    <div *appCanRead="'usuarios'">
      <table class="table">
        <!-- Lista de usuarios -->
      </table>
    </div>
    
    <!-- Botón solo si puede crear -->
    <button *appCanCreate="'usuarios'" class="btn btn-primary">
      Crear Usuario
    </button>
    
    <!-- Verificación programática -->
    <div *ngIf="canManageUsers">
      <p>Tienes permisos de gestión de usuarios</p>
    </div>
  `
})
export class MiComponente implements OnInit {
  canManageUsers = false;
  
  constructor(private permissionsService: PermissionsService) {}
  
  ngOnInit() {
    // Verificación programática
    this.canManageUsers = this.permissionsService.hasPermission('Gestionar Usuarios');
    
    // También puedes suscribirte a cambios
    this.permissionsService.userPermissions$.subscribe(permissions => {
      this.canManageUsers = this.permissionsService.hasPermission('Gestionar Usuarios');
    });
  }
  
  onCreateUser() {
    if (this.permissionsService.canCreate('usuarios')) {
      // Lógica para crear usuario
    } else {
      alert('No tienes permisos para crear usuarios');
    }
  }
}
*/

// ============================================================================
// 5. CONFIGURACIÓN DE INTERCEPTOR PARA MANEJO DE ERRORES 403
// ============================================================================

/*
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class PermissionsInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          // Redirigir a página de acceso denegado
          this.router.navigate(['/acceso-denegado']);
        }
        return throwError(() => error);
      })
    );
  }
}

// Agregar en providers:
// { provide: HTTP_INTERCEPTORS, useClass: PermissionsInterceptor, multi: true }
*/

// ============================================================================
// 6. ESTRUCTURA DE PERMISOS RECOMENDADA EN LA BASE DE DATOS
// ============================================================================

/*
-- Tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de permisos
CREATE TABLE permisos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    recurso VARCHAR(50), -- usuarios, pacientes, consultas, etc.
    accion VARCHAR(50),  -- read, create, update, delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación rol-permiso
CREATE TABLE rol_permisos (
    id SERIAL PRIMARY KEY,
    rol_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id INTEGER REFERENCES permisos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rol_id, permiso_id)
);

-- Datos de ejemplo
INSERT INTO roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Doctor', 'Acceso a consultas y pacientes'),
('Enfermero', 'Acceso limitado a pacientes'),
('Recepcionista', 'Acceso a citas y pacientes básico');

INSERT INTO permisos (nombre, descripcion, recurso, accion) VALUES 
('Gestionar Usuarios', 'Crear, editar y eliminar usuarios', 'usuarios', 'manage'),
('Ver Usuarios', 'Ver lista de usuarios', 'usuarios', 'read'),
('Crear Usuarios', 'Crear nuevos usuarios', 'usuarios', 'create'),
('Editar Usuarios', 'Modificar usuarios existentes', 'usuarios', 'update'),
('Eliminar Usuarios', 'Eliminar usuarios', 'usuarios', 'delete'),
('Ver Pacientes', 'Ver lista de pacientes', 'pacientes', 'read'),
('Crear Pacientes', 'Registrar nuevos pacientes', 'pacientes', 'create'),
('Editar Pacientes', 'Modificar datos de pacientes', 'pacientes', 'update'),
('Ver Consultas', 'Ver consultas médicas', 'consultas', 'read'),
('Crear Consultas', 'Registrar nuevas consultas', 'consultas', 'create'),
('Administrar Sistema', 'Acceso completo de administración', 'sistema', 'admin');
*/

export const PERMISSIONS_INTEGRATION_GUIDE = {
  message: 'Esta es una guía de integración del sistema de permisos. Revisa los comentarios en este archivo para ver ejemplos de implementación.'
};