import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'datetime-local' | 'time' | 'textarea' | 'select' | 'dropdown' | 'checkbox' | 'email' | 'password';
  required?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: any) => void;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

@Component({
  selector: 'app-base-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DialogModule, ButtonModule,
    InputTextModule, Textarea, SelectModule,
    DatePickerModule, CheckboxModule, InputNumberModule
  ],
  template: `
    <p-dialog 
      [header]="title" 
      [(visible)]="visible" 
      [modal]="true" 
      [style]="{width: '50vw', minWidth: '400px'}"
      [draggable]="false"
      [resizable]="false"
      [closable]="true"
      [closeOnEscape]="true"
      styleClass="hospital-modal"
      (onHide)="onCancel()">
      
      <ng-template pTemplate="header">
        <div class="modal-header-content">
          <i class="pi pi-file-edit modal-header-icon"></i>
          <span class="modal-header-title">{{title}}</span>
        </div>
      </ng-template>
      
      <form (ngSubmit)="onSubmit()" #form="ngForm" class="hospital-form">
        <div class="form-grid">
          <div *ngFor="let field of fields" class="form-field">
            <label [for]="field.key" class="field-label">
              {{field.label}}
              <span *ngIf="field.required" class="required-asterisk">*</span>
            </label>
            
            <ng-container [ngSwitch]="field.type">
              <!-- Text Input -->
              <input 
                *ngSwitchCase="'text'"
                pInputText 
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [placeholder]="field.placeholder"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                class="hospital-input" />
              
              <!-- Email Input -->
              <input 
                *ngSwitchCase="'email'"
                pInputText 
                type="email"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [placeholder]="field.placeholder"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                class="hospital-input" />
              
              <!-- Password Input -->
              <input 
                *ngSwitchCase="'password'"
                pInputText 
                type="password"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [placeholder]="field.placeholder"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                class="hospital-input" />
              
              <!-- Textarea -->
              <textarea 
                *ngSwitchCase="'textarea'"
                pTextarea 
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [placeholder]="field.placeholder"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                rows="3"
                class="hospital-textarea">
              </textarea>
              
              <!-- Number Input -->
              <p-inputNumber 
                *ngSwitchCase="'number'"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [min]="field.validation?.min"
                [max]="field.validation?.max"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                styleClass="hospital-number">
              </p-inputNumber>
              
              <!-- Date Input -->
              <p-datePicker 
                *ngSwitchCase="'date'"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                dateFormat="dd/mm/yy"
                [showIcon]="true"
                styleClass="hospital-calendar">
              </p-datePicker>
              
              <!-- Time Input -->
              <input 
                *ngSwitchCase="'time'"
                type="time"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                class="hospital-input" />
              
              <!-- Select/Dropdown -->
              <p-select 
                *ngSwitchCase="'select'"
                [id]="field.key"
                [(ngModel)]="formData[field.key]"
                [name]="field.key"
                [options]="field.options"
                [placeholder]="field.placeholder"
                [required]="field.required || false"
                [disabled]="field.disabled || false"
                (onChange)="field.onChange && field.onChange($event.value)"
                styleClass="hospital-dropdown">
              </p-select>
              
              <!-- Checkbox -->
              <div class="checkbox-wrapper">
                <p-checkbox 
                  *ngSwitchCase="'checkbox'"
                  [id]="field.key"
                  [(ngModel)]="formData[field.key]"
                  [name]="field.key"
                  [disabled]="field.disabled || false"
                  [binary]="true"
                  styleClass="hospital-checkbox">
                </p-checkbox>
              </div>
            </ng-container>
          </div>
        </div>
        
        <div class="form-actions">
          <p-button 
            label="Cancelar" 
            icon="pi pi-times" 
            severity="secondary"
            [text]="true"
            styleClass="hospital-btn-cancel"
            (onClick)="onCancel()">
          </p-button>
          <p-button 
            label="Guardar" 
            icon="pi pi-check" 
            type="submit"
            severity="primary"
            styleClass="hospital-btn-save"
            [disabled]="!form.valid || loading"
            [loading]="loading">
          </p-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    /* Modal personalizado */
    ::ng-deep .hospital-modal .p-dialog {
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      border: none;
    }
    
    ::ng-deep .hospital-modal .p-dialog-header {
      background: linear-gradient(135deg, var(--hospital-primary) 0%, var(--hospital-accent) 100%);
      color: white;
      border-radius: 12px 12px 0 0;
      padding: 1.5rem 2rem;
      border-bottom: none;
    }
    
    ::ng-deep .hospital-modal .p-dialog-content {
      padding: 2rem;
      background: var(--hospital-white);
    }
    
    .modal-header-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .modal-header-icon {
      font-size: 1.25rem;
      opacity: 0.9;
    }
    
    .modal-header-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }
    
    /* Formulario */
    .hospital-form {
      width: 100%;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .field-label {
      font-weight: 600;
      color: var(--hospital-dark);
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    
    .required-asterisk {
      color: var(--hospital-danger);
      margin-left: 0.25rem;
    }
    
    /* Inputs personalizados */
    ::ng-deep .hospital-input {
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .hospital-input:focus {
      border-color: var(--hospital-primary);
      box-shadow: 0 0 0 3px rgba(5, 104, 94, 0.1);
      outline: none;
    }
    
    ::ng-deep .hospital-textarea {
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      resize: vertical;
      min-height: 80px;
    }
    
    ::ng-deep .hospital-textarea:focus {
      border-color: var(--hospital-primary);
      box-shadow: 0 0 0 3px rgba(5, 104, 94, 0.1);
      outline: none;
    }
    
    /* Select personalizado */
    ::ng-deep .hospital-dropdown .p-select {
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .hospital-dropdown .p-select:not(.p-disabled):hover {
      border-color: var(--hospital-primary);
    }
    
    ::ng-deep .hospital-dropdown .p-select:not(.p-disabled).p-focus {
      border-color: var(--hospital-primary);
      box-shadow: 0 0 0 3px rgba(5, 104, 94, 0.1);
    }
    
    /* DatePicker personalizado */
    ::ng-deep .hospital-calendar .p-datepicker .p-inputtext {
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .hospital-calendar .p-datepicker .p-inputtext:focus {
      border-color: var(--hospital-primary);
      box-shadow: 0 0 0 3px rgba(5, 104, 94, 0.1);
    }
    
    /* Checkbox personalizado */
    .checkbox-wrapper {
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
    }
    
    ::ng-deep .hospital-checkbox .p-checkbox .p-checkbox-box {
      border: 2px solid #e1e5e9;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    ::ng-deep .hospital-checkbox .p-checkbox .p-checkbox-box.p-highlight {
      background: var(--hospital-primary);
      border-color: var(--hospital-primary);
    }
    
    /* Botones de acción */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e1e5e9;
      margin-top: 1rem;
    }
    
    ::ng-deep .hospital-btn-cancel {
      color: var(--hospital-gray) !important;
      border: 2px solid #e1e5e9 !important;
      background: transparent !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
    }
    
    ::ng-deep .hospital-btn-cancel:hover {
      background: #f8f9fa !important;
      border-color: var(--hospital-gray) !important;
    }
    
    ::ng-deep .hospital-btn-save {
      background: var(--hospital-primary) !important;
      border: 2px solid var(--hospital-primary) !important;
      color: white !important;
      padding: 0.75rem 1.5rem !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      transition: all 0.3s ease !important;
    }
    
    ::ng-deep .hospital-btn-save:hover:not(:disabled) {
      background: var(--hospital-accent) !important;
      border-color: var(--hospital-accent) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(5, 104, 94, 0.3);
    }
    
    ::ng-deep .hospital-btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      ::ng-deep .hospital-modal .p-dialog {
        width: 95vw !important;
        margin: 1rem;
      }
      
      ::ng-deep .hospital-modal .p-dialog-content {
        padding: 1.5rem;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      ::ng-deep .hospital-btn-cancel,
      ::ng-deep .hospital-btn-save {
        width: 100% !important;
        justify-content: center !important;
      }
    }
    
    @media (max-width: 576px) {
      ::ng-deep .hospital-modal .p-dialog {
        width: 100vw !important;
        height: 100vh !important;
        margin: 0;
        border-radius: 0 !important;
      }
      
      ::ng-deep .hospital-modal .p-dialog-header {
        border-radius: 0 !important;
      }
    }
  `]
})
export class BaseFormComponent implements OnInit {
  @Input() title: string = '';
  @Input() fields: FormField[] = [];
  @Input() formData: any = {};
  @Input() visible: boolean = false;
  @Input() loading: boolean = false;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  
  ngOnInit() {
    this.initializeFormData();
  }
  
  private initializeFormData() {
    this.fields.forEach(field => {
      if (this.formData[field.key] === undefined) {
        this.formData[field.key] = field.type === 'checkbox' ? false : '';
      }
    });
  }
  
  onSubmit() {
    if (!this.loading) {
      this.save.emit(this.formData);
    }
  }
  
  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }
}