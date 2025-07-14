import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { BaseCrudService, CrudResponse } from '../../../services/base-crud.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Expediente {
  id_expediente?: number;
  id_paciente: number;
  numero_expediente: string;
  fecha_apertura: string;
  antecedentes_medicos?: string;
  antecedentes_familiares?: string;
  alergias?: string;
  medicamentos_actuales?: string;
  observaciones?: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-expedientes-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule],
  providers: [MessageService],
  template: `
    <div class="expedientes-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Expedientes</h2>
          <p>Administra los expedientes médicos de los pacientes</p>
        </div>
        <p-button 
          *ngIf="canCreate" 
          label="Nuevo Expediente" 
          icon="pi pi-plus" 
          (onClick)="openCreateForm()"
          class="p-button-success">
        </p-button>
      </div>

      <app-base-table
        [data]="expedientes"
        [columns]="columns"
        [actions]="actions"
        (onSort)="handleSort($event)"
        (onFilter)="handleFilter($event)">
      </app-base-table>

      <app-base-form
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedExpediente"
        [title]="formTitle"
        [loading]="formLoading"
        (save)="handleSave($event)"
        (cancel)="closeForm()">
      </app-base-form>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .expedientes-crud {
      padding: 2rem;
    }
    
    .crud-header {
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--hospital-primary), var(--hospital-secondary));
      border-radius: 12px;
      color: white;
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
    
    .crud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .crud-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class ExpedientesCrudComponent implements OnInit {
  expedientes: Expediente[] = [];
  selectedExpediente: Partial<Expediente> = {};
  showForm = false;
  loading = false;
  formLoading = false;
  formTitle = '';
  
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canView = false;

  columns: TableColumn[] = [
    { field: 'id_expediente', header: 'ID', sortable: true, filterable: true },
    { field: 'numero_expediente', header: 'Número', sortable: true, filterable: true },
    { field: 'paciente_nombre', header: 'Paciente', sortable: true, filterable: true },
    { field: 'fecha_apertura', header: 'Fecha Apertura', sortable: true, filterable: true, type: 'date' },
    { field: 'estado', header: 'Estado', sortable: true, filterable: true },
    { field: 'created_at', header: 'Creado', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [];

  formFields: FormField[] = [
    {
      key: 'id_paciente',
      label: 'Paciente',
      type: 'select',
      required: true,
      options: []
    },
    {
      key: 'numero_expediente',
      label: 'Número de Expediente',
      type: 'text',
      required: true
    },
    {
      key: 'fecha_apertura',
      label: 'Fecha de Apertura',
      type: 'date',
      required: true
    },
    {
      key: 'antecedentes_medicos',
      label: 'Antecedentes Médicos',
      type: 'textarea'
    },
    {
      key: 'antecedentes_familiares',
      label: 'Antecedentes Familiares',
      type: 'textarea'
    },
    {
      key: 'alergias',
      label: 'Alergias',
      type: 'textarea'
    },
    {
      key: 'medicamentos_actuales',
      label: 'Medicamentos Actuales',
      type: 'textarea'
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      type: 'textarea'
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' },
        { label: 'Archivado', value: 'archivado' }
      ]
    }
  ];

  constructor(
    private crudService: BaseCrudService<Expediente>,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadExpedientes();
    this.loadSelectOptions();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canView = this.authService.hasPermission('expedientes.view');
      this.canCreate = this.authService.hasPermission('expedientes.create');
      this.canEdit = this.authService.hasPermission('expedientes.edit');
      this.canDelete = this.authService.hasPermission('expedientes.delete');
    }
  }

  private setupActions() {
    this.actions = [];
    
    if (this.canView) {
      this.actions.push({
        label: 'Ver',
        icon: 'pi pi-eye',
        action: (item: Expediente) => this.viewExpediente(item)
      });
    }
    
    if (this.canEdit) {
      this.actions.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        action: (item: Expediente) => this.editExpediente(item)
      });
    }
    
    if (this.canDelete) {
      this.actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        action: (item: Expediente) => this.deleteExpediente(item),
        severity: 'danger'
      });
    }
  }

  loadExpedientes() {
    this.loading = true;
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<Expediente[]>) => {
        this.expedientes = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading expedientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los expedientes'
        });
        this.loading = false;
      }
    });
  }

  private loadSelectOptions() {
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        const pacientesField = this.formFields.find(f => f.key === 'id_paciente');
        if (pacientesField && response.data) {
          pacientesField.options = response.data.map((p: any) => ({
            label: `${p.nombre} ${p.apellido}`,
            value: p.id_usuario
          }));
        }
      }
    });
  }

  deleteExpediente(expediente: Expediente) {
    if (confirm('¿Está seguro de que desea eliminar este expediente?')) {
      this.crudService.delete(expediente.id_expediente!).subscribe({
        next: (response: CrudResponse<any>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Expediente eliminado correctamente'
          });
          this.loadExpedientes();
        },
        error: (error: any) => {
          console.error('Error deleting expediente:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el expediente'
          });
        }
      });
    }
  }

  handleSave(expedienteData: Partial<Expediente>) {
    this.formLoading = true;
    
    const operation = expedienteData.id_expediente 
      ? this.crudService.update(expedienteData.id_expediente, expedienteData)
      : this.crudService.create(expedienteData);

    operation.subscribe({
      next: (response: CrudResponse<Expediente>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Expediente ${expedienteData.id_expediente ? 'actualizado' : 'creado'} correctamente`
        });
        this.formLoading = false;
        this.closeForm();
        this.loadExpedientes();
      },
      error: (error: any) => {
        console.error('Error saving expediente:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${expedienteData.id_expediente ? 'actualizar' : 'crear'} el expediente`
        });
        this.formLoading = false;
      }
    });
  }

  openCreateForm() {
    this.selectedExpediente = {};
    this.formTitle = 'Nuevo Expediente';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedExpediente = {};
  }

  viewExpediente(expediente: Expediente) {
    this.selectedExpediente = { ...expediente };
    this.formTitle = 'Ver Expediente';
    this.showForm = true;
  }

  editExpediente(expediente: Expediente) {
    this.selectedExpediente = { ...expediente };
    this.formTitle = 'Editar Expediente';
    this.showForm = true;
  }

  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
  }

  handleFilter(event: any) {
    // Implementar filtrado si es necesario
  }
}