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
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { MfaComponent } from '../mfa/mfa.component';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';

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
    MfaComponent,
    CustomAlertComponent
  ],
  providers: [],
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
  
  // Variables para mensajes inline
  showMessage = false;
  messageText = '';
  messageSeverity: 'success' | 'info' | 'warning' | 'error' = 'info';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    // Validaciones detalladas antes de enviar
    if (!this.loginData.email?.trim() || !this.loginData.password?.trim()) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'El correo electrónico y la contraseña son obligatorios para iniciar sesión';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Por favor, ingrese un correo electrónico válido';
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
            
            this.showMessage = true;
            this.messageSeverity = 'info';
            this.messageText = 'Escanea el código QR para configurar la autenticación de dos factores';
          } else {
            // Usuario ya tiene MFA configurado - solo pedir código
            this.showMFA = true;
            
            this.showMessage = true;
            this.messageSeverity = 'info';
            this.messageText = 'Ingresa tu código de autenticación de dos factores';
          }
        } else if (response.access_token && response.usuario) {
          this.handleSuccessfulLogin(response);
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al iniciar sesión';
        
        // Manejar códigos de estado HTTP específicos
        if (error.status === 429) {
          // Demasiados intentos
          errorMessage = 'Demasiados intentos de login, intenta más tarde';
        } else if (error.status === 401) {
          // Credenciales incorrectas
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            errorMessage = error.error.body.data[0].error;
          } else {
            errorMessage = 'Credenciales incorrectas. Verifique su correo y contraseña.';
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
          }
        }
        
        this.showMessage = true;
        this.messageSeverity = 'error';
        this.messageText = errorMessage;
      }
    });
  }

  onGoogleLogin() {
    this.showMessage = true;
    this.messageSeverity = 'info';
    this.messageText = 'Login con Google estará disponible pronto';
  }
  
  handleSuccessfulLogin(response: any) {
    this.showMessage = true;
    this.messageSeverity = 'success';
    this.messageText = `Bienvenido ${response.usuario.nombre} ${response.usuario.apellido}`;
    
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
  
  hideMessage() {
    this.showMessage = false;
    this.messageText = '';
  }
}