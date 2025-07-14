# Sistema de Permisos Basado en Roles - Hospital Management

## 🎯 Resumen

Se ha implementado un sistema completo de permisos basado en roles que permite:
- Decodificar JWT para obtener `id_rol`
- Filtrar operaciones CRUD basándose en permisos del usuario
- Proteger rutas y componentes en el frontend
- Mostrar/ocultar elementos de UI según permisos

## 📁 Archivos Creados/Modificados

### Backend (Go)
- ✅ `handlers/usuarios.go` - Función `ObtenerPermisosPorRol`
- ✅ `routes.go` - Endpoint `GET /api/v1/roles/:id/permisos`

### Frontend (Angular)
- ✅ `services/permissions.service.ts` - Servicio principal de permisos
- ✅ `guards/permissions.guard.ts` - Guards para proteger rutas
- ✅ `directives/has-permission.directive.ts` - Directivas para UI
- ✅ `services/auth.service.ts` - Integración con permisos
- ✅ `examples/permissions-example.component.ts` - Componente de ejemplo
- ✅ `docs/permissions-usage.md` - Documentación completa

## 🚀 Uso Rápido

### 1. Proteger Rutas
```typescript
const routes: Routes = [
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [PermissionsGuard],
    data: { permissions: ['Gestionar Usuarios'] }
  }
];
```

### 2. Mostrar/Ocultar Elementos
```html
<!-- Por permiso específico -->
<button *appHasPermission="'Gestionar Usuarios'">
  Gestionar Usuarios
</button>

<!-- Por recurso y acción -->
<button *appCanCreate="'pacientes'">
  Crear Paciente
</button>
```

### 3. Verificación Programática
```typescript
if (this.permissionsService.canRead('expedientes')) {
  this.cargarExpedientes();
}
```

## 🔧 Configuración Requerida

### 1. Instalar Dependencia
```bash
npm install jwt-decode
```

### 2. Importar en Componentes
```typescript
import { PermissionsService } from './services/permissions.service';
import { HasPermissionDirective, CanReadDirective } from './directives/has-permission.directive';
```

### 3. Configurar Base de Datos
Asegúrate de tener las tablas:
- `Rol` (id, nombre, descripcion)
- `Permiso` (id, nombre, descripcion, recurso, accion)
- `RolPermiso` (id_rol, id_permiso)
- `Usuario` (con campo `id_rol`)

## 📊 Estructura de Permisos

### Formato de Permiso
```typescript
interface Permission {
  id: number;
  nombre: string;        // "Gestionar Usuarios"
  descripcion: string;   // "Crear, leer, actualizar..."
  recurso: string;       // "usuarios"
  accion: string;        // "create", "read", "update", "delete", "all"
}
```

### Ejemplo de Datos
```sql
-- Roles
INSERT INTO Rol VALUES (1, 'Administrador', 'Acceso completo');
INSERT INTO Rol VALUES (2, 'Doctor', 'Acceso médico');

-- Permisos
INSERT INTO Permiso VALUES (1, 'Gestionar Usuarios', 'CRUD usuarios', 'usuarios', 'all');
INSERT INTO Permiso VALUES (2, 'Ver Pacientes', 'Leer pacientes', 'pacientes', 'read');

-- Asignaciones
INSERT INTO RolPermiso VALUES (1, 1); -- Admin puede gestionar usuarios
INSERT INTO RolPermiso VALUES (2, 2); -- Doctor puede ver pacientes
```

## 🛡️ Guards Disponibles

- `PermissionsGuard` - Guard general con múltiples opciones
- `CanReadGuard` - Específico para permisos de lectura
- `CanWriteGuard` - Para crear/actualizar
- `CanDeleteGuard` - Para eliminación

## 🎨 Directivas Disponibles

- `*appHasPermission` - Directiva principal
- `*appCanRead` - Para elementos de lectura
- `*appCanCreate` - Para botones de creación
- `*appCanUpdate` - Para botones de edición
- `*appCanDelete` - Para botones de eliminación

## 🔄 Flujo de Funcionamiento

1. **Login**: Usuario se autentica y recibe JWT con `id_rol`
2. **Carga de Permisos**: `PermissionsService` decodifica JWT y obtiene permisos del backend
3. **Protección de Rutas**: Guards verifican permisos antes de permitir navegación
4. **UI Reactiva**: Directivas muestran/ocultan elementos según permisos
5. **Verificación Programática**: Componentes pueden verificar permisos en tiempo real

## 📝 Ejemplo de Uso Completo

Ver `examples/permissions-example.component.ts` para un ejemplo completo que demuestra:
- Todas las directivas en acción
- Verificación programática
- Manejo de permisos en componentes
- Interfaz de usuario reactiva

## 🐛 Troubleshooting

### Permisos no se cargan
- Verificar que JWT contenga `id_rol`
- Comprobar endpoint `/roles/:id/permisos`
- Revisar consola del navegador

### Directivas no funcionan
- Importar directivas en el componente
- Verificar inyección de `PermissionsService`
- Asegurar que permisos estén cargados

### Guards no protegen
- Verificar configuración de rutas
- Comprobar importación de guards
- Revisar datos de ruta (`data`)

## 📚 Documentación Adicional

Para más detalles, consulta:
- `docs/permissions-usage.md` - Documentación completa
- `examples/permissions-example.component.ts` - Ejemplos prácticos

---

**¡El sistema está listo para usar!** 🎉

Todos los componentes están integrados y funcionando. Solo necesitas:
1. Configurar los datos de roles y permisos en la base de datos
2. Importar las directivas y guards donde los necesites
3. Usar las directivas en tus templates
4. Configurar las rutas con los guards apropiados