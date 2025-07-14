import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../services/auth.service';

interface QuickAction {
  label: string;
  icon: string;
  color: string;
  permission?: string;
  action: () => void;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <p-card header="Acciones Rápidas" styleClass="quick-actions-card">
      <div class="quick-actions-grid">
        <p-button
          *ngFor="let action of visibleActions"
          [label]="action.label"
          [icon]="action.icon"
          [style]="{'background-color': action.color, 'border-color': action.color}"
          class="quick-action-btn"
          (onClick)="action.action()">
        </p-button>
      </div>
    </p-card>
  `,
  styles: [`
    .quick-actions-card {
      margin-bottom: 2rem;
    }
    
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .quick-action-btn {
      height: 60px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .quick-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    @media (max-width: 768px) {
      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class QuickActionsComponent implements OnInit {
  actions: QuickAction[] = [];
  visibleActions: QuickAction[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.setupActions();
    this.filterVisibleActions();
  }

  private setupActions() {
    this.actions = [
      {
        label: 'Nueva Consulta',
        icon: 'pi pi-plus',
        color: '#51c3b7',
        permission: 'crear_consultas',
        action: () => this.newConsultation()
      },
      {
        label: 'Registrar Paciente',
        icon: 'pi pi-user-plus',
        color: '#1aae9d',
        permission: 'crear_pacientes',
        action: () => this.newPatient()
      },
      {
        label: 'Crear Receta',
        icon: 'pi pi-plus-circle',
        color: '#2AC96A',
        permission: 'crear_recetas',
        action: () => this.newPrescription()
      },
      {
        label: 'Ver Horarios',
        icon: 'pi pi-calendar',
        color: '#f39c12',
        permission: 'ver_horarios',
        action: () => this.viewSchedule()
      },
      {
        label: 'Generar Reporte',
        icon: 'pi pi-chart-bar',
        color: '#8e44ad',
        permission: 'crear_reportes',
        action: () => this.generateReport()
      },
      {
        label: 'Gestionar Usuarios',
        icon: 'pi pi-users',
        color: '#e74c3c',
        permission: 'gestionar_usuarios',
        action: () => this.manageUsers()
      }
    ];
  }

  private filterVisibleActions() {
    this.visibleActions = this.actions.filter(action => 
      !action.permission || this.authService.hasPermission(action.permission)
    );
  }

  private newConsultation() {
    console.log('Nueva consulta');
    // Implementar navegación
  }

  private newPatient() {
    console.log('Nuevo paciente');
    // Implementar navegación
  }

  private newPrescription() {
    console.log('Nueva receta');
    // Implementar navegación
  }

  private viewSchedule() {
    console.log('Ver horarios');
    // Implementar navegación
  }

  private generateReport() {
    console.log('Generar reporte');
    // Implementar navegación
  }

  private manageUsers() {
    console.log('Gestionar usuarios');
    // Implementar navegación
  }
}