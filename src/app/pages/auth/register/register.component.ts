import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AuthService, RegisterRequest } from '../../../services/auth.service';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    CheckboxModule,
    CalendarModule,
    CustomAlertComponent
  ],
  providers: [],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../../shared/styles/auth.styles.css']
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    id_rol: 4 // Asignar automáticamente rol de paciente
  };

  loading = false;
  
  // Variables para mensajes inline
  showMessage = false;
  messageText = '';
  messageSeverity: 'success' | 'info' | 'warning' | 'error' = 'info';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister() {
    // Validaciones detalladas de campos requeridos
    const missingFields: string[] = [];
    
    if (!this.registerData.firstName?.trim()) {
      missingFields.push('Nombre');
    }
    if (!this.registerData.lastName?.trim()) {
      missingFields.push('Apellido');
    }
    if (!this.registerData.email?.trim()) {
      missingFields.push('Correo electrónico');
    }
    if (!this.registerData.password?.trim()) {
      missingFields.push('Contraseña');
    }
    if (!this.registerData.confirmPassword?.trim()) {
      missingFields.push('Confirmación de contraseña');
    }
    if (!this.registerData.birthDate) {
      missingFields.push('Fecha de nacimiento');
    }
    if (!this.registerData.id_rol) {
      missingFields.push('Rol');
    }

    if (missingFields.length > 0) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = `Campos obligatorios faltantes: ${missingFields.join(', ')}`;
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Correo electrónico inválido. Por favor, ingrese un correo válido (ejemplo: usuario@dominio.com)';
      return;
    }

    // Validar longitud de contraseña
    if (this.registerData.password.length < 12) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Contraseña muy corta. La contraseña debe tener al menos 12 caracteres';
      return;
    }

    // Validar complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(this.registerData.password);
    const hasLowerCase = /[a-z]/.test(this.registerData.password);
    const hasNumbers = /\d/.test(this.registerData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(this.registerData.password);
    
    const missingRequirements: string[] = [];
    if (!hasUpperCase) missingRequirements.push('al menos una letra mayúscula');
    if (!hasLowerCase) missingRequirements.push('al menos una letra minúscula');
    if (!hasNumbers) missingRequirements.push('al menos un número');
    if (!hasSpecialChar) missingRequirements.push('al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    
    if (missingRequirements.length > 0) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = `Contraseña no cumple los requisitos. Debe contener: ${missingRequirements.join(', ')}`;
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Contraseñas no coinciden. La contraseña y su confirmación deben ser idénticas';
      return;
    }
    


    this.loading = true;

    // Formatear fecha al formato esperado por el backend (YYYY-MM-DD)
    let fechaFormateada = this.registerData.birthDate;
    // Si la fecha viene como objeto Date del p-calendar, convertirla a string
    if (this.registerData.birthDate && typeof this.registerData.birthDate === 'object') {
      fechaFormateada = (this.registerData.birthDate as any).toISOString().split('T')[0];
    }

    const userData: RegisterRequest = {
      nombre: this.registerData.firstName,
      apellido: this.registerData.lastName,
      email: this.registerData.email,
      password: this.registerData.password,
      id_rol: this.registerData.id_rol!,
      fecha_nacimiento: fechaFormateada
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.statusCode === 201 && response.body.intCode === 'S02') {
          this.showMessage = true;
          this.messageSeverity = 'success';
          this.messageText = 'Usuario registrado correctamente. Por favor, inicia sesión.';
          // Redirigir al login después del registro exitoso
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          // Extraer mensaje de error del backend
          let errorMessage = 'No se pudo registrar el usuario';
          if (response.body.data && response.body.data.length > 0 && response.body.data[0].error) {
            errorMessage = response.body.data[0].error;
          }
          this.showMessage = true;
          this.messageSeverity = 'error';
          this.messageText = errorMessage;
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al registrar usuario';
        
        // Manejar códigos de estado HTTP específicos
        if (error.status === 409) {
          // Correo duplicado
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            errorMessage = error.error.body.data[0].error;
          } else {
            errorMessage = 'El correo electrónico ya está registrado. Por favor, use un correo diferente o inicie sesión si ya tiene una cuenta.';
          }
        } else if (error.status === 400) {
          // Error de validación
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            errorMessage = error.error.body.data[0].error;
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
        
        this.showMessage = true;
        this.messageSeverity = 'error';
        this.messageText = errorMessage;
      }
    });
  }

  hideMessage() {
    this.showMessage = false;
    this.messageText = '';
  }
}