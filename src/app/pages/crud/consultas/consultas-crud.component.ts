import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { BaseCrudService, CrudResponse } from '../../../services/base-crud.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

interface Consulta {
  id_consulta?: number;
  id_paciente: number;
  id_medico: number;
  fecha_consulta: string;
  motivo: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-consultas-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule],
  providers: [MessageService],
  template: `
    <div class="consultas-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Consultas</h2>
          <p>Administra las consultas médicas del hospital</p>
        </div>
        <p-button 
          *ngIf="canCreate" 
          label="Nueva Consulta" 
          icon="pi pi-plus" 
          (onClick)="openCreateForm()"
          class="p-button-success">
        </p-button>
      </div>

      <app-base-table
        [data]="consultas"
        [columns]="columns"
        [actions]="actions"
        (onSort)="handleSort($event)"
        (onFilter)="handleFilter($event)">
      </app-base-table>

      <app-base-form
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedConsulta"
        [title]="formTitle"
        [loading]="formLoading"
        (save)="handleSave($event)"
        (cancel)="closeForm()">
      </app-base-form>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .consultas-crud {
      padding: 2rem;
    }
    
    .crud-header {
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, var(--hospital-primary), var(--hospital-secondary));
      border-radius: 12px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
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
    
    @media (max-width: 768px) {
      .crud-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class ConsultasCrudComponent implements OnInit {
  consultas: Consulta[] = [];
  selectedConsulta: Partial<Consulta> = {};
  showForm = false;
  loading = false;
  formLoading = false;
  formTitle = '';
  
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canView = false;

  columns: TableColumn[] = [
    { field: 'id_consulta', header: 'ID', sortable: true, filterable: true },
    { field: 'paciente_nombre', header: 'Paciente', sortable: true, filterable: true },
    { field: 'medico_nombre', header: 'Médico', sortable: true, filterable: true },
    { field: 'fecha_consulta', header: 'Fecha', sortable: true, filterable: true, type: 'date' },
    { field: 'motivo', header: 'Motivo', sortable: true, filterable: true },
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
      options: [] // Se cargarán dinámicamente
    },
    {
      key: 'id_medico',
      label: 'Médico',
      type: 'select',
      required: true,
      options: [] // Se cargarán dinámicamente
    },
    {
      key: 'fecha_consulta',
      label: 'Fecha de Consulta',
      type: 'date',
      required: true
    },
    {
      key: 'motivo',
      label: 'Motivo',
      type: 'textarea',
      required: true
    },
    {
      key: 'diagnostico',
      label: 'Diagnóstico',
      type: 'textarea'
    },
    {
      key: 'tratamiento',
      label: 'Tratamiento',
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
        { label: 'Programada', value: 'programada' },
        { label: 'En Curso', value: 'en_curso' },
        { label: 'Completada', value: 'completada' },
        { label: 'Cancelada', value: 'cancelada' }
      ]
    }
  ];

  constructor(
    private crudService: BaseCrudService<Consulta>,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadConsultas();
    this.loadSelectOptions();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canView = this.authService.hasPermission('consultas.view');
      this.canCreate = this.authService.hasPermission('consultas.create');
      this.canEdit = this.authService.hasPermission('consultas.edit');
      this.canDelete = this.authService.hasPermission('consultas.delete');
    }
  }

  private setupActions() {
    this.actions = [];
    
    if (this.canView) {
      this.actions.push({
        label: 'Ver',
        icon: 'pi pi-eye',
        action: (item: Consulta) => this.viewConsulta(item)
      });
    }
    
    if (this.canEdit) {
      this.actions.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        action: (item: Consulta) => this.editConsulta(item)
      });
    }
    
    if (this.canDelete) {
      this.actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        action: (item: Consulta) => this.deleteConsulta(item),
        severity: 'danger'
      });
    }
  }

  loadConsultas() {
    this.loading = true;
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<Consulta[]>) => {
        this.consultas = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading consultas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las consultas'
        });
        this.loading = false;
      }
    });
  }

  private loadSelectOptions() {
    // Cargar pacientes
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

    // Cargar médicos
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        const medicosField = this.formFields.find(f => f.key === 'id_medico');
        if (medicosField && response.data) {
          medicosField.options = response.data.map((m: any) => ({
            label: `${m.nombre} ${m.apellido}`,
            value: m.id_usuario
          }));
        }
      }
    });
  }

  deleteConsulta(consulta: Consulta) {
    if (confirm('¿Está seguro de que desea eliminar esta consulta?')) {
      this.crudService.delete(consulta.id_consulta!).subscribe({
        next: (response: CrudResponse<any>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Consulta eliminada correctamente'
          });
          this.loadConsultas();
        },
        error: (error: any) => {
          console.error('Error deleting consulta:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar la consulta'
          });
        }
      });
    }
  }

  handleSave(consultaData: Partial<Consulta>) {
    this.formLoading = true;
    
    const operation = consultaData.id_consulta 
      ? this.crudService.update(consultaData.id_consulta, consultaData)
      : this.crudService.create(consultaData);

    operation.subscribe({
      next: (response: CrudResponse<Consulta>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Consulta ${consultaData.id_consulta ? 'actualizada' : 'creada'} correctamente`
        });
        this.formLoading = false;
        this.closeForm();
        this.loadConsultas();
      },
      error: (error: any) => {
        console.error('Error saving consulta:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${consultaData.id_consulta ? 'actualizar' : 'crear'} la consulta`
        });
        this.formLoading = false;
      }
    });
  }

  openCreateForm() {
    this.selectedConsulta = {};
    this.formTitle = 'Nueva Consulta';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedConsulta = {};
  }

  viewConsulta(consulta: Consulta) {
    this.selectedConsulta = { ...consulta };
    this.formTitle = 'Ver Consulta';
    this.showForm = true;
  }

  editConsulta(consulta: Consulta) {
    this.selectedConsulta = { ...consulta };
    this.formTitle = 'Editar Consulta';
    this.showForm = true;
  }

  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
  }

  handleFilter(event: any) {
    // Implementar filtrado si es necesario
  }
}