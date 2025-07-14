import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  template: `
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <img src="images/hospital-logo1.png" alt="Hospital Logo" class="header-logo">
          <h2 class="header-title">Sistema Hospitalario</h2>
        </div>
        
        <div class="header-right">
          <div class="user-info" *ngIf="currentUser">
            <span class="user-name">{{currentUser.nombre}} {{currentUser.apellido}}</span>
            <span class="user-role">{{currentUser.rol.nombre}}</span>
          </div>
          
          <p-avatar 
            [label]="getInitials()" 
            styleClass="user-avatar"
            size="large"
            shape="circle">
          </p-avatar>
          
          <p-button 
            icon="pi pi-cog" 
            [text]="true" 
            [rounded]="true"
            severity="secondary"
            (onClick)="menu.toggle($event)"
            #menuButton>
          </p-button>
          
          <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .dashboard-header {
      background: var(--hospital-white);
      border-bottom: 1px solid var(--p-border-color);
      box-shadow: var(--hospital-shadow);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .header-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    
    .header-title {
      color: var(--hospital-primary);
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-info {
      text-align: right;
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 600;
      color: var(--hospital-dark);
      font-size: 0.9rem;
    }
    
    .user-role {
      font-size: 0.8rem;
      color: var(--hospital-gray);
    }
    
    .user-avatar {
      background: var(--hospital-primary) !important;
      color: white !important;
    }
    
    @media (max-width: 768px) {
      .header-content {
        padding: 1rem;
      }
      
      .user-info {
        display: none;
      }
      
      .header-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupMenu();
    });
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    return `${this.currentUser.nombre.charAt(0)}${this.currentUser.apellido.charAt(0)}`;
  }

  private setupMenu() {
    this.menuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.goToProfile()
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.goToSettings()
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  private goToProfile() {
    // Implementar navegación al perfil
  }

  private goToSettings() {
    // Implementar navegación a configuración
  }

  private logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}