import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, LoginRequest } from '../../../services/auth.service';
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
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="mfa-container">
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
          
          <div class="backup-codes mb-4" *ngIf="backupCodes && backupCodes.length > 0">
            <h4>Códigos de Respaldo</h4>
            <p class="text-sm text-gray-600 mb-2">Guarda estos códigos en un lugar seguro. Puedes usarlos si pierdes acceso a tu dispositivo:</p>
            <div class="backup-codes-grid">
              <span *ngFor="let code of backupCodes" class="backup-code">{{ code }}</span>
            </div>
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
  
  constructor(
    private authService: AuthService,
    private messageService: MessageService
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el código QR'
        });
      }
    }
  }
  
  onVerifyMFA() {
    if (!this.mfaCode || this.mfaCode.length !== 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Código inválido',
        detail: 'Por favor, ingresa un código de 6 dígitos'
      });
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
          this.messageService.add({
            severity: 'success',
            summary: 'Verificación exitosa',
            detail: 'Autenticación completada correctamente'
          });
          this.mfaVerified.emit(response);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Código inválido',
            detail: 'El código ingresado no es válido'
          });
        }
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Error al verificar el código';
        
        if (error.error && error.error.body && error.error.body.data && error.error.body.data.length > 0) {
          errorMessage = error.error.body.data[0].error || errorMessage;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error de verificación',
          detail: errorMessage
        });
      }
    });
  }
  
  onCancel() {
    this.cancelled.emit();
  }
}