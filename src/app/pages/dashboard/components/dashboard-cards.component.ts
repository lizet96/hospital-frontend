import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../services/auth.service';

interface DashboardCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  permission?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

@Component({
  selector: 'app-dashboard-cards',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="dashboard-cards">
      <div 
        *ngFor="let card of visibleCards" 
        class="dashboard-card"
        [style.border-left-color]="card.color">
        <div class="card-content">
          <div class="card-info">
            <h3 class="card-title">{{card.title}}</h3>
            <p class="card-value">{{card.value}}</p>
            <div *ngIf="card.trend" class="card-trend" [class.positive]="card.trend.isPositive">
              <i [class]="card.trend.isPositive ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
              <span>{{card.trend.value}}%</span>
            </div>
          </div>
          <div class="card-icon" [style.background-color]="card.color + '20'">
            <i [class]="card.icon" [style.color]="card.color"></i>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .dashboard-card {
      background: var(--hospital-white);
      border-radius: var(--hospital-border-radius);
      box-shadow: var(--hospital-shadow);
      border-left: 4px solid;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .dashboard-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    
    .card-content {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-info {
      flex: 1;
    }
    
    .card-title {
      font-size: 0.9rem;
      color: var(--hospital-gray);
      margin: 0 0 0.5rem 0;
      font-weight: 500;
    }
    
    .card-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--hospital-dark);
      margin: 0 0 0.5rem 0;
    }
    
    .card-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .card-trend.positive {
      color: var(--hospital-success);
    }
    
    .card-trend:not(.positive) {
      color: var(--hospital-danger);
    }
    
    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card-icon i {
      font-size: 1.8rem;
    }
    
    @media (max-width: 768px) {
      .dashboard-cards {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .card-content {
        padding: 1rem;
      }
      
      .card-value {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardCardsComponent implements OnInit {
  cards: DashboardCard[] = [];
  visibleCards: DashboardCard[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.setupCards();
    this.filterVisibleCards();
  }

  private setupCards() {
    this.cards = [
      {
        title: 'Pacientes Totales',
        value: '1,234',
        icon: 'pi pi-users',
        color: '#2c5aa0',
        permission: 'ver_pacientes',
        trend: { value: 12, isPositive: true }
      },
      {
        title: 'Consultas Hoy',
        value: '45',
        icon: 'pi pi-calendar',
        color: '#1aae9d',
        permission: 'ver_consultas',
        trend: { value: 8, isPositive: true }
      },
      {
        title: 'Citas Pendientes',
        value: '23',
        icon: 'pi pi-clock',
        color: '#f39c12',
        permission: 'ver_consultas'
      },
      {
        title: 'Expedientes Nuevos',
        value: '12',
        icon: 'pi pi-folder-open',
        color: '#27ae60',
        permission: 'ver_expedientes',
        trend: { value: 5, isPositive: false }
      },
      {
        title: 'Recetas Emitidas',
        value: '89',
        icon: 'pi pi-file-edit',
        color: '#8e44ad',
        permission: 'ver_recetas'
      },
      {
        title: 'Usuarios Activos',
        value: '156',
        icon: 'pi pi-user-plus',
        color: '#e74c3c',
        permission: 'gestionar_usuarios'
      }
    ];
  }

  private filterVisibleCards() {
    this.visibleCards = this.cards.filter(card => 
      !card.permission || this.authService.hasPermission(card.permission)
    );
  }
}