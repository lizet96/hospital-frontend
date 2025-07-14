import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { UsuariosService, Usuario, CrudResponse } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface PacienteExtended extends Usuario {
  // Campos adicionales específicos para pacientes si los hay
}

@Component({
  selector: 'app-pacientes-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="pacientes-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Pacientes</h2>
          <p>Administra la información de los pacientes del hospital</p>
        </div>
      </div>
      
      <app-base-table
        title="Pacientes"
        entityName="Paciente"
        [data]="pacientes"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading"
        [canCreate]="canCreate"
        (onCreate)="openCreateForm()">
      </app-base-table>

      <app-base-form
        *ngIf="showForm"
        [title]="formTitle"
        [fields]="formFields"
        [formData]="selectedPaciente"
        [visible]="showForm"
        [loading]="formLoading"
        (save)="savePaciente($event)"
        (cancel)="closeForm()">
      </app-base-form>
    </div>
  `,
  styles: [`
    .pacientes-crud {
      padding: 0;
    }
    
    .crud-header {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, var(--hospital-primary), var(--hospital-secondary));
      border-radius: var(--hospital-border-radius);
      color: white;
      box-shadow: var(--hospital-shadow);
    }
    
    .crud-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.8rem;
      font-weight: 600;
    }
    
    .crud-header p {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }
  `]
})
export class PacientesCrudComponent implements OnInit {
  pacientes: PacienteExtended[] = [];
  loading = false;
  showForm = false;
  formLoading = false;
  isEditing = false;
  selectedPaciente: PacienteExtended | null = null;
  canCreate = true;
  currentUser: PacienteExtended | null = null;
  availableRoles: any[] = [];

  columns: TableColumn[] = [
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apellido', header: 'Apellido', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'fecha_nacimiento', header: 'Fecha Nacimiento', type: 'date' },
    { field: 'activo', header: 'Estado', type: 'boolean' }
  ];

  // Las acciones ya están correctamente definidas:
  actions: TableAction[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary' as const,
      action: (item: any) => this.editPaciente(item)
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger' as const,
      action: (item: any) => this.deletePaciente(item)
    }
  ];

  formFields: FormField[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true
    },
    {
      key: 'apellido',
      label: 'Apellido',
      type: 'text',
      required: true
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true
    },
    {
      key: 'password',
      label: 'Contraseña',
      type: 'password',
      required: true
    },
    {
      key: 'fecha_nacimiento',
      label: 'Fecha de Nacimiento',
      type: 'date',
      required: true
    },
   
  ];

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPacientes();
  }

  get formTitle(): string {
    return this.isEditing ? 'Editar Paciente' : 'Crear Paciente';
  }

  loadPacientes() {
    this.loading = true;
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<Usuario[]>) => {
        // Filtrar solo usuarios con id_rol = 4 (pacientes)
        const allUsers = response.data || [];
        this.pacientes = allUsers.filter((user: Usuario) => user.id_rol === 4);
        this.loading = false;
      },
      error: (_error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar pacientes'
        });
        this.loading = false;
      }
    });
  }

  private getEmptyPaciente(): PacienteExtended {
    return {
      nombre: '',
      apellido: '',
      email: '',
      fecha_nacimiento: '',
      id_rol: 4, // Siempre será paciente
      activo: true
    };
  }

  openCreateForm() {
    this.selectedPaciente = this.getEmptyPaciente();
    this.isEditing = false;
    // Al crear, hacer que la contraseña sea requerida
    this.formFields.find(field => field.key === 'password')!.required = true;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedPaciente = null;
    this.isEditing = false;
    // Resetear el campo de contraseña como requerido por defecto
    this.formFields.find(field => field.key === 'password')!.required = true;
  }

  editPaciente(paciente: PacienteExtended) {
    this.isEditing = true;
    this.currentUser = { ...paciente };
    
    // Convertir fecha de string a Date para el DatePicker
    if (this.currentUser.fecha_nacimiento) {
      (this.currentUser as any).fecha_nacimiento = new Date(this.currentUser.fecha_nacimiento) as Date;
    }
    
    this.selectedPaciente = this.currentUser;
    // Al editar, hacer que la contraseña no sea requerida
    this.formFields.find(field => field.key === 'password')!.required = false;
    this.showForm = true;
  }

  deletePaciente(paciente: PacienteExtended): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usuariosService.delete(paciente.id_usuario!).subscribe({
          next: (response: CrudResponse<any>) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: response.message || 'Paciente eliminado correctamente'
            });
            this.loadPacientes();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al eliminar el paciente'
            });
          }
        });
      }
    });
  }

  saveUser(userData: any) {
    this.formLoading = true;
    
    // Convertir fecha de Date a string si es necesario
    const fechaNacimiento = (userData as any).fecha_nacimiento;
    if (fechaNacimiento && typeof fechaNacimiento !== 'string') {
      (userData as any).fecha_nacimiento = fechaNacimiento.toISOString().split('T')[0];
    }
    
    // Asegurar que siempre tenga id_rol = 4 (paciente)
    const dataToSend = { ...userData, id_rol: 4 };
    
    // Si estamos editando y la contraseña está vacía, no la enviamos
    if (this.isEditing && (!dataToSend.password || dataToSend.password.trim() === '')) {
      delete dataToSend.password;
    }
    
    if (this.isEditing && this.selectedPaciente?.id_usuario) {
      const updateData = { ...dataToSend };
      delete updateData.id_usuario;
      
      this.usuariosService.update(this.selectedPaciente.id_usuario, updateData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente actualizado correctamente'
          });
          this.closeForm();
          this.loadPacientes();
        },
        error: (_error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar paciente'
          });
        },
        complete: () => {
          this.formLoading = false;
        }
      });
    } else {
      const createData = { ...dataToSend };
      delete createData.id_usuario;
      
      this.usuariosService.create(createData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente creado correctamente'
          });
          this.closeForm();
          this.loadPacientes();
        },
        error: (_error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear paciente'
          });
        },
        complete: () => {
          this.formLoading = false;
        }
      });
    }
  }

  savePaciente(pacienteData: any) {
    this.saveUser(pacienteData);
  }
}