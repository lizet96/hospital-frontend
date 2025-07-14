import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { UsuariosService, Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../../../services/usuarios.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CrudResponse } from '../../../services/base-crud.service';

@Component({
  selector: 'app-usuarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule],
  providers: [MessageService],
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
    private messageService: MessageService
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al cargar usuarios'
        });
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
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente'
            });
            this.loadUsuarios();
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al eliminar usuario'
          });
        }
      });
    }
  }

  saveUsuario(usuarioData: any) {
    if (this.selectedUsuario?.id_usuario) {
      // Actualizar usuario existente
      const updateData: UpdateUsuarioRequest = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        email: usuarioData.email,
        fecha_nacimiento: usuarioData.fecha_nacimiento,
        tipo: usuarioData.tipo
      };
      
      this.usuariosService.update(this.selectedUsuario.id_usuario, updateData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado correctamente'
            });
            this.closeForm();
            this.loadUsuarios();
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al actualizar usuario'
          });
        }
      });
    } else {
      // Crear nuevo usuario
      const createData: CreateUsuarioRequest = {
        nombre: usuarioData.nombre,
        apellido: usuarioData.apellido,
        email: usuarioData.email,
        fecha_nacimiento: usuarioData.fecha_nacimiento,
        tipo: usuarioData.tipo
      };
      
      this.usuariosService.create(createData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado correctamente'
            });
            this.closeForm();
            this.loadUsuarios();
          }
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al crear usuario'
          });
        }
      });
    }
  }

  closeForm() {
    this.showForm = false;
    this.selectedUsuario = null;
  }
}