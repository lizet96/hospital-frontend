import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { CustomAlertComponent } from '../../../shared/components/custom-alert/custom-alert.component';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    DividerModule,
    CustomAlertComponent
  ],
  providers: [],
  styleUrl: './mfa.component.css',
  template: `
    <div class="mfa-container">
      <!-- Mensaje inline -->
      <app-custom-alert 
        [show]="showMessage" 
        [type]="messageSeverity" 
        [message]="messageText" 
        [closable]="true" 
        (close)="hideMessage()">
      </app-custom-alert>
      <p-card>
        <ng-template pTemplate="header">
          <div class="text-center p-4">
            <h2>Autenticación de Dos Factores</h2>
          </div>
        </ng-template>
        
        <!-- Configuración inicial de MFA -->
        <div *ngIf="showQRCode" class="text-center">
          <h3>Configurar Autenticación</h3>
          <p>Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)</p>
          
          <div class="qr-container mb-4">
            <img [src]="qrCodeDataUrl" alt="QR Code" class="qr-image" *ngIf="qrCodeDataUrl" />
          </div>
          
          <p-divider></p-divider>
          
          <div class="mt-4">
            <h4>Ingresa el código de verificación</h4>
            <p>Después de escanear el QR, ingresa el código de 6 dígitos de tu aplicación:</p>
          </div>
        </div>
        
        <!-- Solo solicitar código MFA -->
        <div *ngIf="!showQRCode" class="text-center">
          <h3>Código de Verificación</h3>
          <p>Ingresa el código de 6 dígitos de tu aplicación de autenticación:</p>
        </div>
        
        <!-- Campo para ingresar código MFA -->
        <div class="p-inputgroup mt-4">
          <span class="p-inputgroup-addon">
            <i class="pi pi-shield"></i>
          </span>
          <input
            type="text"
            pInputText
            [(ngModel)]="mfaCode"
            placeholder="Código de 6 dígitos"
            maxlength="6"
            class="text-center"
            (keyup.enter)="onVerifyMFA()"
          />
        </div>
        
        <div class="mt-4 text-center">
          <p-button
            label="Verificar"
            icon="pi pi-check"
            [loading]="loading"
            (onClick)="onVerifyMFA()"
            [disabled]="!mfaCode || mfaCode.length !== 6"
            class="w-full"
          ></p-button>
        </div>
        
        <div class="mt-3 text-center">
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            (onClick)="onCancel()"
            [text]="true"
          ></p-button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .mfa-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .qr-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .qr-image {
      max-width: 200px;
      height: auto;
    }
    
    .backup-codes {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }
    
    .backup-codes-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .backup-code {
      background: white;
      padding: 0.5rem;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
      text-align: center;
      border: 1px solid #dee2e6;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
    
    .text-gray-600 {
      color: #6b7280;
    }
    
    .w-full {
      width: 100%;
    }
    
    .message-container {
      margin-bottom: 1rem;
    }
    
    .custom-message {
      border-radius: 8px;
      border: none;
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .custom-message.p-message-success {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      border-left: 4px solid #28a745;
    }
    
    .custom-message.p-message-error {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    
    .custom-message.p-message-warn {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      border-left: 4px solid #ffc107;
    }
    
    .custom-message.p-message-info {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }
  `]
})
export class MfaComponent implements OnInit, OnChanges {
  @Input() showQRCode: boolean = false;
  @Input() qrCodeUrl: string = '';
  
  qrCodeDataUrl: string = '';
  @Input() backupCodes: string[] = [];
  @Input() email: string = '';
  @Input() password: string = '';
  
  @Output() mfaVerified = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  
  mfaCode: string = '';
  loading: boolean = false;
  
  // Variables para mensajes inline
  showMessage = false;
  messageText = '';
  messageSeverity: 'success' | 'info' | 'warning' | 'error' = 'info';
  
  constructor(
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.generateQRCode();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['qrCodeUrl'] && this.qrCodeUrl) {
      this.generateQRCode();
    }
  }
  
  async generateQRCode() {
    if (this.qrCodeUrl && this.showQRCode) {
      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(this.qrCodeUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Error generando código QR:', error);
        this.showMessage = true;
        this.messageSeverity = 'error';
        this.messageText = 'No se pudo generar el código QR';
      }
    }
  }
  
  onVerifyMFA() {
    // Validaciones detalladas del código MFA
    if (!this.mfaCode?.trim()) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Por favor, ingrese el código de autenticación de dos factores';
      return;
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(this.mfaCode)) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'El código MFA debe contener solo números (0-9)';
      return;
    }

    // Validar longitud exacta
    if (this.mfaCode.length !== 6) {
      this.showMessage = true;
      this.messageSeverity = 'warning';
      this.messageText = 'Tienes que ser 6 dígitos';
      return;
    }
    
    this.loading = true;
    
    const credentials: LoginRequest & { mfa_code?: string } = {
      email: this.email,
      password: this.password,
      mfa_code: this.mfaCode
    };
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.access_token && response.usuario) {
          this.showMessage = true;
          this.messageSeverity = 'success';
          this.messageText = 'Autenticación completada correctamente';
          this.mfaVerified.emit(response);
        } else {
          this.showMessage = true;
          this.messageSeverity = 'error';
          this.messageText = 'El código ingresado no es válido';
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al verificar el código';
        
        // Manejar códigos de estado HTTP específicos
        if (error.status === 429) {
          // Demasiados intentos
          errorMessage = 'Demasiados intentos de verificación, intenta más tarde';
        } else if (error.status === 401) {
          // Código MFA incorrecto
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            errorMessage = error.error.body.data[0].error;
          } else {
            errorMessage = 'Código de verificación incorrecto. Por favor, intente nuevamente.';
          }
        } else if (error.status === 400) {
          // Error de validación
          if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
            errorMessage = error.error.body.data[0].error;
          } else {
            errorMessage = 'El código proporcionado no es válido. Verifique que tenga 6 dígitos.';
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
  
  onCancel() {
    this.cancelled.emit();
  }

  hideMessage() {
    this.showMessage = false;
    this.messageText = '';
  }
}