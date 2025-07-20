import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { UsuariosService, Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../../../services/usuarios.service';
import { AlertService } from '../../../services/alert.service';
import { CrudResponse } from '../../../services/base-crud.service';

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent],
  providers: [],
  template: `
    <div class="crud-container">
      <h2>Gestión de Usuarios</h2>
      
      <app-base-table
        [data]="usuarios"
        [columns]="columns"
        [actions]="actions"
        (actionClicked)="onActionClicked($event)">
      </app-base-table>
      
      <app-base-form
        [visible]="showForm"
        [formData]="selectedUsuario"
        [fields]="formFields"
        [title]="formTitle"
        [loading]="loading"
        (save)="saveUsuario($event)"
        (cancel)="closeForm()"
        (visibleChange)="showForm = $event">
      </app-base-form>
      
      <p-toast></p-toast>
    </div>
  `
})
export class UsuariosCrudComponent implements OnInit {
  usuarios: Usuario[] = [];
  selectedUsuario: Usuario | null = null;
  showForm = false;
  formTitle = '';
  loading = false;
  
  columns: TableColumn[] = [
    { field: 'id_usuario', header: 'ID' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'apellido', header: 'Apellido' },
    { field: 'email', header: 'Email' },
    { field: 'tipo', header: 'Tipo' },
    { field: 'created_at', header: 'Fecha Creación' }
  ];
  
  formFields: FormField[] = [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'apellido', label: 'Apellido', type: 'text', required: false },
    { key: 'email', label: 'Email', type: 'email', required: false },
    { key: 'password', label: 'Contraseña', type: 'password', required: true },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { 
      key: 'tipo', 
      label: 'Tipo', 
      type: 'select', 
      required: false,
      options: [
        { label: 'Médico', value: 'medico' },
        { label: 'Enfermera', value: 'enfermera' },
        { label: 'Paciente', value: 'paciente' },
        { label: 'Administrador', value: 'admin' }
      ]
    }
  ];
  
  actions: TableAction[] = [
    {
      label: 'Nuevo Usuario',
      icon: 'pi pi-plus',
      severity: 'success',
      action: () => this.createUsuario()
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'info',
      action: (item: Usuario) => this.editUsuario(item)
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      action: (item: Usuario) => this.deleteUsuario(item)
    }
  ];

  constructor(
    private usuariosService: UsuariosService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<Usuario[]>) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        } else {
          this.usuarios = [];
        }
      },
      error: (error: any) => {
        this.alertService.errorLoad('usuarios');
      }
    });
  }

  onActionClicked(event: { action: string, item?: Usuario }) {
    switch (event.action) {
      case 'create':
        this.createUsuario();
        break;
      case 'edit':
        this.editUsuario(event.item!);
        break;
      case 'delete':
        this.deleteUsuario(event.item!);
        break;
    }
  }

  createUsuario() {
    this.selectedUsuario = null;
    this.formTitle = 'Crear Usuario';
    this.showForm = true;
  }

  editUsuario(usuario: Usuario) {
    this.selectedUsuario = { ...usuario };
    this.formTitle = 'Editar Usuario';
    this.showForm = true;
  }

  deleteUsuario(usuario: Usuario) {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.usuariosService.delete(usuario.id_usuario!).subscribe({
        next: (response: CrudResponse<any>) => {
          if (response.success) {
            this.alertService.successDelete('usuario');
            this.loadUsuarios();
          }
        },
        error: (error: any) => {
          this.alertService.errorDelete('usuario');
        }
      });
    }
  }

  saveUsuario(usuarioData: any) {
    this.loading = true;
    
    if (this.selectedUsuario?.id_usuario) {
      // Actualizar usuario existente
      const updateData: UpdateUsuarioRequest = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        email: usuarioData.email,
        fecha_nacimiento: usuarioData.fecha_nacimiento
      };
      
      this.usuariosService.update(this.selectedUsuario.id_usuario, updateData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          this.loading = false;
          this.alertService.successUpdate('usuario');
          this.closeForm();
          this.loadUsuarios();
        },
        error: (error: any) => {
          this.loading = false;
          let errorMessage = 'Verifique que todos los datos sean válidos';
          
          // Intentar extraer el mensaje del servidor desde diferentes estructuras posibles
          if (error.error?.body?.data && Array.isArray(error.error.body.data) && error.error.body.data[0]?.error) {
            errorMessage = error.error.body.data[0].error;
          } else if (error.error?.data && Array.isArray(error.error.data) && error.error.data[0]?.error) {
            errorMessage = error.error.data[0].error;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'El email ya está en uso por otro usuario';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifique que todos los campos estén completos y sean correctos';
          }
          
          this.alertService.errorUpdate('usuario', errorMessage);
        }
      });
    } else {
      // Crear nuevo usuario
      const createData: CreateUsuarioRequest = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        email: usuarioData.email,
        password: usuarioData.password || 'defaultPassword123',
        fecha_nacimiento: usuarioData.fecha_nacimiento,
        id_rol: usuarioData.tipo === 'medico' ? 1 : usuarioData.tipo === 'enfermera' ? 2 : usuarioData.tipo === 'admin' ? 3 : 4
      };
      
      this.usuariosService.create(createData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          this.loading = false;
          this.alertService.successCreate('usuario');
          this.closeForm();
          this.loadUsuarios();
        },
        error: (error: any) => {
          this.loading = false;
          let errorMessage = 'Verifique que todos los datos sean válidos';
          
          // Intentar extraer el mensaje del servidor desde diferentes estructuras posibles
          if (error.error?.body?.data && Array.isArray(error.error.body.data) && error.error.body.data[0]?.error) {
            errorMessage = error.error.body.data[0].error;
          } else if (error.error?.data && Array.isArray(error.error.data) && error.error.data[0]?.error) {
            errorMessage = error.error.data[0].error;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 409) {
            errorMessage = 'El email ya está en uso por otro usuario';
          } else if (error.status === 400) {
            errorMessage = 'Datos inválidos. Verifique que todos los campos estén completos y sean correctos';
          } else if (error.status === 422) {
            errorMessage = 'La contraseña debe tener al menos 8 caracteres';
          }
          
          this.alertService.errorCreate('usuario', errorMessage);
        }
      });
    }
  }

  closeForm() {
    this.showForm = false;
    this.selectedUsuario = null;
    this.loading = false;
  }
}