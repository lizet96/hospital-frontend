import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService, AlertMessage } from '../../../services/alert.service';
import { CustomAlertComponent } from '../custom-alert/custom-alert.component';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [CommonModule, CustomAlertComponent],
  template: `
    <div class="alert-container">
      <app-custom-alert
        *ngFor="let alert of alerts; trackBy: trackByAlertId"
        [show]="true"
        [type]="alert.type"
        [message]="alert.message"
        [closable]="alert.closable"
        (close)="removeAlert(alert.id)"
        class="alert-item">
      </app-custom-alert>
    </div>
  `,
  styles: [`
    .alert-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      width: 100%;
    }

    .alert-item {
      margin-bottom: 10px;
    }

    @media (max-width: 768px) {
      .alert-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class AlertContainerComponent implements OnInit, OnDestroy {
  alerts: AlertMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.alertService.alerts$.subscribe(alerts => {
        this.alerts = alerts;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeAlert(id: string): void {
    this.alertService.removeAlert(id);
  }

  trackByAlertId(index: number, alert: AlertMessage): string {
    return alert.id;
  }
}