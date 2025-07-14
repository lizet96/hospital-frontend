import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermissionsService } from '../services/permissions.service';
import { HasPermissionDirective, CanReadDirective, CanCreateDirective, CanUpdateDirective, CanDeleteDirective } from '../directives/has-permission.directive';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-permissions-example',
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
    <div class="permissions-example">
      <h2>Ejemplo de Sistema de Permisos</h2>
      
      <!-- Información del usuario actual -->
      <div class="user-info">
        <h3>Información del Usuario</h3>
        <p><strong>Rol:</strong> {{ (userRole$ | async)?.nombre || 'Cargando...' }}</p>
        <p><strong>ID Rol:</strong> {{ (userRole$ | async)?.id }}</p>
      </div>

      <!-- Permisos del usuario -->
      <div class="permissions-info">
        <h3>Permisos del Usuario</h3>
        <div *ngIf="(userPermissions$ | async) as permissions">
          <div *ngIf="permissions.length > 0; else noPermissions">
            <ul>
              <li *ngFor="let permission of permissions">
                <strong>{{ permission.nombre }}</strong> - {{ permission.recurso }}.{{ permission.accion }}
                <small>({{ permission.descripcion }})</small>
              </li>
            </ul>
          </div>
          <ng-template #noPermissions>
            <p>No se han cargado permisos aún.</p>
          </ng-template>
        </div>
      </div>

      <!-- Ejemplos de uso de directivas -->
      <div class="directive-examples">
        <h3>Ejemplos de Directivas de Permisos</h3>
        
        <!-- Ejemplo con permiso específico -->
        <div class="example-section">
          <h4>Por Permiso Específico</h4>
          <div *appHasPermission="'Gestionar Usuarios'" class="permission-granted">
            ✅ Tienes permiso para "Gestionar Usuarios"
          </div>
          <div *appHasPermission="'Administrar Sistema'" class="permission-granted">
            ✅ Tienes permiso para "Administrar Sistema"
          </div>
        </div>

        <!-- Ejemplo con recurso y acción -->
        <div class="example-section">
          <h4>Por Recurso y Acción</h4>
          <div *appHasPermission appHasPermissionResource="usuarios" appHasPermissionAction="read" class="permission-granted">
            ✅ Puedes leer usuarios
          </div>
          <div *appHasPermission appHasPermissionResource="usuarios" appHasPermissionAction="create" class="permission-granted">
            ✅ Puedes crear usuarios
          </div>
          <div *appHasPermission appHasPermissionResource="usuarios" appHasPermissionAction="update" class="permission-granted">
            ✅ Puedes actualizar usuarios
          </div>
          <div *appHasPermission appHasPermissionResource="usuarios" appHasPermissionAction="delete" class="permission-granted">
            ✅ Puedes eliminar usuarios
          </div>
        </div>

        <!-- Ejemplos con directivas específicas -->
        <div class="example-section">
          <h4>Directivas Específicas por Acción</h4>
          
          <div *appCanRead="'pacientes'" class="permission-granted">
            ✅ Puedes ver pacientes
          </div>
          
          <div *appCanCreate="'pacientes'" class="permission-granted">
            ✅ Puedes crear pacientes
          </div>
          
          <div *appCanUpdate="'pacientes'" class="permission-granted">
            ✅ Puedes actualizar pacientes
          </div>
          
          <div *appCanDelete="'pacientes'" class="permission-granted">
            ✅ Puedes eliminar pacientes
          </div>
        </div>

        <!-- Botones de ejemplo -->
        <div class="example-section">
          <h4>Botones Condicionales</h4>
          
          <button *appCanCreate="'consultas'" class="btn btn-primary" (click)="createConsulta()">
            Crear Consulta
          </button>
          
          <button *appCanUpdate="'expedientes'" class="btn btn-warning" (click)="updateExpediente()">
            Actualizar Expediente
          </button>
          
          <button *appCanDelete="'recetas'" class="btn btn-danger" (click)="deleteReceta()">
            Eliminar Receta
          </button>
          
          <button *appHasPermission="'Generar Reportes'" class="btn btn-info" (click)="generateReport()">
            Generar Reporte
          </button>
        </div>
      </div>

      <!-- Métodos de verificación programática -->
      <div class="programmatic-examples">
        <h3>Verificación Programática</h3>
        
        <div class="example-section">
          <h4>Métodos del Servicio</h4>
          <button class="btn btn-secondary" (click)="checkPermissions()">
            Verificar Permisos en Consola
          </button>
          
          <div class="results" *ngIf="checkResults">
            <h5>Resultados:</h5>
            <ul>
              <li *ngFor="let result of checkResults">
                {{ result.description }}: 
                <span [class]="result.hasPermission ? 'text-success' : 'text-danger'">
                  {{ result.hasPermission ? '✅ Sí' : '❌ No' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .permissions-example {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .user-info, .permissions-info, .directive-examples, .programmatic-examples {
      margin-bottom: 30px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .example-section {
      margin-bottom: 20px;
      padding: 10px;
      border-left: 4px solid #007bff;
      background-color: white;
    }

    .permission-granted {
      padding: 8px 12px;
      margin: 5px 0;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      color: #155724;
    }

    .btn {
      padding: 8px 16px;
      margin: 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary { background-color: #007bff; color: white; }
    .btn-warning { background-color: #ffc107; color: black; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-info { background-color: #17a2b8; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }

    .text-success { color: #28a745; font-weight: bold; }
    .text-danger { color: #dc3545; font-weight: bold; }

    .results {
      margin-top: 15px;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    ul {
      list-style-type: none;
      padding-left: 0;
    }

    li {
      padding: 5px 0;
      border-bottom: 1px solid #eee;
    }

    h2, h3, h4, h5 {
      color: #333;
      margin-bottom: 15px;
    }

    small {
      color: #666;
      font-style: italic;
    }
  `]
})
export class PermissionsExampleComponent implements OnInit {
  userPermissions$: Observable<any[]>;
  userRole$: Observable<any>;
  checkResults: any[] = [];

  constructor(private permissionsService: PermissionsService) {
    this.userPermissions$ = this.permissionsService.userPermissions$;
    this.userRole$ = this.permissionsService.userRole$;
  }

  ngOnInit() {
    // Los permisos se cargan automáticamente cuando el usuario se autentica
  }

  createConsulta() {
    console.log('Creando nueva consulta...');
    alert('Función: Crear Consulta');
  }

  updateExpediente() {
    console.log('Actualizando expediente...');
    alert('Función: Actualizar Expediente');
  }

  deleteReceta() {
    console.log('Eliminando receta...');
    alert('Función: Eliminar Receta');
  }

  generateReport() {
    console.log('Generando reporte...');
    alert('Función: Generar Reporte');
  }

  checkPermissions() {
    this.checkResults = [
      {
        description: 'Puede leer usuarios',
        hasPermission: this.permissionsService.canRead('usuarios')
      },
      {
        description: 'Puede crear pacientes',
        hasPermission: this.permissionsService.canCreate('pacientes')
      },
      {
        description: 'Puede actualizar consultas',
        hasPermission: this.permissionsService.canUpdate('consultas')
      },
      {
        description: 'Puede eliminar expedientes',
        hasPermission: this.permissionsService.canDelete('expedientes')
      },
      {
        description: 'Tiene permiso "Gestionar Usuarios"',
        hasPermission: this.permissionsService.hasPermission('Gestionar Usuarios')
      },
      {
        description: 'Tiene permiso "Administrar Sistema"',
        hasPermission: this.permissionsService.hasPermission('Administrar Sistema')
      }
    ];

    console.log('Resultados de verificación de permisos:', this.checkResults);
  }
}