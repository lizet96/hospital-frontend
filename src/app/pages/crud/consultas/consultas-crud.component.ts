import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { ConsultasService, Consulta } from '../../../services/consultas.service';
import { PacientesService } from '../../../services/pacientes.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { HorariosService } from '../../../services/horarios.service';
import { CrudResponse } from '../../../services/base-crud.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-consultas-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ToastModule, ButtonModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
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
        title="Consultas"
        entityName="Consulta"
        [data]="consultas"
        [columns]="columns"
        [actions]="actions"  
        [loading]="loading"
        [canCreate]="canCreate"
        (onCreate)="openCreateForm()">
      </app-base-table>

      <app-base-form
        *ngIf="showForm"
        [visible]="showForm"
        [fields]="formFields"
        [formData]="selectedConsulta"
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
  
  // Propiedades para manejo de horarios
  allHorarios: any[] = [];
  filteredHorarios: any[] = [];
  
  canCreate = false;
  canEdit = false;
  canDelete = false;
  canView = false;

  columns: TableColumn[] = [
    { field: 'id_consulta', header: 'ID', sortable: true, filterable: true },
    { field: 'paciente_nombre', header: 'Paciente', sortable: true, filterable: true },
    { field: 'medico_nombre', header: 'Médico', sortable: true, filterable: true },
    { field: 'tipo', header: 'Tipo', sortable: true, filterable: true },
    { field: 'diagnostico', header: 'Diagnóstico', sortable: true, filterable: true },
    { field: 'costo', header: 'Costo', sortable: true, filterable: true, type: 'number' },
    { field: 'hora', header: 'Fecha y hora', sortable: true, filterable: true, type: 'datetime' },
    { field: 'consultorio_nombre', header: 'Consultorio', sortable: true, filterable: true },
    { field: 'horario_turno', header: 'Turno', sortable: true, filterable: true },
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
      key: 'id_medico',
      label: 'Médico',
      type: 'select',
      required: true,
      options: [],
      onChange: (value: number) => this.onMedicoChange(value)
    },
    {
      key: 'fecha',
      label: 'Fecha de la Consulta',
      type: 'date',
      required: true
    },
    {
      key: 'hora_tiempo',
      label: 'Hora de la Consulta',
      type: 'time',
      required: true,
      placeholder: 'Seleccione la hora'
    },
    {
      key: 'tipo',
      label: 'Tipo de Consulta',
      type: 'select',
      required: true,
      options: [
        { label: 'Consulta General', value: 'general' },
        { label: 'Consulta Especializada', value: 'especializada' },
        { label: 'Urgencia', value: 'urgencia' },
        { label: 'Control', value: 'control' }
      ]
    },
    {
      key: 'diagnostico',
      label: 'Diagnóstico',
      type: 'textarea'
    },
    {
      key: 'costo',
      label: 'Costo',
      type: 'number',
      required: true
    }
  ];

  constructor(
    private crudService: ConsultasService,
    private pacientesService: PacientesService,
    private usuariosService: UsuariosService,
    private horariosService: HorariosService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.checkPermissions();
    this.setupActions();
    this.loadConsultas();
    this.loadSelectOptions();
  }

  private checkPermissions() {
    const user = this.authService.getCurrentUser();
    console.log('🔍 Usuario actual:', user);
    
    if (user) {
      this.canView = this.authService.hasPermission('consultas_read');
      this.canCreate = this.authService.hasPermission('consultas_create');
      this.canEdit = this.authService.hasPermission('consultas_update');
      this.canDelete = this.authService.hasPermission('consultas_delete');
      
      console.log('📋 Permisos del usuario:', user.rol?.permisos);
      console.log('✅ Permisos verificados:');
      console.log('  - canView (consultas_read):', this.canView);
      console.log('  - canCreate (consultas_create):', this.canCreate);
      console.log('  - canEdit (consultas_update):', this.canEdit);
      console.log('  - canDelete (consultas_delete):', this.canDelete);
    } else {
      console.log('❌ No hay usuario autenticado');
    }
  }

  private setupActions() {
    this.actions = [];
    console.log('🔧 Configurando acciones...');
    if (this.canEdit) {
      this.actions.push({
        label: 'Editar',
        icon: 'pi pi-pencil',
        action: (item: Consulta) => this.editConsulta(item)
      });
      console.log('✏️ Acción "Editar" agregada');
    }
    
    if (this.canDelete) {
      this.actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        action: (item: Consulta) => this.deleteConsulta(item),
        severity: 'danger'
      });
      console.log('🗑️ Acción "Eliminar" agregada');
    }
    
    console.log('📊 Total de acciones configuradas:', this.actions.length);
    console.log('📋 Acciones finales:', this.actions);
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
        this.alertService.errorLoad('consultas', 'No se pudieron cargar los datos del servidor');
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
            label: `${p.nombre} ${p.apellido}`,
            value: p.id_usuario
          }));
        }
      }
    });
  
    // Cargar médicos (usuarios con rol médico)
    this.usuariosService.getByRole(2).subscribe({
      next: (response: CrudResponse<any[]>) => {
        const medicosField = this.formFields.find(f => f.key === 'id_medico');
        if (medicosField && response.data) {
          medicosField.options = response.data.map((m: any) => ({
            label: `${m.nombre} ${m.apellido || ''}`,
            value: m.id_usuario
          }));
        }
      }
    });
  
    // Cargar TODOS los horarios disponibles
    this.horariosService.getDisponibles().subscribe({
      next: (response: CrudResponse<any[]>) => {
        console.log('Horarios disponibles:', response.data);
        this.allHorarios = response.data || [];
        // Inicialmente no mostrar ningún horario hasta que se seleccione un médico
        this.updateHorariosOptions([]);
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.alertService.errorLoad('horarios disponibles', 'No se pudieron cargar los horarios');
      }
    });
  }

  onMedicoChange(selectedMedicoId: number) {
    console.log('Médico seleccionado:', selectedMedicoId);
    console.log('Todos los horarios:', this.allHorarios);
    
    if (selectedMedicoId) {
      // Filtrar horarios por el médico seleccionado
      this.filteredHorarios = this.allHorarios.filter((h: any) => h.id_medico === selectedMedicoId);
      console.log('Horarios filtrados:', this.filteredHorarios);
      
      this.updateHorariosOptions(this.filteredHorarios);
      
      // Limpiar la selección de horario si ya había una
      if (this.selectedConsulta?.id_horario) {
        const horarioStillValid = this.filteredHorarios.some((h: any) => h.id_horario === this.selectedConsulta?.id_horario);
        if (!horarioStillValid && this.selectedConsulta) {
          this.selectedConsulta.id_horario = undefined;
        }
      } else {
        // Si no hay médico seleccionado, limpiar horarios
        this.filteredHorarios = [];
        this.updateHorariosOptions([]);
        if (this.selectedConsulta) {
          this.selectedConsulta.id_horario = undefined;
        }
      }
    }
  }

  private updateHorariosOptions(horarios: any[]) {
    console.log('Actualizando opciones de horarios:', horarios);
    const horariosField = this.formFields.find(f => f.key === 'id_horario');
    if (horariosField) {
      horariosField.options = horarios.map((h: any) => ({
        label: `Turno ${h.turno} - ${h.fecha_hora ? new Date(h.fecha_hora).toLocaleDateString() : 'Sin fecha'} (${h.consultorio_nombre || 'Consultorio'})`,
        value: h.id_horario
      }));
      console.log('Opciones de horarios actualizadas:', horariosField.options);
    }
  }

  deleteConsulta(consulta: Consulta): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la consulta de ${consulta.paciente_nombre} con ${consulta.medico_nombre}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.crudService.delete(consulta.id_consulta!).subscribe({
          next: (response: CrudResponse<any>) => {
            this.alertService.successDelete('Consulta');
            this.loadConsultas();
          },
          error: (error) => {
            this.alertService.errorDelete('consulta', 'No se pudo completar la operación');
          }
        });
      }
    });
  }

  handleSave(consultaData: Partial<Consulta>) {
    // Validaciones del lado del cliente
    const missingFields: string[] = [];
    
    if (!consultaData.id_paciente) {
      missingFields.push('Paciente');
    }
    if (!consultaData.id_medico) {
      missingFields.push('Médico');
    }
    
    // Fix: Check for the temporary form fields instead of 'fecha' on Consulta type
    if (!consultaData.hora && !(consultaData as any).fecha) {
      missingFields.push('Fecha y hora de la consulta');
    }
    if (!consultaData.tipo) {
      missingFields.push('Tipo de consulta');
    }
    if (!consultaData.costo || consultaData.costo <= 0) {
      missingFields.push('Costo válido');
    }
  
    if (missingFields.length > 0) {
      this.alertService.errorCreate('consulta', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }
  
    // Si usas campos separados de fecha y hora, combínalos correctamente
    if ((consultaData as any).fecha && (consultaData as any).hora_tiempo) {
      const fechaStr = (consultaData as any).fecha;
      const horaStr = (consultaData as any).hora_tiempo;
      
      try {
        let fechaFormateada: string;
        let horaFormateada: string;
        
        // Procesar la fecha
        if (fechaStr instanceof Date) {
          fechaFormateada = fechaStr.toISOString().split('T')[0];
        } else if (typeof fechaStr === 'string') {
          if (fechaStr.includes('T')) {
            fechaFormateada = fechaStr.split('T')[0];
          } else if (fechaStr.includes('/')) {
            const partes = fechaStr.split('/');
            if (partes.length === 3) {
              fechaFormateada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            } else {
              fechaFormateada = fechaStr;
            }
          } else if (fechaStr.includes('-')) {
            fechaFormateada = fechaStr;
          } else {
            throw new Error('Formato de fecha no reconocido');
          }
        } else {
          throw new Error('Tipo de fecha no válido');
        }
        
        // Procesar la hora
        if (typeof horaStr === 'string') {
          const partesHora = horaStr.split(':');
          if (partesHora.length >= 2) {
            const horas = partesHora[0].padStart(2, '0');
            const minutos = partesHora[1].padStart(2, '0');
            const segundos = partesHora[2] || '00';
            horaFormateada = `${horas}:${minutos}:${segundos}`;
          } else {
            throw new Error('Formato de hora no válido');
          }
        } else {
          throw new Error('Tipo de hora no válido');
        }
        
        // Combinar fecha y hora
        const fechaHoraCombinada = `${fechaFormateada}T${horaFormateada}`;
        const fechaObj = new Date(fechaHoraCombinada);
        
        if (isNaN(fechaObj.getTime())) {
          throw new Error(`Fecha/hora inválida: ${fechaHoraCombinada}`);
        }
        
        // Mantener la hora local sin convertir a UTC
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        const hours = String(fechaObj.getHours()).padStart(2, '0');
        const minutes = String(fechaObj.getMinutes()).padStart(2, '0');
        const seconds = String(fechaObj.getSeconds()).padStart(2, '0');
        
        // Formato sin zona horaria para mantener la hora local
        consultaData.hora = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        
        // Asignar id_horario automáticamente basado en la hora
        const horaSeleccionada = fechaObj.getHours();
        if (horaSeleccionada < 16) { // Antes de las 4 PM (16:00)
          consultaData.id_horario = 1;
          console.log(`Hora ${horaSeleccionada}:${fechaObj.getMinutes()} - Asignando id_horario: 1 (turno mañana)`);
        } else { // 4 PM (16:00) o después
          consultaData.id_horario = 2;
          console.log(`Hora ${horaSeleccionada}:${fechaObj.getMinutes()} - Asignando id_horario: 2 (turno tarde)`);
        }
      } catch (error) {
        console.error('Error procesando fecha y hora:', error);
        this.alertService.errorCreate('consulta', 
          `Error en formato de fecha/hora. ${error instanceof Error ? error.message : 'Error desconocido'}`);
        return;
      }
      
      // Limpiar campos temporales
      delete (consultaData as any).fecha;
      delete (consultaData as any).hora_tiempo;
    }
  
    // Clean the data before sending to backend
    const cleanedData = { ...consultaData };
    
    // Remove undefined, null, and empty values
    Object.keys(cleanedData).forEach(key => {
      const value = (cleanedData as any)[key];
      if (value === undefined || value === null || value === '') {
        delete (cleanedData as any)[key];
      }
    });
    
    // Specifically handle id_horario - remove if it's 0 or undefined
    if (!cleanedData.id_horario || cleanedData.id_horario === 0) {
      delete (cleanedData as any).id_horario;
    }
    
    console.log('Datos limpios para enviar:', cleanedData);
    
    this.formLoading = true;
    
    const operation = cleanedData.id_consulta 
      ? this.crudService.update(cleanedData.id_consulta, cleanedData)
      : this.crudService.create(cleanedData);
  
    operation.subscribe({
      next: (response: CrudResponse<Consulta>) => {
        this.formLoading = false;
        if (cleanedData.id_consulta) {
          this.alertService.successUpdate('Consulta');
        } else {
          this.alertService.successCreate('Consulta');
        }
        this.closeForm();
        this.loadConsultas();
      },
      error: (error: any) => {
        this.formLoading = false;
        console.error('Error saving consulta:', error);
        console.error('Datos enviados al backend:', cleanedData);
        
        let errorMessage = 'Verifique que todos los datos sean válidos';
        
        if (error.status === 409) {
          errorMessage = 'Ya existe una consulta programada para este horario';
        } else if (error.status === 400) {
          if (error.error?.body?.data?.[0]?.error) {
            errorMessage = error.error.body.data[0].error;
          }
        }
        
        if (cleanedData.id_consulta) {
          this.alertService.errorUpdate('consulta', errorMessage);
        } else {
          this.alertService.errorCreate('consulta', errorMessage);
        }
      }
    });
  }

  openCreateForm() {
    this.selectedConsulta = this.getEmptyConsulta();
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
    
    // 🔥 MANEJAR FECHA Y HORA UTC CORRECTAMENTE
    if (consulta.hora) {
      const fechaOriginal = consulta.hora;
      
      if (fechaOriginal.includes('T') && fechaOriginal.includes('Z')) {
        // Es formato UTC, extraer fecha y hora directamente del string
        const [fechaParte, horaParte] = fechaOriginal.split('T');
        const horaLimpia = horaParte.replace('Z', '');
        
        // Para el campo fecha: convertir string a objeto Date
        const [year, month, day] = fechaParte.split('-').map(Number);
        const fechaDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
        
        // Para el campo hora: mantener como string
        const hora_tiempo = horaLimpia.substring(0, 5); // HH:MM
        
        // Asignar los valores correctos
        (this.selectedConsulta as any).fecha = fechaDate; // 🔥 OBJETO DATE
        (this.selectedConsulta as any).hora_tiempo = hora_tiempo; // STRING
        
        console.log('📅 Fecha extraída (Date object):', fechaDate);
        console.log('🕐 Hora extraída (string):', hora_tiempo);
        console.log('📋 Datos originales:', fechaOriginal);
      } else {
        // Formato normal, usar el método anterior
        const fechaHora = new Date(fechaOriginal);
        
        const year = fechaHora.getFullYear();
        const month = fechaHora.getMonth();
        const day = fechaHora.getDate();
        const fechaDate = new Date(year, month, day);
        
        const hours = String(fechaHora.getHours()).padStart(2, '0');
        const minutes = String(fechaHora.getMinutes()).padStart(2, '0');
        const hora_tiempo = `${hours}:${minutes}`;
        
        (this.selectedConsulta as any).fecha = fechaDate;
        (this.selectedConsulta as any).hora_tiempo = hora_tiempo;
      }
    }
    
    this.formTitle = 'Editar Consulta';
    this.showForm = true;
  }

  private getEmptyConsulta(): Partial<Consulta> {
    return {
      tipo: '',
      diagnostico: '',
      costo: 0,
      id_paciente: undefined,
      id_medico: undefined,
      id_horario: undefined,
      hora: ''
    };
  }

  handleSort(event: any) {
    // Implementar ordenamiento si es necesario
  }

  handleFilter(event: any) {
    // Implementar filtrado si es necesario
  }
}