import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { DashboardCardsComponent } from './components/dashboard-cards.component';
import { QuickActionsComponent } from './components/quick-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    DashboardCardsComponent,
    QuickActionsComponent
  ],
  template: `
    <div class="dashboard-layout">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <app-header></app-header>
        
        <main class="dashboard-main">
          <div class="dashboard-container">
            <div class="dashboard-welcome">
              <h1>Bienvenido al Dashboard</h1>
              <p>Gestiona eficientemente todas las operaciones del hospital</p>
            </div>
            
            <app-dashboard-cards></app-dashboard-cards>
            <app-quick-actions></app-quick-actions>
            
            <div class="dashboard-grid">
              <div class="dashboard-section">
                <h3>Actividad Reciente</h3>
                <div class="activity-placeholder">
                  <p>Próximamente: Lista de actividades recientes</p>
                </div>
              </div>
              
              <div class="dashboard-section">
                <h3>Próximas Citas</h3>
                <div class="appointments-placeholder">
                  <p>Próximamente: Lista de próximas citas</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
      background: var(--hospital-light);
    }
    
    .main-content {
      flex: 1;
      margin-left: 280px;
      transition: margin-left 0.3s ease;
      display: flex;
      flex-direction: column;
    }
    
    .dashboard-main {
      flex: 1;
      overflow-y: auto;
    }
    
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .dashboard-welcome {
      margin-bottom: 2rem;
    }
    
    .dashboard-welcome h1 {
      color: var(--hospital-dark);
      font-size: 2.5rem;
      font-weight: 300;
      margin: 0 0 0.5rem 0;
    }
    
    .dashboard-welcome p {
      color: var(--hospital-gray);
      font-size: 1.1rem;
      margin: 0;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .dashboard-section {
      background: var(--hospital-white);
      border-radius: var(--hospital-border-radius);
      box-shadow: var(--hospital-shadow);
      padding: 1.5rem;
    }
    
    .dashboard-section h3 {
      color: var(--hospital-dark);
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .activity-placeholder,
    .appointments-placeholder {
      padding: 2rem;
      text-align: center;
      color: var(--hospital-gray);
      background: var(--hospital-light);
      border-radius: var(--hospital-border-radius);
      border: 2px dashed var(--p-border-color);
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      
      .dashboard-container {
        padding: 1rem;
      }
      
      .dashboard-welcome h1 {
        font-size: 2rem;
      }
      
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class DashboardComponent {}