import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { BaseCrudService, CrudResponse } from '../../../services/base-crud.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Paciente {
  id_usuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fecha_nacimiento: string;
  direccion?: string;
  cedula?: string;
  tipo_sangre?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  seguro_medico?: string;
  numero_seguro?: string;
  id_rol: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  password?: string;
}

@Component({
  selector: 'app-pacientes-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule],
  providers: [MessageService],
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
        [actions]="actions">
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
  pacientes: Paciente[] = [];
  loading = false;
  showForm = false;
  formLoading = false;
  isEditing = false;
  selectedPaciente: Paciente | null = null;
  canCreate = true; // Add this property for button visibility

  columns: TableColumn[] = [
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apellido', header: 'Apellido', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'fecha_nacimiento', header: 'Fecha Nacimiento', type: 'date' },
    { field: 'tipo_sangre', header: 'Tipo Sangre' },
    { field: 'activo', header: 'Estado', type: 'boolean' }
  ];

  // Las acciones ya están correctamente definidas:
  actions = [
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
    {
      key: 'telefono',
      label: 'Teléfono',
      type: 'text',
      validation: {
        pattern: '^[0-9+\\-\\s()]+$'
      }
    },
    {
      key: 'direccion',
      label: 'Dirección',
      type: 'textarea'
    },
    {
      key: 'tipo_sangre',
      label: 'Tipo de Sangre',
      type: 'select',
      options: [
        { label: 'A+', value: 'A+' },
        { label: 'A-', value: 'A-' },
        { label: 'B+', value: 'B+' },
        { label: 'B-', value: 'B-' },
        { label: 'AB+', value: 'AB+' },
        { label: 'AB-', value: 'AB-' },
        { label: 'O+', value: 'O+' },
        { label: 'O-', value: 'O-' }
      ]
    },
    {
      key: 'contacto_emergencia',
      label: 'Contacto de Emergencia',
      type: 'text'
    },
    {
      key: 'telefono_emergencia',
      label: 'Teléfono de Emergencia',
      type: 'text',
      validation: {
        pattern: '^[0-9+\\-\\s()]+$'
      }
    },
    {
      key: 'seguro_medico',
      label: 'Seguro Médico',
      type: 'text'
    },
    {
      key: 'numero_seguro',
      label: 'Número de Seguro',
      type: 'text'
    },
    {
      key: 'activo',
      label: 'Activo',
      type: 'checkbox'
    }
  ];

  constructor(
    private crudService: BaseCrudService<Paciente>,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Configurar el endpoint para usuarios ya que los pacientes son usuarios con id_rol=4
    (this.crudService as any).endpoint = 'usuarios';
  }

  ngOnInit() {
    this.loadPacientes();
  }

  get formTitle(): string {
    return this.isEditing ? 'Editar Paciente' : 'Crear Paciente';
  }

  loadPacientes() {
    this.loading = true;
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<Paciente[]>) => {
        // Filtrar solo usuarios con id_rol = 4 (pacientes)
        const allUsers = response.data || [];
        this.pacientes = allUsers.filter(user => user.id_rol === 4);
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

  private getEmptyPaciente(): Paciente {
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

  editPaciente(paciente: Paciente) {
    this.isEditing = true;
    this.selectedPaciente = { ...paciente };
    // Al editar, hacer que la contraseña no sea requerida
    this.formFields.find(field => field.key === 'password')!.required = false;
    this.showForm = true;
  }

  deletePaciente(paciente: Paciente) {
    if (confirm(`¿Está seguro de eliminar al paciente ${paciente.nombre} ${paciente.apellido}?`)) {
      this.crudService.delete(paciente.id_usuario!).subscribe({
        next: (response: CrudResponse<any>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente eliminado correctamente'
          });
          this.loadPacientes();
        },
        error: (_error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar paciente'
          });
        }
      });
    }
  }

  onSubmit(pacienteData: any) {
    this.formLoading = true;
    
    // Asegurar que siempre tenga id_rol = 4 (paciente)
    const dataToSend = { ...pacienteData, id_rol: 4 };
    
    // Si estamos editando y la contraseña está vacía, no la enviamos
    if (this.isEditing && (!dataToSend.password || dataToSend.password.trim() === '')) {
      delete dataToSend.password;
    }
    
    const operation = this.isEditing 
      ? this.crudService.update(this.selectedPaciente!.id_usuario!, dataToSend)
      : this.crudService.create(dataToSend);

    operation.subscribe({
      next: (response: CrudResponse<Paciente>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Paciente ${this.isEditing ? 'actualizado' : 'creado'} correctamente`
        });
        this.closeForm();
        this.loadPacientes();
      },
      error: (_error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${this.isEditing ? 'actualizar' : 'crear'} paciente`
        });
      },
      complete: () => {
        this.formLoading = false;
      }
    });
  }

  // En la clase, agregar el método faltante:
  savePaciente(pacienteData: any) {
    this.onSubmit(pacienteData);
  }
}