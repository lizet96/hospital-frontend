import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { ConsultoriosService, Consultorio } from '../../../services/consultorios.service';
import { AuthService } from '../../../services/auth.service';
import { CrudResponse } from '../../../services/base-crud.service';
import { AlertService } from '../../../services/alert.service';

// Consultorio interface is now imported from the service

@Component({
  selector: 'app-consultorios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule],
  providers: [],
  template: `
    <div class="consultorios-crud">
      <div class="crud-header">
        <h2>Gestión de Consultorios</h2>
        <p-button 
          *ngIf="canCreate" 
          label="Nuevo Consultorio" 
          icon="pi pi-plus" 
          (onClick)="openCreateForm()"
          class="p-button-success">
        </p-button>
      </div>

      <app-base-table
        [data]="consultorios"
        [columns]="columns"
        [actions]="actions"
        (onSort)="handleSort($event)"
        (onFilter)="handleFilter($event)">
      </app-base-table>

      <app-base-form
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedConsultorio"
        [title]="formTitle"
        [loading]="formLoading"
        (save)="handleSave($event)"
        (cancel)="closeForm()">
      </app-base-form>


    </div>
  `,
  styles: [`
    .consultorios-crud {
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
export class ConsultoriosCrudComponent implements OnInit {
  consultorios: Consultorio[] = [];
  selectedConsultorio: Partial<Consultorio> = {};
  showForm = false;
  loading = false;
  formLoading = false;
  formTitle = '';
  
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canView = false;

  columns: TableColumn[] = [
    { field: 'id_consultorio', header: 'ID', sortable: true, filterable: true },
    { field: 'nombre_numero', header: 'Nombre/Número', sortable: true, filterable: true },
    { field: 'ubicacion', header: 'Ubicación', sortable: true, filterable: true }
  ];

  actions: TableAction[] = [];

  formFields: FormField[] = [
    {
      key: 'nombre_numero',
      label: 'Nombre/Número del Consultorio',
      type: 'text',
      required: true
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      type: 'text',
      required: true
    }
  ];

  constructor(
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadConsultorios();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canView = this.authService.hasPermission('consultorios.view');
      this.canCreate = this.authService.hasPermission('consultorios.create');
      this.canEdit = this.authService.hasPermission('consultorios.edit');
      this.canDelete = this.authService.hasPermission('consultorios.delete');
    }
  }

  private setupActions() {
    const availableActions = [
      {
        label: 'Ver',
        icon: 'pi pi-eye',
        action: (item: Consultorio) => this.viewConsultorio(item),
        visible: this.canView
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        action: (item: Consultorio) => this.editConsultorio(item),
        visible: this.canEdit
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        action: (item: Consultorio) => this.deleteConsultorio(item),
        visible: this.canDelete,
        severity: 'danger' as const
      }
    ];
    
    this.actions = availableActions.filter(action => action.visible);
  }

  loadConsultorios() {
    this.loading = true;
    this.consultoriosService.getAll().subscribe({
      next: (response: CrudResponse<Consultorio[]>) => {
        this.consultorios = response.data || [];
        this.loading = false;
      },
      error: (_error: any) => {
        console.error('Error loading consultorios:', _error);
        this.alertService.errorLoad('consultorios');
        this.loading = false;
      }
    });
  }

  openCreateForm() {
    this.selectedConsultorio = {};
    this.formTitle = 'Nuevo Consultorio';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedConsultorio = {};
  }

  viewConsultorio(consultorio: Consultorio) {
    this.selectedConsultorio = { ...consultorio };
    this.formTitle = 'Ver Consultorio';
    this.showForm = true;
  }

  editConsultorio(consultorio: Consultorio) {
    this.selectedConsultorio = { ...consultorio };
    this.formTitle = 'Editar Consultorio';
    this.showForm = true;
  }

  deleteConsultorio(consultorio: Consultorio) {
    if (confirm('¿Está seguro de que desea eliminar este consultorio?')) {
      this.consultoriosService.delete(consultorio.id_consultorio!).subscribe({
        next: (_response: CrudResponse<any>) => {
          this.alertService.successDelete('consultorio');
          this.loadConsultorios();
        },
        error: (_error: any) => {
          console.error('Error deleting consultorio:', _error);
          this.alertService.errorDelete('consultorio');
        }
      });
    }
  }

  handleSave(consultorioData: Partial<Consultorio>) {
    // Validaciones del lado del cliente
    const missingFields: string[] = [];
    
    if (!consultorioData.nombre_numero?.trim()) {
      missingFields.push('Nombre/Número del consultorio');
    }
    if (!consultorioData.ubicacion?.trim()) {
      missingFields.push('Ubicación');
    }

    if (missingFields.length > 0) {
      this.alertService.errorCreate('consultorio', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }

    this.formLoading = true;
    
    const operation = consultorioData.id_consultorio 
      ? this.consultoriosService.update(consultorioData.id_consultorio, consultorioData as any)
      : this.consultoriosService.create(consultorioData as any);

    operation.subscribe({
      next: (_response: CrudResponse<Consultorio>) => {
        this.alertService[consultorioData.id_consultorio ? 'successUpdate' : 'successCreate']('consultorio');
        this.formLoading = false;
        this.closeForm();
        this.loadConsultorios();
      },
      error: (error: any) => {
        console.error('Error saving consultorio:', error);
        
        let errorMessage = '';
        
        // Manejar códigos de estado HTTP específicos
        if (error.status === 409) {
          // Conflicto - consultorio duplicado
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            const serverError = error.error.body.data[0].error;
            if (serverError && (serverError.toLowerCase().includes('consultorio') || serverError.toLowerCase().includes('nombre') || serverError.toLowerCase().includes('duplicado') || serverError.toLowerCase().includes('existe'))) {
              errorMessage = 'Ya existe un consultorio con ese nombre/número. Por favor, use un nombre diferente.';
            } else {
              errorMessage = serverError;
            }
          } else {
            errorMessage = 'Ya existe un consultorio con ese nombre/número. Por favor, use un nombre diferente.';
          }
        } else if (error.status === 400) {
          // Error de validación
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            const serverError = error.error.body.data[0].error;
            if (serverError && (serverError.toLowerCase().includes('consultorio') || serverError.toLowerCase().includes('nombre') || serverError.toLowerCase().includes('duplicado') || serverError.toLowerCase().includes('existe'))) {
              errorMessage = 'Ya existe un consultorio con ese nombre/número. Por favor, use un nombre diferente.';
            } else {
              errorMessage = serverError || 'Los datos proporcionados no son válidos. Verifique el nombre y ubicación del consultorio.';
            }
          } else {
            errorMessage = 'Los datos proporcionados no son válidos. Verifique el nombre y ubicación del consultorio.';
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
          errorMessage = 'Verifique que todos los datos sean válidos';
        }
        
        if (consultorioData.id_consultorio) {
          this.alertService.errorUpdate('consultorio', errorMessage);
        } else {
          this.alertService.errorCreate('consultorio', errorMessage);
        }
        this.formLoading = false;
      }
    });
  }

  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
  }

  handleFilter(event: any) {
    // Implementar filtrado si es necesario
  }
}