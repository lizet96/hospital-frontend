import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-custom-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="custom-alert" [ngClass]="'alert-' + type" [@slideIn]>
      <div class="alert-content">
        <div class="alert-icon">
          <i [class]="getIconClass()"></i>
        </div>
        <div class="alert-message">
          {{ message }}
        </div>
        <button *ngIf="closable" class="alert-close" (click)="onClose()">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./custom-alert.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class CustomAlertComponent {
  @Input() show: boolean = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message: string = '';
  @Input() closable: boolean = true;
  @Output() close = new EventEmitter<void>();

  getIconClass(): string {
    const iconMap = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle'
    };
    return iconMap[this.type];
  }

  onClose() {
    this.show = false;
    this.close.emit();
  }
}