import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { CrudResponse } from '../../../services/base-crud.service';
import { UsuariosService, Usuario } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService } from 'primeng/api';
import { AlertService } from '../../../services/alert.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface UsuarioExtended extends Usuario {
  password?: string;
}

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <div class="usuarios-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p>Administra los usuarios del sistema hospitalario</p>
        </div>
      </div>
      
      <app-base-table
        title="Usuarios"
        entityName="Usuario"
        [data]="usuarios"
        [columns]="columns"
        [actions]="actions"
        (onCreate)="openCreateForm()">
      </app-base-table>
      
      <app-base-form
        [visible]="showForm"
        [formData]="currentUser"
        [fields]="formFields"
        [title]="formTitle"
        [loading]="loading"
        (save)="saveUser($event)"
        (cancel)="closeForm()"
        (visibleChange)="showForm = $event">
      </app-base-form>
      
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .usuarios-crud {
      padding: 1.5rem;
      background: var(--surface-ground);
      min-height: 100vh;
    }

    .crud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--surface-card);
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .crud-header h2 {
      margin: 0;
      color: var(--text-color);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .crud-header p {
      margin: 0.5rem 0 0 0;
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }
  `]
})
export class UsuariosCrudComponent implements OnInit {
  usuarios: UsuarioExtended[] = [];
  currentUser: UsuarioExtended = this.getEmptyUser();
  showForm = false;
  loading = false;
  isEditing = false;
  canCreate = true;
  
  columns: TableColumn[] = [
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apellido', header: 'Apellido', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'rol_nombre', header: 'Rol', sortable: true },
    { field: 'fecha_nacimiento', header: 'Fecha Nacimiento', type: 'date' },
    { field: 'activo', header: 'Activo', type: 'boolean' }
  ];
  
  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      permission: 'ver_usuarios',
      action: (user) => this.viewUser(user)
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      action: (user) => this.editUser(user)
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (user) => this.deleteUser(user)
    }
  ];
  
  baseFormFields: FormField[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ingrese el nombre'
    },
    {
      key: 'apellido',
      label: 'Apellido',
      type: 'text',
      required: true,
      placeholder: 'Ingrese el apellido'
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'Ingrese el email'
    },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true,
      placeholder: 'Ingrese la contraseña'
    },
    {
      key: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      type: 'date',
      required: true
    },
    {
      key: 'id_rol',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { label: 'Administrador', value: 1 },
        { label: 'Médico', value: 2 },
        { label: 'Enfermero', value: 3 },
        { label: 'Paciente', value: 4 }
      ]
    },
    {
      key: 'activo',
      label: 'Usuario Activo',
      type: 'checkbox'
    }
  ];

  get formFields(): FormField[] {
    if (this.isEditing) {
      // Al editar, excluir el campo de contraseña
      return this.baseFormFields.filter(field => field.key !== 'password');
    } else {
      // Al crear, incluir todos los campos
      return this.baseFormFields;
    }
  }
  
  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {}
  
  ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.alertService.warning('Debe iniciar sesión para acceder a esta sección');
      return;
    }
    this.loadUsuarios();
  }
  
  get formTitle(): string {
    return this.isEditing ? 'Editar Usuario' : 'Crear Usuario';
  }
  
  private getEmptyUser(): UsuarioExtended {
    return {
      nombre: '',
      apellido: '',
      email: '',
      fecha_nacimiento: '',
      id_rol: 0,
      activo: true
    };
  }
  
  loadUsuarios() {
    console.log('Iniciando carga de usuarios...');
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<Usuario[]>) => {
        console.log('Respuesta del servidor:', response);
        this.usuarios = response.data || [];
        console.log('Usuarios cargados:', this.usuarios);
        console.log('Cantidad de usuarios:', this.usuarios.length);
      },
      error: (error: any) => {
        console.error('Error loading usuarios:', error);
        this.alertService.errorLoad('usuarios', 'No se pudieron cargar los datos del servidor');
      }
    });
  }
  
  openCreateForm() {
    this.currentUser = this.getEmptyUser();
    this.isEditing = false;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.currentUser = this.getEmptyUser();
    this.isEditing = false;
    this.baseFormFields.forEach(field => field.disabled = false);
  }
  
  viewUser(user: UsuarioExtended) {
    this.isEditing = false;
    this.currentUser = { ...user };
    this.baseFormFields.forEach(field => field.disabled = true);
    this.showForm = true;
  }
  
  editUser(user: UsuarioExtended) {
    this.isEditing = true;
    this.currentUser = { ...user };
    
    // Convertir fecha de nacimiento de string a Date para el DatePicker
    if (this.currentUser.fecha_nacimiento && typeof this.currentUser.fecha_nacimiento === 'string') {
      (this.currentUser as any).fecha_nacimiento = new Date(this.currentUser.fecha_nacimiento);
    }
    
    this.baseFormFields.forEach(field => field.disabled = false);
    this.showForm = true;
  }
  
  deleteUser(user: UsuarioExtended) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al usuario ${user.nombre} ${user.apellido}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.usuariosService.delete(user.id_usuario!).subscribe({
          next: (response: CrudResponse<any>) => {
            this.alertService.successDelete('Usuario');
            this.loadUsuarios();
          },
          error: (error: any) => {
            console.error('Error deleting usuario:', error);
            this.alertService.errorDelete('usuario', 'No se pudo completar la operación');
          }
        });
      }
    });
  }
  
  saveUser(userData: UsuarioExtended) {
    // Validaciones del lado del cliente (igual que en register)
    const missingFields: string[] = [];
    
    if (!userData.nombre?.trim()) {
      missingFields.push('Nombre');
    }
    if (!userData.apellido?.trim()) {
      missingFields.push('Apellido');
    }
    if (!userData.email?.trim()) {
      missingFields.push('Correo electrónico');
    }
    if (!this.isEditing && (!userData.password?.trim())) {
      missingFields.push('Contraseña');
    }
    if (!userData.fecha_nacimiento) {
      missingFields.push('Fecha de nacimiento');
    }
    if (!userData.id_rol) {
      missingFields.push('Rol');
    }

    if (missingFields.length > 0) {
      this.alertService.errorCreate('usuario', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }

    // Validar formato de email
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(userData.email || '')) {
       this.alertService.errorCreate('usuario', 'Correo electrónico inválido. Por favor, ingrese un correo válido (ejemplo: usuario@dominio.com)');
       return;
     }

    // Validar contraseña solo si no estamos editando o si se proporcionó una nueva contraseña
     if (!this.isEditing || (userData.password && userData.password.trim() !== '')) {
       const password = userData.password || '';
       // Validar longitud de contraseña
       if (password.length < 12) {
         this.alertService.errorCreate('usuario', 'Contraseña muy corta. La contraseña debe tener al menos 12 caracteres');
         return;
       }

       // Validar complejidad de contraseña
       const hasUpperCase = /[A-Z]/.test(password);
       const hasLowerCase = /[a-z]/.test(password);
       const hasNumbers = /\d/.test(password);
       const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
      
      const missingRequirements: string[] = [];
      if (!hasUpperCase) missingRequirements.push('al menos una letra mayúscula');
      if (!hasLowerCase) missingRequirements.push('al menos una letra minúscula');
      if (!hasNumbers) missingRequirements.push('al menos un número');
      if (!hasSpecialChar) missingRequirements.push('al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
      
      if (missingRequirements.length > 0) {
        this.alertService.errorCreate('usuario', `Contraseña no cumple los requisitos. Debe contener: ${missingRequirements.join(', ')}`);
        return;
      }
    }

    this.loading = true;
    
    // Convertir fecha de Date a string en formato YYYY-MM-DD si es necesario
    let fechaNacimiento: string | undefined = userData.fecha_nacimiento;
    if ((userData as any).fecha_nacimiento instanceof Date) {
      fechaNacimiento = ((userData as any).fecha_nacimiento as Date).toISOString().split('T')[0];
    }
    
    let operation;
    
    if (this.isEditing) {
      // Para actualizar, usar UpdateUsuarioRequest
      const updateData = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        fecha_nacimiento: fechaNacimiento,
        id_rol: userData.id_rol,
        activo: userData.activo
      };
      operation = this.usuariosService.update(this.currentUser.id_usuario!, updateData);
    } else {
      // Para crear, usar CreateUsuarioRequest
      const createData = {
        nombre: userData.nombre,
        apellido: userData.apellido || '',
        email: userData.email || '',
        password: userData.password || '',
        fecha_nacimiento: fechaNacimiento || '',
        id_rol: userData.id_rol || 1,
        activo: userData.activo !== undefined ? userData.activo : true
      };
      operation = this.usuariosService.create(createData);
    }
    
    operation.subscribe({
      next: (response: CrudResponse<Usuario>) => {
        if (this.isEditing) {
          this.alertService.successUpdate('Usuario');
        } else {
          this.alertService.successCreate('Usuario');
        }
        this.closeForm();
        this.loadUsuarios();
      },
      error: (error: any) => {
          console.error('Error saving usuario:', error);
          
          let errorMessage = '';
          
          // Manejar códigos de estado HTTP específicos (igual que en register)
           if (error.status === 409) {
             // Correo duplicado
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               errorMessage = error.error.body.data[0].error;
             } else {
               errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
             }
           } else if (error.status === 400) {
             // Error de validación
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               const serverError = error.error.body.data[0].error;
               // Verificar si es un error de correo duplicado
               if (serverError && (serverError.toLowerCase().includes('email') || serverError.toLowerCase().includes('correo')) && 
                   (serverError.toLowerCase().includes('registrado') || serverError.toLowerCase().includes('existe') || serverError.toLowerCase().includes('duplicado'))) {
                 errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
               } else {
                 errorMessage = serverError || 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
               }
             } else {
               errorMessage = 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
             }
           } else if (error.status === 500) {
             // Error del servidor
             errorMessage = 'Error interno del servidor. Por favor, intente nuevamente más tarde.';
           } else if (error.status === 0) {
             // Error de conexión
             errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
           } else {
             // Otros errores
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               errorMessage = error.error.body.data[0].error || errorMessage;
             } else if (error.message) {
               errorMessage = error.message;
             }
           }
          
          // Si no se pudo extraer un mensaje específico, usar mensajes por defecto
          if (!errorMessage) {
            if (this.isEditing) {
              errorMessage = 'Verifique que todos los datos sean válidos';
            } else {
              errorMessage = 'Verifique que el email no esté en uso y que todos los campos sean válidos';
            }
          }
          
          if (this.isEditing) {
            this.alertService.errorUpdate('usuario', errorMessage);
          } else {
            this.alertService.errorCreate('usuario', errorMessage);
          }
        },
      complete: () => {
        this.loading = false;
      }
    });
  }
}