import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { MfaComponent } from '../mfa/mfa.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    CardModule,
    DividerModule,
    InputGroupModule,
    InputGroupAddonModule,
    ToastModule,
    MfaComponent
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../../shared/styles/auth.styles.css']
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  loading = false;
  showMFA = false;
  qrCodeUrl = '';
  backupCodes: string[] = [];
  requiresMFA = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Por favor, completa todos los campos'
      });
      return;
    }

    this.loading = true;
    
    const credentials: LoginRequest = {
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.requires_mfa) {
          this.requiresMFA = true;
          
          if (response.qr_code_url) {
            // Primera vez configurando MFA - mostrar QR
            this.qrCodeUrl = response.qr_code_url;
            this.backupCodes = response.backup_codes || [];
            this.showMFA = true;
            
            this.messageService.add({
              severity: 'info',
              summary: 'Configuración MFA',
              detail: 'Escanea el código QR para configurar la autenticación de dos factores'
            });
          } else {
            // Usuario ya tiene MFA configurado - solo pedir código
            this.showMFA = true;
            
            this.messageService.add({
              severity: 'info',
              summary: 'Código MFA requerido',
              detail: 'Ingresa tu código de autenticación de dos factores'
            });
          }
        } else if (response.access_token && response.usuario) {
          this.handleSuccessfulLogin(response);
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
          errorMessage = error.error.body.data[0].error || errorMessage;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error de autenticación',
          detail: errorMessage
        });
      }
    });
  }

  onGoogleLogin() {
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: 'Login con Google estará disponible pronto'
    });
  }
  
  handleSuccessfulLogin(response: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Bienvenido',
      detail: `Hola ${response.usuario.nombre} ${response.usuario.apellido}`
    });
    
    // Guardar tokens y datos del usuario
    localStorage.setItem('access_token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    localStorage.setItem('user', JSON.stringify(response.usuario));
    
    // Navegar al dashboard
    this.router.navigate(['/dashboard']);
  }
  
  onMfaVerified(response: any) {
    this.handleSuccessfulLogin(response);
  }
  
  onMfaCancelled() {
    this.showMFA = false;
    this.requiresMFA = false;
    this.qrCodeUrl = '';
    this.backupCodes = [];
  }
}