# Sistema de Permisos Basado en Roles

Este documento explica cómo usar el sistema de permisos implementado en la aplicación del hospital.

## Arquitectura del Sistema

### Backend (Go)
- **Tablas de base de datos:**
  - `Rol`: Define los roles del sistema
  - `Permiso`: Define los permisos disponibles
  - `RolPermiso`: Relaciona roles con permisos
  - `Usuario`: Incluye `id_rol` para asociar usuarios con roles

- **Endpoint:** `GET /api/v1/roles/:id/permisos`
  - Retorna todos los permisos asociados a un rol específico

### Frontend (Angular)
- **PermissionsService**: Maneja la lógica de permisos
- **Guards**: Protegen rutas basándose en permisos
- **Directivas**: Muestran/ocultan elementos del DOM

## Uso del Sistema

### 1. Servicio de Permisos (PermissionsService)

```typescript
import { PermissionsService } from './services/permissions.service';

constructor(private permissionsService: PermissionsService) {}

// Verificar permisos específicos
if (this.permissionsService.hasPermission('Gestionar Usuarios')) {
  // El usuario tiene este permiso
}

// Verificar permisos por recurso y acción
if (this.permissionsService.canRead('pacientes')) {
  // El usuario puede leer pacientes
}

if (this.permissionsService.canCreate('consultas')) {
  // El usuario puede crear consultas
}

if (this.permissionsService.canUpdate('expedientes')) {
  // El usuario puede actualizar expedientes
}

if (this.permissionsService.canDelete('recetas')) {
  // El usuario puede eliminar recetas
}
```

### 2. Guards de Rutas

#### Configuración en las rutas:

```typescript
import { PermissionsGuard, CanReadGuard, CanWriteGuard, CanDeleteGuard } from './guards/permissions.guard';

const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [PermissionsGuard],
    data: { 
      permissions: ['Gestionar Usuarios'] // Por nombre de permiso
    }
  },
  {
    path: 'pacientes',
    component: PacientesComponent,
    canActivate: [CanReadGuard],
    data: { 
      resource: 'pacientes' // Por recurso (asume acción 'read')
    }
  },
  {
    path: 'consultas/crear',
    component: CrearConsultaComponent,
    canActivate: [CanWriteGuard],
    data: { 
      resource: 'consultas',
      action: 'create'
    }
  },
  {
    path: 'expedientes/editar/:id',
    component: EditarExpedienteComponent,
    canActivate: [CanWriteGuard],
    data: { 
      resource: 'expedientes',
      action: 'update'
    }
  }
];
```

### 3. Directivas Estructurales

#### Directiva principal (appHasPermission):

```html
<!-- Por nombre de permiso -->
<div *appHasPermission="'Gestionar Usuarios'">
  Solo visible si tiene el permiso "Gestionar Usuarios"
</div>

<!-- Por recurso y acción -->
<button *appHasPermission 
        appHasPermissionResource="usuarios" 
        appHasPermissionAction="create">
  Crear Usuario
</button>

<!-- Solo por recurso (asume 'read') -->
<div *appHasPermission appHasPermissionResource="pacientes">
  Lista de pacientes
</div>
```

#### Directivas específicas por acción:

```html
<!-- Para lectura -->
<div *appCanRead="'expedientes'">
  Lista de expedientes
</div>

<!-- Para creación -->
<button *appCanCreate="'consultas'" (click)="crearConsulta()">
  Nueva Consulta
</button>

<!-- Para actualización -->
<button *appCanUpdate="'pacientes'" (click)="editarPaciente()">
  Editar Paciente
</button>

<!-- Para eliminación -->
<button *appCanDelete="'recetas'" (click)="eliminarReceta()">
  Eliminar Receta
</button>
```

### 4. Ejemplo Completo en un Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';

@Component({
  selector: 'app-usuarios',
  template: `
    <div class="usuarios-container">
      <h2>Gestión de Usuarios</h2>
      
      <!-- Botón crear solo si tiene permisos -->
      <button *appCanCreate="'usuarios'" 
              class="btn btn-primary" 
              (click)="crearUsuario()">
        Crear Usuario
      </button>
      
      <!-- Lista de usuarios -->
      <div *appCanRead="'usuarios'">
        <table class="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th *appCanUpdate="'usuarios'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let usuario of usuarios">
              <td>{{ usuario.nombre }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.rol.nombre }}</td>
              <td *appCanUpdate="'usuarios'">
                <button class="btn btn-sm btn-warning" 
                        (click)="editarUsuario(usuario.id)">
                  Editar
                </button>
                <button *appCanDelete="'usuarios'"
                        class="btn btn-sm btn-danger" 
                        (click)="eliminarUsuario(usuario.id)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Mensaje si no tiene permisos de lectura -->
      <div *ngIf="!canReadUsuarios" class="alert alert-warning">
        No tienes permisos para ver la lista de usuarios.
      </div>
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  canReadUsuarios = false;

  constructor(private permissionsService: PermissionsService) {}

  ngOnInit() {
    // Verificar permisos programáticamente
    this.canReadUsuarios = this.permissionsService.canRead('usuarios');
    
    if (this.canReadUsuarios) {
      this.cargarUsuarios();
    }
  }

  crearUsuario() {
    if (this.permissionsService.canCreate('usuarios')) {
      // Lógica para crear usuario
      console.log('Creando usuario...');
    }
  }

  editarUsuario(id: number) {
    if (this.permissionsService.canUpdate('usuarios')) {
      // Lógica para editar usuario
      console.log('Editando usuario:', id);
    }
  }

  eliminarUsuario(id: number) {
    if (this.permissionsService.canDelete('usuarios')) {
      // Lógica para eliminar usuario
      console.log('Eliminando usuario:', id);
    }
  }

  private cargarUsuarios() {
    // Cargar lista de usuarios
  }
}
```

## Configuración de Roles y Permisos

### Datos de Ejemplo

```sql
-- Roles
INSERT INTO Rol (nombre, descripcion) VALUES 
('Administrador', 'Acceso completo al sistema'),
('Doctor', 'Acceso a consultas y expedientes'),
('Enfermero', 'Acceso limitado a consultas'),
('Recepcionista', 'Acceso a citas y pacientes');

-- Permisos
INSERT INTO Permiso (nombre, descripcion, recurso, accion) VALUES 
('Gestionar Usuarios', 'Crear, leer, actualizar y eliminar usuarios', 'usuarios', 'all'),
('Ver Pacientes', 'Visualizar información de pacientes', 'pacientes', 'read'),
('Crear Consultas', 'Crear nuevas consultas médicas', 'consultas', 'create'),
('Actualizar Expedientes', 'Modificar expedientes médicos', 'expedientes', 'update');

-- Asignación de permisos a roles
INSERT INTO RolPermiso (id_rol, id_permiso) VALUES 
(1, 1), -- Administrador: Gestionar Usuarios
(1, 2), -- Administrador: Ver Pacientes
(1, 3), -- Administrador: Crear Consultas
(1, 4), -- Administrador: Actualizar Expedientes
(2, 2), -- Doctor: Ver Pacientes
(2, 3), -- Doctor: Crear Consultas
(2, 4); -- Doctor: Actualizar Expedientes
```

## Mejores Prácticas

1. **Granularidad**: Define permisos específicos por recurso y acción
2. **Nomenclatura**: Usa nombres descriptivos para permisos y recursos
3. **Verificación Doble**: Siempre verifica permisos tanto en frontend como backend
4. **Carga Lazy**: Los permisos se cargan automáticamente después del login
5. **Reactividad**: Usa observables para reaccionar a cambios de permisos
6. **Fallbacks**: Proporciona mensajes informativos cuando no hay permisos

## Troubleshooting

### Problema: Los permisos no se cargan
- Verificar que el token JWT contenga `id_rol`
- Verificar que el endpoint `/roles/:id/permisos` funcione correctamente
- Revisar la consola del navegador para errores

### Problema: Las directivas no funcionan
- Asegurarse de importar las directivas en el componente
- Verificar que el PermissionsService esté inyectado correctamente
- Comprobar que los permisos se hayan cargado antes de usar las directivas

### Problema: Los guards no protegen las rutas
- Verificar la configuración de rutas
- Asegurarse de que los guards estén importados correctamente
- Revisar que los datos de la ruta (`data`) estén configurados apropiadamente