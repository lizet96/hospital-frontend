import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { BaseCrudService, CrudResponse } from '../../../services/base-crud.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_nacimiento: string;
  id_rol: number;
  activo: boolean;
  rol_nombre?: string;
}

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule],
  providers: [MessageService],
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
        [actions]="actions">
      </app-base-table>

      <app-base-form
        *ngIf="showForm"
        [title]="formTitle"
        [fields]="formFields"
        [formData]="currentUser"
        [visible]="showForm"
        [loading]="loading"
        (save)="saveUser($event)"
        (cancel)="closeForm()"
        (visibleChange)="showForm = $event">
      </app-base-form>
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
  usuarios: Usuario[] = [];
  currentUser: Usuario = this.getEmptyUser();
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
  
  formFields: FormField[] = [
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
  
  constructor(
    private crudService: BaseCrudService<Usuario>,
    private authService: AuthService,
    private messageService: MessageService
  ) {}
  
  ngOnInit() {
    this.loadUsuarios();
  }
  
  get formTitle(): string {
    return this.isEditing ? 'Editar Usuario' : 'Crear Usuario';
  }
  
  private getEmptyUser(): Usuario {
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
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<Usuario[]>) => {
        this.usuarios = response.data || [];
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
    this.formFields.forEach(field => field.disabled = false);
  }
  
  viewUser(user: Usuario) {
    this.isEditing = false;
    this.currentUser = { ...user };
    this.formFields.forEach(field => field.disabled = true);
    this.showForm = true;
  }
  
  editUser(user: Usuario) {
    this.isEditing = true;
    this.currentUser = { ...user };
    this.formFields.forEach(field => field.disabled = false);
    this.showForm = true;
  }
  
  deleteUser(user: Usuario) {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
      this.crudService.delete(user.id_usuario!).subscribe({
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
  }
  
  saveUser(userData: Usuario) {
    this.loading = true;
    
    const operation = this.isEditing 
      ? this.crudService.update(this.currentUser.id_usuario!, userData)
      : this.crudService.create(userData);
    
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