import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

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
    CalendarModule,
    CheckboxModule,
    CardModule,
    DividerModule
  ],
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
    birthDate: null,
    acceptTerms: false
  };

  roles = [
    { label: 'Médico General', value: 'medico_general' },
    { label: 'Especialista', value: 'especialista' },
    { label: 'Enfermero/a', value: 'enfermero' },
    { label: 'Administrador', value: 'administrador' },
    { label: 'Recepcionista', value: 'recepcionista' }
  ];

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (!this.registerData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    console.log('Register attempt:', this.registerData);
    // Aquí irá la lógica de registro
  }
}