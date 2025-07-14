import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { CrudResponse } from '../../../services/base-crud.service';
import { UsuariosService, Usuario } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface UsuarioExtended extends Usuario {
  password?: string;
}

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
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
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}
  
  ngOnInit() {
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe iniciar sesión para acceder a esta sección'
      });
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar usuarios'
        });
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
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente'
            });
            this.loadUsuarios();
          },
          error: (error: any) => {
            console.error('Error deleting usuario:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar usuario'
            });
          }
        });
      }
    });
  }
  
  saveUser(userData: UsuarioExtended) {
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
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Usuario ${this.isEditing ? 'actualizado' : 'creado'} correctamente`
        });
        this.closeForm();
        this.loadUsuarios();
      },
      error: (error: any) => {
        console.error('Error saving usuario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${this.isEditing ? 'actualizar' : 'crear'} usuario`
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}