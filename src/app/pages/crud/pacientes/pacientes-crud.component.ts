import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BaseTableComponent, TableColumn, TableAction } from '../../../shared/components/base-table.component';
import { BaseFormComponent, FormField } from '../../../shared/components/base-form.component';
import { UsuariosService, Usuario, CrudResponse } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService } from 'primeng/api';
import { AlertService } from '../../../services/alert.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface PacienteExtended extends Usuario {
  // Campos adicionales específicos para pacientes si los hay
}

@Component({
  selector: 'app-pacientes-crud',
  standalone: true,
  imports: [CommonModule, BaseTableComponent, BaseFormComponent, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
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
    private alertService: AlertService,
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
        this.alertService.errorLoad('pacientes', 'No se pudieron cargar los datos del servidor');
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
    this.formLoading = false;
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
            this.alertService.successDelete('Paciente');
            this.loadPacientes();
          },
          error: (error) => {
            this.alertService.errorDelete('paciente', 'No se pudo completar la operación');
          }
        });
      }
    });
  }

  saveUser(userData: any) {
    // Validaciones del lado del cliente (igual que en register)
    const missingFields: string[] = [];
    
    if (!userData.nombre?.trim()) {
      missingFields.push('Nombre');
    }
    if (!userData.apellido?.trim()) {
      missingFields.push('Apellido');
    }
    if (!userData.email?.trim()) {
      missingFields.push('Correo electrónico');
    }
    if (!this.isEditing && (!userData.password?.trim())) {
      missingFields.push('Contraseña');
    }
    if (!userData.fecha_nacimiento) {
      missingFields.push('Fecha de nacimiento');
    }

    if (missingFields.length > 0) {
      this.alertService.errorCreate('paciente', `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      this.alertService.errorCreate('paciente', 'Correo electrónico inválido. Por favor, ingrese un correo válido (ejemplo: usuario@dominio.com)');
      return;
    }

    // Validar contraseña solo si no estamos editando o si se proporcionó una nueva contraseña
    if (!this.isEditing || (userData.password && userData.password.trim() !== '')) {
      // Validar longitud de contraseña
      if (userData.password.length < 12) {
        this.alertService.errorCreate('paciente', 'Contraseña muy corta. La contraseña debe tener al menos 12 caracteres');
        return;
      }

      // Validar complejidad de contraseña
      const hasUpperCase = /[A-Z]/.test(userData.password);
      const hasLowerCase = /[a-z]/.test(userData.password);
      const hasNumbers = /\d/.test(userData.password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(userData.password);
      
      const missingRequirements: string[] = [];
      if (!hasUpperCase) missingRequirements.push('al menos una letra mayúscula');
      if (!hasLowerCase) missingRequirements.push('al menos una letra minúscula');
      if (!hasNumbers) missingRequirements.push('al menos un número');
      if (!hasSpecialChar) missingRequirements.push('al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
      
      if (missingRequirements.length > 0) {
        this.alertService.errorCreate('paciente', `Contraseña no cumple los requisitos. Debe contener: ${missingRequirements.join(', ')}`);
        return;
      }
    }

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
          this.formLoading = false;
          this.alertService.successUpdate('Paciente');
          this.closeForm();
          this.loadPacientes();
        },
        error: (error: any) => {
           this.formLoading = false;
           console.log('Error completo (update):', error);
           console.log('error.error (update):', error.error);
           console.log('error.error.body (update):', error.error?.body);
           console.log('error.error.body.data (update):', error.error?.body?.data);
           
           let errorMessage = 'Verifique que todos los datos sean válidos';
           
           // Manejar códigos de estado HTTP específicos (igual que en register)
           if (error.status === 409) {
             // Correo duplicado
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               errorMessage = error.error.body.data[0].error;
             } else {
               errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
             }
           } else if (error.status === 400) {
             // Error de validación
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               const serverError = error.error.body.data[0].error;
               // Verificar si es un error de correo duplicado
               if (serverError && (serverError.toLowerCase().includes('email') || serverError.toLowerCase().includes('correo')) && 
                   (serverError.toLowerCase().includes('registrado') || serverError.toLowerCase().includes('existe') || serverError.toLowerCase().includes('duplicado'))) {
                 errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
               } else {
                 errorMessage = serverError || 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
               }
             } else {
               errorMessage = 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
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
           
           console.log('Mensaje final (update):', errorMessage);
           this.alertService.errorUpdate('paciente', errorMessage);
         }
      });
    } else {
      const createData = { ...dataToSend };
      delete createData.id_usuario;
      
      this.usuariosService.create(createData).subscribe({
        next: (response: CrudResponse<Usuario>) => {
          this.formLoading = false;
          this.alertService.successCreate('Paciente');
          this.closeForm();
          this.loadPacientes();
        },
        error: (error: any) => {
           this.formLoading = false;
           console.log('Error completo:', error);
           console.log('error.error:', error.error);
           console.log('error.error.body:', error.error?.body);
           console.log('error.error.body.data:', error.error?.body?.data);
           
           let errorMessage = 'Verifique que todos los datos sean válidos';
           
           // Manejar códigos de estado HTTP específicos (igual que en register)
           if (error.status === 409) {
             // Correo duplicado
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               errorMessage = error.error.body.data[0].error;
             } else {
               errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
             }
           } else if (error.status === 400) {
             // Error de validación
             if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
               const serverError = error.error.body.data[0].error;
               // Verificar si es un error de correo duplicado
               if (serverError && (serverError.toLowerCase().includes('email') || serverError.toLowerCase().includes('correo')) && 
                   (serverError.toLowerCase().includes('registrado') || serverError.toLowerCase().includes('existe') || serverError.toLowerCase().includes('duplicado'))) {
                 errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente.';
               } else {
                 errorMessage = serverError || 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
               }
             } else {
               errorMessage = 'Los datos proporcionados no son válidos. Por favor, revise la información ingresada.';
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
           
           console.log('Mensaje final:', errorMessage);
           this.alertService.errorCreate('paciente', errorMessage);
         }
      });
    }
  }

  savePaciente(pacienteData: any) {
    this.saveUser(pacienteData);
  }
}