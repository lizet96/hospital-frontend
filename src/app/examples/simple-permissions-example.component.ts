import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../services/permissions.service';
import { HasPermissionDirective, CanReadDirective, CanCreateDirective, CanUpdateDirective, CanDeleteDirective } from '../directives/has-permission.directive';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-simple-permissions-example',
  standalone: true,
  imports: [
    CommonModule,
    HasPermissionDirective,
    CanReadDirective,
    CanCreateDirective,
    CanUpdateDirective,
    CanDeleteDirective
  ],
  template: `
    <div class="container mt-4">
      <h2>Sistema de Permisos - Ejemplo Simple</h2>
      
      <!-- Información del rol actual -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Información del Usuario</h5>
        </div>
        <div class="card-body">
          <p><strong>Rol:</strong> {{ (userRole$ | async)?.nombre || 'No definido' }}</p>
          <p><strong>Permisos totales:</strong> {{ (userPermissions$ | async)?.length || 0 }}</p>
        </div>
      </div>

      <!-- Ejemplo de botones con permisos -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Botones con Permisos</h5>
        </div>
        <div class="card-body">
          <div class="btn-group" role="group">
            <button *appCanRead="'usuarios'" class="btn btn-info me-2" (click)="showMessage('Leer usuarios')">
              👁️ Ver Usuarios
            </button>
            
            <button *appCanCreate="'usuarios'" class="btn btn-success me-2" (click)="showMessage('Crear usuario')">
              ➕ Crear Usuario
            </button>
            
            <button *appCanUpdate="'usuarios'" class="btn btn-warning me-2" (click)="showMessage('Actualizar usuario')">
              ✏️ Editar Usuario
            </button>
            
            <button *appCanDelete="'usuarios'" class="btn btn-danger me-2" (click)="showMessage('Eliminar usuario')">
              🗑️ Eliminar Usuario
            </button>
          </div>
        </div>
      </div>

      <!-- Ejemplo de secciones con permisos -->
      <div class="row">
        <div class="col-md-6">
          <div *appCanRead="'pacientes'" class="card">
            <div class="card-header bg-primary text-white">
              <h6>📋 Gestión de Pacientes</h6>
            </div>
            <div class="card-body">
              <p>Esta sección solo es visible si puedes leer pacientes.</p>
              <button *appCanCreate="'pacientes'" class="btn btn-sm btn-success" (click)="showMessage('Crear paciente')">
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div *appCanRead="'consultas'" class="card">
            <div class="card-header bg-success text-white">
              <h6>🩺 Gestión de Consultas</h6>
            </div>
            <div class="card-body">
              <p>Esta sección solo es visible si puedes leer consultas.</p>
              <button *appCanCreate="'consultas'" class="btn btn-sm btn-success" (click)="showMessage('Crear consulta')">
                Nueva Consulta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ejemplo de verificación programática -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>Verificación Programática</h5>
        </div>
        <div class="card-body">
          <button class="btn btn-secondary" (click)="checkAllPermissions()">
            Verificar Todos los Permisos
          </button>
          
          <div *ngIf="permissionResults.length > 0" class="mt-3">
            <h6>Resultados:</h6>
            <ul class="list-group">
              <li *ngFor="let result of permissionResults" 
                  class="list-group-item d-flex justify-content-between align-items-center">
                {{ result.description }}
                <span class="badge" [class]="result.hasPermission ? 'bg-success' : 'bg-danger'">
                  {{ result.hasPermission ? '✅ Sí' : '❌ No' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div *ngIf="message" class="alert alert-info mt-3" role="alert">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
    }
    
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .btn-group .btn {
      margin-right: 0.5rem;
    }
    
    .list-group-item {
      border: 1px solid #dee2e6;
    }
    
    .badge {
      font-size: 0.8em;
    }
  `]
})
export class SimplePermissionsExampleComponent implements OnInit {
  userPermissions$: Observable<any[]>;
  userRole$: Observable<any>;
  permissionResults: any[] = [];
  message: string = '';

  constructor(private permissionsService: PermissionsService) {
    this.userPermissions$ = this.permissionsService.userPermissions$;
    this.userRole$ = this.permissionsService.userRole$;
  }

  ngOnInit() {
    // Los permisos se cargan automáticamente
  }

  showMessage(action: string) {
    this.message = `Acción ejecutada: ${action}`;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  checkAllPermissions() {
    this.permissionResults = [
      {
        description: 'Leer usuarios',
        hasPermission: this.permissionsService.canRead('usuarios')
      },
      {
        description: 'Crear usuarios',
        hasPermission: this.permissionsService.canCreate('usuarios')
      },
      {
        description: 'Actualizar usuarios',
        hasPermission: this.permissionsService.canUpdate('usuarios')
      },
      {
        description: 'Eliminar usuarios',
        hasPermission: this.permissionsService.canDelete('usuarios')
      },
      {
        description: 'Leer pacientes',
        hasPermission: this.permissionsService.canRead('pacientes')
      },
      {
        description: 'Crear pacientes',
        hasPermission: this.permissionsService.canCreate('pacientes')
      },
      {
        description: 'Leer consultas',
        hasPermission: this.permissionsService.canRead('consultas')
      },
      {
        description: 'Crear consultas',
        hasPermission: this.permissionsService.canCreate('consultas')
      },
      {
        description: 'Permiso "Gestionar Usuarios"',
        hasPermission: this.permissionsService.hasPermission('Gestionar Usuarios')
      },
      {
        description: 'Permiso "Administrar Sistema"',
        hasPermission: this.permissionsService.hasPermission('Administrar Sistema')
      }
    ];
  }
}