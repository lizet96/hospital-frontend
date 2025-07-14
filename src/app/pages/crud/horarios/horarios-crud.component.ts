import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { CrudResponse } from '../../../services/base-crud.service';
import { HorariosService, Horario } from '../../../services/horarios.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { ConsultoriosService } from '../../../services/consultorios.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';



@Component({
  selector: 'app-horarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule],
  providers: [MessageService],
  template: `
    <div class="horarios-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Horarios</h2>
          <p>Administra los horarios de atención médica</p>
        </div>
        <p-button 
          *ngIf="canCreate" 
          label="Nuevo Horario" 
          icon="pi pi-plus" 
          (onClick)="openCreateForm()"
          class="p-button-success">
        </p-button>
      </div>

      <app-base-table
        [data]="horarios"
        [columns]="columns"
        [actions]="actions"
        (onSort)="handleSort($event)"
        (onFilter)="handleFilter($event)">
      </app-base-table>

      <app-base-form
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedHorario"
        [title]="formTitle"
        [loading]="formLoading"
        (save)="handleSave($event)"
        (cancel)="closeForm()">
      </app-base-form>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .horarios-crud {
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
export class HorariosCrudComponent implements OnInit {
  horarios: Horario[] = [];
  selectedHorario: Partial<Horario> = {};
  showForm = false;
  loading = false;
  formLoading = false;
  formTitle = '';
  
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canView = false;

  columns: TableColumn[] = [
    { field: 'id_horario', header: 'ID', sortable: true, filterable: true },
    { field: 'medico_nombre', header: 'Médico', sortable: true, filterable: true },
    { field: 'consultorio_nombre', header: 'Consultorio', sortable: true, filterable: true },
    { field: 'dia_semana', header: 'Día', sortable: true, filterable: true },
    { field: 'hora_inicio', header: 'Hora Inicio', sortable: true, filterable: true },
    { field: 'hora_fin', header: 'Hora Fin', sortable: true, filterable: true },
    { field: 'estado', header: 'Estado', sortable: true, filterable: true }
  ];

  actions: TableAction[] = [];

  formFields: FormField[] = [
    {
      key: 'id_medico',
      label: 'Médico',
      type: 'select',
      required: true,
      options: []
    },
    {
      key: 'id_consultorio',
      label: 'Consultorio',
      type: 'select',
      required: true,
      options: []
    },
    {
      key: 'dia_semana',
      label: 'Día de la Semana',
      type: 'select',
      required: true,
      options: [
        { label: 'Lunes', value: 'lunes' },
        { label: 'Martes', value: 'martes' },
        { label: 'Miércoles', value: 'miercoles' },
        { label: 'Jueves', value: 'jueves' },
        { label: 'Viernes', value: 'viernes' },
        { label: 'Sábado', value: 'sabado' },
        { label: 'Domingo', value: 'domingo' }
      ]
    },
    {
      key: 'hora_inicio',
      label: 'Hora de Inicio',
      type: 'time',
      required: true
    },
    {
      key: 'hora_fin',
      label: 'Hora de Fin',
      type: 'time',
      required: true
    },
    {
      key: 'fecha_inicio',
      label: 'Fecha de Inicio',
      type: 'date',
      required: true
    },
    {
      key: 'fecha_fin',
      label: 'Fecha de Fin',
      type: 'date'
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      required: true,
      options: [
        { label: 'Activo', value: 'activo' },
        { label: 'Inactivo', value: 'inactivo' },
        { label: 'Suspendido', value: 'suspendido' }
      ]
    },
    {
      key: 'observaciones',
      label: 'Observaciones',
      type: 'textarea'
    }
  ];

  constructor(
    private horariosService: HorariosService,
    private usuariosService: UsuariosService,
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadHorarios();
    this.loadSelectOptions();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.canView = this.authService.hasPermission('horarios.view');
      this.canCreate = this.authService.hasPermission('horarios.create');
      this.canEdit = this.authService.hasPermission('horarios.edit');
      this.canDelete = this.authService.hasPermission('horarios.delete');
    }
  }

  private setupActions() {
    const availableActions = [
      {
        label: 'Ver',
        icon: 'pi pi-eye',
        action: (item: Horario) => this.viewHorario(item),
        visible: this.canView
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        action: (item: Horario) => this.editHorario(item),
        visible: this.canEdit
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        action: (item: Horario) => this.deleteHorario(item),
        visible: this.canDelete,
        severity: 'danger' as const
      }
    ];
    
    this.actions = availableActions.filter(action => action.visible);
  }

  loadHorarios() {
    this.loading = true;
    this.horariosService.getAll().subscribe({
      next: (response: CrudResponse<Horario[]>) => {
        this.horarios = response.data || [];
        this.loading = false;
      },
      error: (_error: any) => {
        console.error('Error loading horarios:', _error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los horarios'
        });
        this.loading = false;
      }
    });
  }

  private loadSelectOptions() {
    // Cargar médicos
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        const medicosField = this.formFields.find(f => f.key === 'id_medico');
        if (medicosField && response.data) {
          // Filtrar solo médicos (id_rol = 2)
          const medicos = response.data.filter(u => u.id_rol === 2);
          medicosField.options = medicos.map((m: any) => ({
            label: `${m.nombre} ${m.apellido}`,
            value: m.id_usuario
          }));
        }
      },
      error: (_error: any) => {
        console.error('Error loading médicos:', _error);
      }
    });

    // Cargar consultorios
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
      error: (_error: any) => {
        console.error('Error loading consultorios:', _error);
      }
    });
  }

  openCreateForm() {
    this.selectedHorario = {};
    this.formTitle = 'Nuevo Horario';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedHorario = {};
  }

  // Remove the handleAction method completely
  // handleAction(event: { action: string; item: Horario }) {
  //   switch (event.action) {
  //     case 'view':
  //       this.viewHorario(event.item);
  //       break;
  //     case 'edit':
  //       this.editHorario(event.item);
  //       break;
  //     case 'delete':
  //       this.deleteHorario(event.item);
  //       break;
  //   }
  // }

  viewHorario(horario: Horario) {
    this.selectedHorario = { ...horario };
    this.formTitle = 'Ver Horario';
    this.showForm = true;
  }

  editHorario(horario: Horario) {
    this.selectedHorario = { ...horario };
    this.formTitle = 'Editar Horario';
    this.showForm = true;
  }

  deleteHorario(horario: Horario) {
    if (confirm('¿Está seguro de que desea eliminar este horario?')) {
      this.horariosService.delete(horario.id_horario!).subscribe({
        next: (response: CrudResponse<any>) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Horario eliminado correctamente'
          });
          this.loadHorarios();
        },
        error: (_error: any) => {
          console.error('Error deleting horario:', _error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el horario'
          });
        }
      });
    }
  }

  handleSave(horarioData: Partial<Horario>) {
    this.formLoading = true;
    
    const operation = horarioData.id_horario 
      ? this.horariosService.update(horarioData.id_horario, horarioData as any)
      : this.horariosService.create(horarioData as any);

    operation.subscribe({
      next: (response: CrudResponse<Horario>) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Horario ${horarioData.id_horario ? 'actualizado' : 'creado'} correctamente`
        });
        this.formLoading = false;
        this.closeForm();
        this.loadHorarios();
      },
      error: (_error: any) => {
        console.error('Error saving horario:', _error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al ${horarioData.id_horario ? 'actualizar' : 'crear'} el horario`
        });
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