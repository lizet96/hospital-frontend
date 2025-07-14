import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService, User } from '../../services/auth.service';
import { PermissionsService } from '../../services/permissions.service';
import { PrimeIcons } from 'primeng/api';

interface MenuItem {
  label: string;
  icon: string;
  view: string;
  permission?: string;
  children?: MenuItem[];
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <p-button 
          icon="pi pi-bars" 
          [text]="true" 
          [rounded]="true"
          (onClick)="toggleSidebar()"
          class="toggle-btn">
        </p-button>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of menuItems" class="nav-item">
            <a 
              *ngIf="hasPermission(item.permission)"
              [class]="'nav-link ' + (item.active ? 'active' : '')"
              (click)="selectItem(item)">
              <i [class]="item.icon"></i>
              <span class="nav-text" *ngIf="!isCollapsed">{{item.label}}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      background: var(--hospital-white);
      border-right: 1px solid var(--p-border-color);
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      width: 280px;
      transition: width 0.3s ease;
      z-index: 999;
      box-shadow: 2px 0 4px rgba(0,0,0,0.1);
    }
    
    .sidebar.collapsed {
      width: 70px;
    }
    
    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid var(--p-border-color);
      display: flex;
      justify-content: flex-end;
    }
    
    .toggle-btn {
      color: var(--hospital-primary) !important;
    }
    
    .sidebar-nav {
      padding: 1rem 0;
    }
    
    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-item {
      margin-bottom: 0.5rem;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: var(--hospital-dark);
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border-radius: 0 25px 25px 0;
      margin-right: 1rem;
    }
    
    .nav-link:hover {
      background: var(--hospital-light);
      color: var(--hospital-primary);
    }
    
    .nav-link.active {
      background: var(--hospital-primary);
      color: white;
    }
    
    .nav-link i {
      font-size: 1.2rem;
      width: 24px;
      text-align: center;
    }
    
    .nav-text {
      margin-left: 1rem;
      font-weight: 500;
    }
    
    .collapsed .nav-link {
      justify-content: center;
      margin-right: 0;
      border-radius: 8px;
      margin: 0.25rem;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Output() menuItemSelected = new EventEmitter<string>();
  
  isCollapsed = false;
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.setupMenuItems();
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this.permissionsService.hasPermission(permission);
  }

  canAccessResource(resource: string): boolean {
    return this.permissionsService.canRead(resource);
  }

  selectItem(item: MenuItem) {
    // Desactivar todos los items
    this.menuItems.forEach(menuItem => menuItem.active = false);
    // Activar el item seleccionado
    item.active = true;
    
    // Emitir el evento y navegar
    this.menuItemSelected.emit(item.view);
    this.router.navigate(['/main', item.view]);
  }

  private setupMenuItems() {
    const allMenuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        view: 'dashboard',
        active: true
      },
      {
        label: 'Gestión de Usuarios',
        icon: 'pi pi-users',
        view: 'usuarios',
        permission: 'usuarios_read'
      },
      {
        label: 'Pacientes',
        icon: 'pi pi-user',
        view: 'pacientes',
        permission: 'usuarios_read' // Los pacientes son usuarios con rol específico
      },
      {
        label: 'Consultas',
        icon: 'pi pi-calendar',
        view: 'consultas',
        permission: 'consultas_read'
      },
      {
        label: 'Expedientes',
        icon: 'pi pi-folder-open',
        view: 'expedientes',
        permission: 'expedientes_read'
      },
      {
        label: 'Horarios',
        icon: 'pi pi-calendar',
        view: 'horarios',
        permission: 'horarios_read'
      },
      {
        label: 'Consultorios',
        icon: 'pi pi-building',
        view: 'consultorios',
        permission: 'consultorios_read'
      },
      {
        label: 'Recetas',
        icon: 'pi pi-file-edit',
        view: 'recetas',
        permission: 'recetas_read'
      },
      {
        label: 'Reportes',
        icon: 'pi pi-chart-bar',
        view: 'reportes',
        permission: 'reportes_read'
      }
    ];

    // Filtrar elementos del menú basándose en permisos
    this.menuItems = allMenuItems.filter(item => 
      !item.permission || this.hasPermission(item.permission)
    );
  }
}