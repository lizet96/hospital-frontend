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
import { AlertService } from '../../../services/alert.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-horarios-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <div class="horarios-crud">
      <div class="crud-header">
        <div>
          <h2>Gestión de Horarios</h2>
          <p>Administra los horarios de atención médica</p>
iegue el modal         </div>
        <!-- ELIMINAR COMPLETAMENTE ESTE BOTÓN -->
      </div>

      <app-base-table
        [data]="horarios"
        [columns]="columns"
        [actions]="actions"
        [canCreate]="true"
        [entityName]="'Horario'"
        (onCreate)="openCreateForm()"
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

      <p-confirmDialog></p-confirmDialog>
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
    { field: 'turno', header: 'Turno', sortable: true, filterable: true },
    { field: 'consulta_disponible', header: 'Disponible', sortable: true, filterable: true },
  ];

  actions: TableAction[] = [];

  // Campos para editar horarios (sin fecha_hora)
  editFormFields: FormField[] = [
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
      key: 'turno',
      label: 'Turno',
      type: 'select',
      required: true,
      options: [
        { label: 'Matutino', value: 'matutino' },
        { label: 'Vespertino', value: 'vespertino' }
      ]
    },
    {
      key: 'consulta_disponible',
      label: 'Consulta Disponible',
      type: 'checkbox',
      required: false
    }
  ];

  // Campos para crear horarios (sin fecha_hora)
  createFormFields: FormField[] = [
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
      key: 'turno',
      label: 'Turno',
      type: 'select',
      required: true,
      options: [
        { label: 'Matutino', value: 'matutino' },
        { label: 'Vespertino', value: 'vespertino' }
      ]
    },
    {
      key: 'consulta_disponible',
      label: 'Consulta Disponible',
      type: 'checkbox',
      required: false
    }
  ];

  // Campo dinámico que cambia según la operación
  formFields: FormField[] = [];

  // Actualizar el constructor para incluir ConfirmationService
  constructor(
    private horariosService: HorariosService,
    private usuariosService: UsuariosService,
    private consultoriosService: ConsultoriosService,
    private authService: AuthService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService // Agregar esta línea
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
      this.canView = this.authService.hasPermission('horarios_read');     // 🔥 CAMBIO
      this.canCreate = this.authService.hasPermission('horarios_create'); // ✅ CORRECTO
      this.canEdit = this.authService.hasPermission('horarios_update');   // 🔥 CAMBIO
      this.canDelete = this.authService.hasPermission('horarios_delete'); // ✅ CORRECTO
    }
  }

  private setupActions() {
    const availableActions = [
     
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
        console.log('Horarios cargados:', this.horarios); // Debug para ver la estructura
        this.loading = false;
      },
      error: (_error: any) => {
        console.error('Error loading horarios:', _error);
        this.alertService.errorLoad('horarios');
        this.loading = false;
      }
    });
  }

  editHorario(horario: Horario) {
    console.log('Horario a editar:', horario);
    
    // Verificar si las opciones están cargadas
    const medicoField = this.editFormFields.find(f => f.key === 'id_medico');
    console.log('Opciones de médicos:', medicoField?.options);
    
    // Si las opciones no están cargadas, cargarlas primero
    if (!medicoField?.options || medicoField.options.length === 0) {
      console.log('Cargando opciones antes de mostrar el modal...');
      this.loadSelectOptionsAndShowModal(horario);
    } else {
      this.showEditModal(horario);
    }
  }

  private loadSelectOptionsAndShowModal(horario?: Horario) {
    let loadedCount = 0;
    const totalToLoad = 2; // médicos y consultorios
    
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        console.log('Opciones cargadas, mostrando modal...');
        if (horario) {
          this.showEditModal(horario);
        } else {
          this.showEditModal();
        }
      }
    };
    
    // Cargar médicos
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const medicos = response.data.filter(u => u.id_rol === 2);
          const medicosOptions = medicos.map((m: any) => ({
            label: `${m.nombre} ${m.apellido}`,
            value: m.id_usuario
          }));
          
          const createMedicosField = this.createFormFields.find((f: FormField) => f.key === 'id_medico');
          const editMedicosField = this.editFormFields.find((f: FormField) => f.key === 'id_medico');
          if (createMedicosField) createMedicosField.options = medicosOptions;
          if (editMedicosField) editMedicosField.options = medicosOptions;
        }
      },
      error: (_error: any) => {
        console.error('Error loading médicos:', _error);
        checkComplete();
      }
    });

    // Cargar consultorios
    this.consultoriosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const consultoriosOptions = response.data.map((c: any) => ({
            label: c.nombre_numero,
            value: c.id_consultorio
          }));
          
          const createConsultoriosField = this.createFormFields.find((f: FormField) => f.key === 'id_consultorio');
          const editConsultoriosField = this.editFormFields.find((f: FormField) => f.key === 'id_consultorio');
          if (createConsultoriosField) createConsultoriosField.options = consultoriosOptions;
          if (editConsultoriosField) editConsultoriosField.options = consultoriosOptions;
          
          console.log('Consultorios cargados:', consultoriosOptions);
        }
        checkComplete();
      },
      error: (_error: any) => {
        console.error('Error loading consultorios:', _error);
        checkComplete();
      }
    });
  }

  private loadSelectOptions() {
    // Cargar médicos
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const medicos = response.data.filter(u => u.id_rol === 2);
          const medicosOptions = medicos.map((m: any) => ({
            label: `${m.nombre} ${m.apellido}`,
            value: m.id_usuario
          }));
          
          const createMedicosField = this.createFormFields.find((f: FormField) => f.key === 'id_medico');
          const editMedicosField = this.editFormFields.find((f: FormField) => f.key === 'id_medico');
          if (createMedicosField) createMedicosField.options = medicosOptions;
          if (editMedicosField) editMedicosField.options = medicosOptions;
        }
      },
      error: (_error: any) => {
        console.error('Error loading médicos:', _error);
      }
    });

    // Cargar consultorios
    this.consultoriosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const consultoriosOptions = response.data.map((c: any) => ({
            label: c.nombre_numero,
            value: c.id_consultorio
          }));
          
          const createConsultoriosField = this.createFormFields.find((f: FormField) => f.key === 'id_consultorio');
          const editConsultoriosField = this.editFormFields.find((f: FormField) => f.key === 'id_consultorio');
          if (createConsultoriosField) createConsultoriosField.options = consultoriosOptions;
          if (editConsultoriosField) editConsultoriosField.options = consultoriosOptions;
        }
      },
      error: (_error: any) => {
        console.error('Error loading consultorios:', _error);
      }
    });
  }

  private showEditModal(horario?: Horario) {
    // Usar campos de edición y hacer una copia profunda de las opciones
    this.formFields = this.editFormFields.map(field => {
      const newField = { ...field };
      if (field.options && Array.isArray(field.options)) {
        newField.options = field.options.map(option => ({ ...option }));
      }
      return newField;
    });
    
    // Asignar los datos DESPUÉS de configurar los campos
    if (horario) {
      this.selectedHorario = {
        id_horario: horario.id_horario,
        id_medico: Number(horario.id_medico), // Asegurar que sea número
        id_consultorio: Number(horario.id_consultorio), // Asegurar que sea número
        turno: horario.turno,
        consulta_disponible: horario.consulta_disponible
      };
    }
    
    // Verificar que las opciones se copiaron correctamente
    const medicoFieldFinal = this.formFields.find(f => f.key === 'id_medico');
    console.log('Opciones finales de médicos:', medicoFieldFinal?.options);
    console.log('Valor seleccionado id_medico:', this.selectedHorario.id_medico);
    console.log('Tipo de id_medico:', typeof this.selectedHorario.id_medico);
    
    // NUEVO: Verificar los valores de las opciones
    if (medicoFieldFinal?.options) {
      console.log('Valores en las opciones:');
      medicoFieldFinal.options.forEach((opt, index) => {
        console.log(`  [${index}] value: ${opt.value} (tipo: ${typeof opt.value}), label: ${opt.label}`);
      });
    }
    
    // Verificar si el valor existe en las opciones
    const medicoOption = medicoFieldFinal?.options?.find(opt => opt.value === this.selectedHorario.id_medico);
    console.log('Opción de médico encontrada:', medicoOption);
    
    // NUEVO: Intentar conversión de tipos si no se encuentra
    if (!medicoOption && medicoFieldFinal?.options) {
      const medicoOptionString = medicoFieldFinal.options.find(opt => String(opt.value) === String(this.selectedHorario.id_medico));
      console.log('Opción de médico encontrada (comparación string):', medicoOptionString);
      
      // Si se encuentra con comparación de string, ajustar el tipo
      if (medicoOptionString) {
        this.selectedHorario.id_medico = medicoOptionString.value;
        console.log('Valor ajustado id_medico:', this.selectedHorario.id_medico, 'tipo:', typeof this.selectedHorario.id_medico);
      }
    }
    
    this.formTitle = 'Editar Horario';
    this.showForm = true;
  }

  openCreateForm() {
    // Verificar si las opciones están cargadas
    const medicoField = this.createFormFields.find(f => f.key === 'id_medico');
    console.log('Opciones de médicos al crear:', medicoField?.options);
    
    // Si las opciones no están cargadas, cargarlas primero
    if (!medicoField?.options || medicoField.options.length === 0) {
      console.log('Cargando opciones antes de mostrar el modal de creación...');
      this.loadSelectOptionsAndShowCreateModal();
    } else {
      this.showCreateModal();
    }
  }

  private loadSelectOptionsAndShowCreateModal() {
    let loadedCount = 0;
    const totalToLoad = 2; // médicos y consultorios
    
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        console.log('Opciones cargadas, mostrando modal de creación...');
        this.showCreateModal();
      }
    };
    
    // Cargar médicos
    this.usuariosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const medicos = response.data.filter(u => u.id_rol === 2);
          const medicosOptions = medicos.map((m: any) => ({
            label: `${m.nombre} ${m.apellido}`,
            value: m.id_usuario
          }));
          
          const createMedicosField = this.createFormFields.find((f: FormField) => f.key === 'id_medico');
          const editMedicosField = this.editFormFields.find((f: FormField) => f.key === 'id_medico');
          if (createMedicosField) createMedicosField.options = medicosOptions;
          if (editMedicosField) editMedicosField.options = medicosOptions;
        }
      },
      error: (_error: any) => {
        console.error('Error loading médicos:', _error);
        checkComplete();
      }
    });

    // Cargar consultorios
    this.consultoriosService.getAll().subscribe({
      next: (response: CrudResponse<any[]>) => {
        if (response.data) {
          const consultoriosOptions = response.data.map((c: any) => ({
            label: c.nombre_numero,
            value: c.id_consultorio
          }));
          
          const createConsultoriosField = this.createFormFields.find((f: FormField) => f.key === 'id_consultorio');
          const editConsultoriosField = this.editFormFields.find((f: FormField) => f.key === 'id_consultorio');
          if (createConsultoriosField) createConsultoriosField.options = consultoriosOptions;
          if (editConsultoriosField) editConsultoriosField.options = consultoriosOptions;
          
          console.log('Consultorios cargados:', consultoriosOptions);
        }
        checkComplete();
      },
      error: (_error: any) => {
        console.error('Error loading consultorios:', _error);
        checkComplete();
      }
    });
  }

  private showCreateModal() {
    this.selectedHorario = {};
    
    // Usar campos de creación y hacer una copia profunda de las opciones
    this.formFields = this.createFormFields.map(field => ({
      ...field,
      options: field.options ? [...field.options] : []
    }));
    
    this.formTitle = 'Nuevo Horario';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.selectedHorario = {};
  }


  viewHorario(horario: Horario) {
    this.selectedHorario = { ...horario };
    this.formTitle = 'Ver Horario';
    this.showForm = true;
  }

  deleteHorario(horario: Horario) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el horario ${horario.turno} del Dr. ${horario.medico_nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.horariosService.delete(horario.id_horario!).subscribe({
          next: (response: CrudResponse<any>) => {
            this.alertService.successDelete('horario');
            this.loadHorarios();
          },
          error: (error: any) => {
            console.error('Error deleting horario:', error);
            
            // Manejar específicamente el error 409
            if (error.status === 409) {
              this.alertService.error(
                'No se puede eliminar el horario. Este horario tiene consultas asociadas y no puede ser eliminado para mantener la integridad de los datos.'
              );
            } else {
              this.alertService.errorDelete('horario');
            }
          }
        });
      }
    });
  }

  handleSave(horarioData: Partial<Horario>) {
    // Validaciones del lado del cliente
    const missingFields: string[] = [];
    
    if (!horarioData.id_medico) {
      missingFields.push('Médico');
    }
    if (!horarioData.id_consultorio) {
      missingFields.push('Consultorio');
    }
    if (!horarioData.turno?.trim()) {
      missingFields.push('Turno');
    }
    // ELIMINAR: Solo validar fecha_hora al CREAR (no al editar)
    // ELIMINAR: if (!horarioData.id_horario && !horarioData.fecha_hora) {
    // ELIMINAR:   missingFields.push('Fecha y hora');
    // ELIMINAR: }

    if (missingFields.length > 0) {
      this.alertService.errorCreate('horario', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }

    // ELIMINAR: Validar que la fecha no sea en el pasado (solo si hay fecha_hora)
    // ELIMINAR: if (horarioData.fecha_hora) {
    // ELIMINAR:   const selectedDate = new Date(horarioData.fecha_hora);
    // ELIMINAR:   const now = new Date();
    // ELIMINAR:   if (selectedDate < now) {
    // ELIMINAR:     this.alertService.errorCreate('horario', 'La fecha y hora del horario no puede ser en el pasado.');
    // ELIMINAR:     return;
    // ELIMINAR:   }
    // ELIMINAR: }

    this.formLoading = true;
    
    const operation = horarioData.id_horario 
      ? this.horariosService.update(horarioData.id_horario, horarioData as any)
      : this.horariosService.create(horarioData as any);

    operation.subscribe({
      next: (response: CrudResponse<Horario>) => {
        this.alertService[horarioData.id_horario ? 'successUpdate' : 'successCreate']('horario');
        this.formLoading = false;
        this.closeForm();
        this.loadHorarios();
      },
      error: (error: any) => {
        console.error('Error saving horario:', error);
        
        let errorMessage = '';
        
        // Manejar códigos de estado HTTP específicos
        if (error.status === 409) {
          // Conflicto - horario ocupado o duplicado
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            const serverError = error.error.body.data[0].error;
            if (serverError && (serverError.toLowerCase().includes('horario') || serverError.toLowerCase().includes('ocupado') || serverError.toLowerCase().includes('disponible') || serverError.toLowerCase().includes('conflicto'))) {
              errorMessage = 'El horario seleccionado ya está ocupado o no está disponible. Por favor, seleccione otro horario.';
            } else {
              errorMessage = serverError;
            }
          } else {
            errorMessage = 'El horario seleccionado ya está ocupado o no está disponible. Por favor, seleccione otro horario.';
          }
        } else if (error.status === 400) {
          // Error de validación
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            const serverError = error.error.body.data[0].error;
            if (serverError && (serverError.toLowerCase().includes('horario') || serverError.toLowerCase().includes('ocupado') || serverError.toLowerCase().includes('disponible') || serverError.toLowerCase().includes('conflicto'))) {
              errorMessage = 'El horario seleccionado ya está ocupado o no está disponible. Por favor, seleccione otro horario.';
            } else {
              errorMessage = serverError || 'Los datos proporcionados no son válidos. Verifique el médico, consultorio, turno y fecha/hora.';
            }
          } else {
            errorMessage = 'Los datos proporcionados no son válidos. Verifique el médico, consultorio, turno y fecha/hora.';
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
        
        if (horarioData.id_horario) {
          this.alertService.errorUpdate('horario', errorMessage);
        } else {
          this.alertService.errorCreate('horario', errorMessage);
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