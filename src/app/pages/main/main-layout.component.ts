import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { DashboardCardsComponent } from '../dashboard/components/dashboard-cards.component';
import { QuickActionsComponent } from '../dashboard/components/quick-actions.component';
import { UsuariosCrudComponent } from '../crud/usuarios/usuarios-crud.component';
import { ConsultasCrudComponent } from '../crud/consultas/consultas-crud.component';
import { ExpedientesCrudComponent } from '../crud/expedientes/expedientes-crud.component';
import { HorariosCrudComponent } from '../crud/horarios/horarios-crud.component';
import { ConsultoriosCrudComponent } from '../crud/consultorios/consultorios-crud.component';
import { PacientesCrudComponent } from '../crud/pacientes/pacientes-crud.component';
import { RecetasCrudComponent } from '../crud/recetas/recetas-crud.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    DashboardCardsComponent,
    QuickActionsComponent,
    UsuariosCrudComponent,
    ConsultasCrudComponent,
    ExpedientesCrudComponent,
    HorariosCrudComponent,
    ConsultoriosCrudComponent,
    PacientesCrudComponent,
    RecetasCrudComponent  // ✅ Agregar esta línea
  ],
  template: `
    <div class="main-layout">
      <app-sidebar (menuItemSelected)="onMenuItemSelected($event)"></app-sidebar>
      
      <div class="main-content">
        <app-header></app-header>
        
        <main class="content-area">
          <div class="content-container">
            <!-- Dashboard Content -->
            <div *ngIf="currentView === 'dashboard'" class="dashboard-content">
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
            
            <!-- CRUD Components -->
            <app-usuarios-crud *ngIf="currentView === 'usuarios'"></app-usuarios-crud>
            <app-consultas-crud *ngIf="currentView === 'consultas'"></app-consultas-crud>
            <app-expedientes-crud *ngIf="currentView === 'expedientes'"></app-expedientes-crud>
            <app-horarios-crud *ngIf="currentView === 'horarios'"></app-horarios-crud>
            <app-consultorios-crud *ngIf="currentView === 'consultorios'"></app-consultorios-crud>
            <app-pacientes-crud *ngIf="currentView === 'pacientes'"></app-pacientes-crud>
            <app-recetas-crud *ngIf="currentView === 'recetas'"></app-recetas-crud>  <!-- ✅ Agregar esta línea -->
            
            <!-- Placeholder para Reportes -->
            <div *ngIf="currentView === 'reportes'" class="crud-placeholder">
              <h2>Reportes</h2>
              <p>Próximamente: Sistema de Reportes</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout {
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
    
    .content-area {
      flex: 1;
      overflow-y: auto;
    }
    
    .content-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .dashboard-content .dashboard-welcome {
      margin-bottom: 2rem;
    }
    
    .dashboard-content .dashboard-welcome h1 {
      color: var(--hospital-dark);
      font-size: 2.5rem;
      font-weight: 300;
      margin: 0 0 0.5rem 0;
    }
    
    .dashboard-content .dashboard-welcome p {
      color: var(--hospital-gray);
      font-size: 1.1rem;
      margin: 0;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 2rem;
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
    
    .crud-placeholder {
      background: var(--hospital-white);
      border-radius: var(--hospital-border-radius);
      box-shadow: var(--hospital-shadow);
      padding: 3rem;
      text-align: center;
    }
    
    .crud-placeholder h2 {
      color: var(--hospital-primary);
      margin-bottom: 1rem;
    }
    
    .crud-placeholder p {
      color: var(--hospital-gray);
      font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      
      .content-container {
        padding: 1rem;
      }
      
      .dashboard-content .dashboard-welcome h1 {
        font-size: 2rem;
      }
      
      .dashboard-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentView: string = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit() {
    // Escuchar cambios de ruta para actualizar la vista
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCurrentView(event.url);
    });
    
    // Establecer vista inicial
    this.updateCurrentView(this.router.url);
  }

  onMenuItemSelected(view: string) {
    this.currentView = view;
  }

  private updateCurrentView(url: string) {
    if (url.includes('/main/usuarios')) {
      this.currentView = 'usuarios';
    } else if (url.includes('/main/consultas')) {
      this.currentView = 'consultas';
    } else if (url.includes('/main/expedientes')) {
      this.currentView = 'expedientes';
    } else if (url.includes('/main/horarios')) {
      this.currentView = 'horarios';
    } else if (url.includes('/main/consultorios')) {
      this.currentView = 'consultorios';
    } else if (url.includes('/main/pacientes')) {
      this.currentView = 'pacientes';
    } else if (url.includes('/main/recetas')) {  // ✅ Agregar esta condición
      this.currentView = 'recetas';
    } else if (url.includes('/main/reportes')) {
      this.currentView = 'reportes';
    } else {
      this.currentView = 'dashboard';
    }
  }
}