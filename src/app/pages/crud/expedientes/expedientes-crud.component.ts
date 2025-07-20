import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { CrudResponse } from '../../../services/base-crud.service';
import { ExpedientesService, Expediente } from '../../../services/expedientes.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-expedientes-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="expedientes-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Expedientes</h2>
          <p>Administra los expedientes médicos de los pacientes</p>
        </div>
        <!-- ✅ Eliminar este botón del header -->
      </div>

      <app-base-table
        [data]="expedientes"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading"
        [canCreate]="canCreate"
        [entityName]="'Expediente'"
        (onCreate)="openCreateForm()"
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

      <p-confirmDialog></p-confirmDialog>
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
    { field: 'paciente_nombre', header: 'Paciente', sortable: true, filterable: true },
    { field: 'antecedentes', header: 'Antecedentes', sortable: false, filterable: true },
    { field: 'historial_clinico', header: 'Historial Clínico', sortable: false, filterable: true },
    { field: 'seguro', header: 'Seguro', sortable: true, filterable: true },
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
      key: 'antecedentes',
      label: 'Antecedentes',
      type: 'textarea'
    },
    {
      key: 'historial_clinico',
      label: 'Historial Clínico',
      type: 'textarea'
    },
    {
      key: 'seguro',
      label: 'Seguro',
      type: 'text'
    }
  ];

  constructor(
    private crudService: ExpedientesService,
    private authService: AuthService,
    private alertService: AlertService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadExpedientes();
    this.loadSelectOptions();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    console.log('🔍 Usuario actual:', user);
    
    if (user) {
      this.canView = this.authService.hasPermission('expedientes_read');
      this.canCreate = this.authService.hasPermission('expedientes_create');
      this.canEdit = this.authService.hasPermission('expedientes_update');
      this.canDelete = this.authService.hasPermission('expedientes_delete');
      
      console.log('✅ Permisos verificados:');
      console.log('  - canView (expedientes_read):', this.canView);
      console.log('  - canCreate (expedientes_create):', this.canCreate);
      console.log('  - canEdit (expedientes_update):', this.canEdit);
      console.log('  - canDelete (expedientes_delete):', this.canDelete);
    }
  }

  private setupActions() {
    this.actions = [];

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
        this.alertService.errorLoad('expedientes', 'No se pudieron cargar los datos del servidor');
        this.loading = false;
      }
    });
  }

  private loadSelectOptions() {
    // Cargar pacientes (usuarios con rol 4)
    this.usuariosService.getByRole(4).subscribe({
      next: (response: CrudResponse<any[]>) => {
        const pacientesField = this.formFields.find(f => f.key === 'id_paciente');
        if (pacientesField && response.data) {
          pacientesField.options = response.data.map((p: any) => ({
            label: `${p.nombre} ${p.apellido || ''}`,
            value: p.id_usuario
          }));
        }
      },
      error: (error) => {
        console.error('Error loading pacientes:', error);
      }
    });
  }

  openCreateForm() {
    this.selectedExpediente = {};
    this.formTitle = 'Nuevo Expediente';
    this.showForm = true;
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

  deleteExpediente(expediente: Expediente): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el expediente del paciente ${expediente.paciente_nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.crudService.delete(expediente.id_expediente!).subscribe({
          next: (response: CrudResponse<any>) => {
            this.alertService.successDelete('Expediente');
            this.loadExpedientes();
          },
          error: (error) => {
            this.alertService.errorDelete('expediente', 'No se pudo completar la operación');
          }
        });
      }
    });
  }

  handleSave(expedienteData: Partial<Expediente>) {
    // Validaciones
    const missingFields: string[] = [];
    
    if (!expedienteData.id_paciente) {
      missingFields.push('Paciente');
    }
    
    if (missingFields.length > 0) {
      this.alertService.errorCreate('expediente', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }
    
    this.formLoading = true;
    
    // ✅ Limpiar datos antes de enviar al backend
    const cleanExpedienteData = {
      antecedentes: expedienteData.antecedentes,
      historial_clinico: expedienteData.historial_clinico,
      seguro: expedienteData.seguro,
      id_paciente: expedienteData.id_paciente
    };
    
    if (this.selectedExpediente.id_expediente) {
      // Actualizar
      this.crudService.update(this.selectedExpediente.id_expediente, cleanExpedienteData).subscribe({
        next: (response: CrudResponse<Expediente>) => {
          this.alertService.successUpdate('Expediente');
          this.loadExpedientes();
          this.closeForm();
          this.formLoading = false;
        },
        error: (error) => {
          this.alertService.errorUpdate('expediente', 'No se pudo completar la operación');
          this.formLoading = false;
        }
      });
    } else {
      // Crear
      this.crudService.create(cleanExpedienteData).subscribe({
        next: (response: CrudResponse<Expediente>) => {
          this.alertService.successCreate('Expediente');
          this.loadExpedientes();
          this.closeForm();
          this.formLoading = false;
        },
        error: (error) => {
          this.alertService.errorCreate('expediente', 'No se pudo completar la operación');
          this.formLoading = false;
        }
      });
    }
  }

  closeForm() {
    this.showForm = false;
    this.selectedExpediente = {};
    this.formLoading = false;
  }

  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
  }

  handleFilter(event: any) {
    // Implementar filtrado si es necesario
  }
}