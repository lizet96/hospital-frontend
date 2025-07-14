import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { AuthService, RegisterRequest } from '../../../services/auth.service';

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
    ToastModule,
    CheckboxModule,
    CalendarModule
  ],
  providers: [MessageService],
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
    id_rol: 4, // Asignar automáticamente rol de paciente
    acceptTerms: false
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onRegister() {
    // Validaciones
    if (!this.registerData.firstName || !this.registerData.lastName || 
        !this.registerData.email || !this.registerData.password || 
        !this.registerData.birthDate || !this.registerData.id_rol) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor, completa todos los campos obligatorios'
      });
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Contraseñas no coinciden',
        detail: 'Las contraseñas deben ser iguales'
      });
      return;
    }
    
    if (!this.registerData.acceptTerms) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Términos y condiciones',
        detail: 'Debes aceptar los términos y condiciones'
      });
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
          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Usuario registrado correctamente. Por favor, inicia sesión.'
          });
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
          this.messageService.add({
            severity: 'error',
            summary: 'Error en el registro',
            detail: errorMessage
          });
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al registrar usuario';
        
        // Manejar errores del backend
        if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
          errorMessage = error.error.body.data[0].error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
}