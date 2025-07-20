import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { CrudResponse } from '../../../services/base-crud.service';
import { RecetasService, Receta } from '../../../services/recetas.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsuariosService } from '../../../services/usuarios.service';
import { ConsultoriosService } from '../../../services/consultorios.service';

@Component({
  selector: 'app-recetas-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="recetas-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Recetas</h2>
          <p>Administra las recetas médicas del hospital</p>
        </div>
      </div>

      <app-base-table
        [data]="recetas"
        [columns]="columns"
        [actions]="actions"
        [loading]="loading"
        [canCreate]="canCreate"
        [entityName]="'Receta'"
        (onCreate)="openCreateForm()"
        (onSort)="handleSort($event)"
        (onFilter)="handleFilter($event)">
      </app-base-table>

      <app-base-form
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedReceta"
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
    .recetas-crud {
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
export class RecetasCrudComponent implements OnInit {
  recetas: Receta[] = [];
  selectedReceta: Partial<Receta> = {};
  showForm = false;
  loading = false;
  formLoading = false;
  
  // Permisos
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  
  // Configuración de tabla
  // Configuración de tabla
  columns: TableColumn[] = [
    { field: 'id_receta', header: 'ID', sortable: true, type: 'text' },
    { field: 'fecha', header: 'Fecha', sortable: true, type: 'date' },
    { field: 'medicamento', header: 'Medicamento', sortable: true, type: 'text' },
    { field: 'medico_nombre', header: 'Médico', sortable: true, type: 'text' },
    { field: 'paciente_nombre', header: 'Paciente', sortable: true, type: 'text' },
    { field: 'consultorio_nombre', header: 'Consultorio', sortable: true, type: 'text' }
  ];
  
  actions: TableAction[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      action: (item: Receta) => this.editReceta(item),
      permission: 'recetas_update'
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      action: (item: Receta) => this.deleteReceta(item),
      permission: 'recetas_delete',
      severity: 'danger'
    }
  ];
  
  // Configuración de formulario
  formFields: FormField[] = [
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'date',
      required: true,
      validation: {
        message: 'La fecha es requerida'
      }
    },
    {
      key: 'medicamento',
      label: 'Medicamento',
      type: 'text',
      required: true,
      validation: {
        max: 255,
        message: 'El medicamento es requerido y no debe exceder 255 caracteres'
      }
    },
    {
      key: 'id_medico',
      label: 'Médico',
      type: 'select',
      required: true,
      validation: {
        message: 'Debe seleccionar un médico'
      },
      options: []
    },
    {
      key: 'id_paciente',
      label: 'Paciente',
      type: 'select',
      required: true,
      validation: {
        message: 'Debe seleccionar un paciente'
      },
      options: []
    },
    {
      key: 'id_consultorio',
      label: 'Consultorio',
      type: 'select',
      required: true,
      validation: {
        message: 'Debe seleccionar un consultorio'
      },
      options: []
    }
  ];
  
  get formTitle(): string {
    return this.selectedReceta.id_receta ? 'Editar Receta' : 'Nueva Receta';
  }
  
  constructor(
    private crudService: RecetasService,
    private usuariosService: UsuariosService,
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
  ) {}
  
  ngOnInit() {
    this.checkPermissions();
    this.loadRecetas();
    this.loadMedicos();
    this.loadPacientes();
    this.loadConsultorios();
  }
  
  private checkPermissions() {
    this.canCreate = this.authService.hasPermission('recetas_create');
    this.canUpdate = this.authService.hasPermission('recetas_update');
    this.canDelete = this.authService.hasPermission('recetas_delete');
  }
  
  loadRecetas() {
    this.loading = true;
    this.crudService.getAll().subscribe({
      next: (response: CrudResponse<Receta[]>) => {
        this.recetas = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading recetas:', error);
        this.alertService.errorLoad('recetas', 'No se pudieron cargar los datos del servidor');
        this.loading = false;
      }
    });
  }
  
  private loadMedicos() {
    // Usar ID de rol para médicos (asumiendo que es 2)
    this.usuariosService.getByRole(2).subscribe({
      next: (response: CrudResponse<any[]>) => {
        const medicosField = this.formFields.find(f => f.key === 'id_medico');
        if (medicosField && response.data) {
          medicosField.options = response.data.map((m: any) => ({
            label: `${m.nombre} ${m.apellido || ''}`,
            value: m.id_usuario
          }));
        }
      },
      error: (error) => {
        console.error('Error cargando médicos:', error);
        this.alertService.errorLoad('médicos', 'No se pudieron cargar los médicos');
      }
    });
  }
  
  private loadPacientes() {
    // Cambiar de rol 3 a rol 4 para que coincida con expedientes
    this.usuariosService.getByRole(4).subscribe({
      next: (response: CrudResponse<any[]>) => {
        console.log('Respuesta de pacientes:', response); // Debug temporal
        const pacientesField = this.formFields.find(f => f.key === 'id_paciente');
        if (pacientesField && response.data) {
          console.log('Datos de pacientes:', response.data); // Debug temporal
          pacientesField.options = response.data.map((p: any) => ({
            label: `${p.nombre} ${p.apellido || ''}`,
            value: p.id_usuario
          }));
          console.log('Opciones generadas:', pacientesField.options); // Debug temporal
        }
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
        this.alertService.errorLoad('pacientes', 'No se pudieron cargar los pacientes');
      }
    });
  }
  
  private loadConsultorios() {
    this.consultoriosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        const consultoriosField = this.formFields.find(f => f.key === 'id_consultorio');
        if (consultoriosField && response.data) {
          consultoriosField.options = response.data.map((c: any) => ({
            label: c.nombre_numero,
            value: c.id_consultorio
          }));
        }
      },
      error: (error) => {
        console.error('Error cargando consultorios:', error);
        this.alertService.errorLoad('consultorios', 'No se pudieron cargar los consultorios');
      }
    });
  }
  
  openCreateForm() {
    this.selectedReceta = {};
    this.showForm = true;
  }
  
  editReceta(receta: Receta) {
    this.selectedReceta = { ...receta };
    this.showForm = true;
  }
  
  deleteReceta(receta: Receta) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la receta de ${receta.medicamento}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (receta.id_receta) {
          this.crudService.delete(receta.id_receta).subscribe({
            next: (response: CrudResponse<any>) => {
              this.alertService.successDelete('Receta');
              this.loadRecetas();
            },
            error: (error) => {
              this.alertService.errorDelete('receta', 'No se pudo completar la operación');
            }
          });
        }
      }
    });
  }
  
  handleSave(recetaData: any) {
    this.formLoading = true;
    
    // Limpiar datos
    const cleanedData = { ...recetaData };
    delete cleanedData.medico;
    delete cleanedData.paciente;
    delete cleanedData.consultorio;
    
    const operation = cleanedData.id_receta 
      ? this.crudService.update(cleanedData.id_receta, cleanedData)
      : this.crudService.create(cleanedData);
    
    operation.subscribe({
      next: (response: CrudResponse<Receta>) => {
        this.formLoading = false;
        if (cleanedData.id_receta) {
          this.alertService.successUpdate('Receta');
        } else {
          this.alertService.successCreate('Receta');
        }
        this.closeForm();
        this.loadRecetas();
      },
      error: (error: any) => {
        this.formLoading = false;
        console.error('Error saving receta:', error);
        
        let errorMessage = 'Verifique que todos los datos sean válidos';
        
        if (error.status === 403) {
          errorMessage = 'No tiene permisos para realizar esta operación';
        } else if (error.status === 409) {
          errorMessage = 'Ya existe una receta con estos datos';
        }
        
        this.alertService[cleanedData.id_receta ? 'errorUpdate' : 'errorCreate']('receta', errorMessage);
      }
    });
  }
  
  closeForm() {
    this.showForm = false;
    this.selectedReceta = {};
  }
  
  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
    console.log('Sort event:', event);
  }
  
  handleFilter(event: any) {
    // Implementar filtrado si es necesario
    console.log('Filter event:', event);
  }
}