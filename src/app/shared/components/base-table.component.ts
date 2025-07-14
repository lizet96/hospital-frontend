import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../services/auth.service';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'boolean' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

export interface TableAction {
  label: string;
  icon: string;
  permission?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'danger';
  action: (item: any) => void;
}

@Component({
  selector: 'app-base-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, DropdownModule, TooltipModule],
  template: `
    <div class="table-container">
      <div class="table-header">
        <h3>{{title}}</h3>
        <div class="table-actions">
          <p-button
            *ngIf="canCreate"
            label="Nuevo {{entityName}}"
            icon="pi pi-plus"
            (onClick)="onCreate.emit()"
            severity="primary">
          </p-button>
        </div>
      </div>
      
      <p-table 
        [value]="data" 
        [columns]="columns"
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        [globalFilterFields]="getFilterFields()"
        #dt>
        
        <ng-template pTemplate="caption">
          <div class="table-caption">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input 
                pInputText 
                type="text" 
                (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                placeholder="Buscar..." />
            </span>
          </div>
        </ng-template>
        
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngFor="let col of columns" [pSortableColumn]="col.sortable ? col.field : null">
              {{col.header}}
              <p-sortIcon *ngIf="col.sortable" [field]="col.field"></p-sortIcon>
            </th>
            <th *ngIf="hasActions()">Acciones</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-item let-columns="columns">
          <tr>
            <td *ngFor="let col of columns">
              <ng-container [ngSwitch]="col.type">
                <span *ngSwitchCase="'date'">{{formatDate(item[col.field])}}</span>
                <span *ngSwitchCase="'boolean'">{{item[col.field] ? 'Sí' : 'No'}}</span>
                <span *ngSwitchDefault>{{item[col.field]}}</span>
              </ng-container>
            </td>
            <td *ngIf="hasActions()">
              <div class="action-buttons">
                <p-button
                  *ngFor="let action of getVisibleActions()"
                  [icon]="action.icon"
                  [severity]="action.severity || 'secondary'"
                  [text]="true"
                  [rounded]="true"
                  [pTooltip]="action.label"
                  (onClick)="action.action(item)">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .table-container {
      background: var(--hospital-white);
      border-radius: var(--hospital-border-radius);
      box-shadow: var(--hospital-shadow);
      padding: 1.5rem;
    }
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .table-header h3 {
      color: var(--hospital-dark);
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .table-caption {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .table-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }
    }
  `]
})
export class BaseTableComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() entityName: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() createPermission?: string;
  @Input() canCreate = false;
  @Input() loading = false;
  
  @Output() onCreate = new EventEmitter<void>();
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Only set canCreate based on permissions if it wasn't explicitly provided as input
    if (this.canCreate === false && this.createPermission) {
      this.canCreate = this.authService.hasPermission(this.createPermission);
    } else if (this.canCreate === false && !this.createPermission) {
      this.canCreate = true; // Default to true if no permission specified
    }
    console.log('BaseTable ngOnInit - data:', this.data);
    console.log('BaseTable ngOnInit - columns:', this.columns);
  }

  ngOnChanges() {
    console.log('BaseTable ngOnChanges - data:', this.data);
    console.log('BaseTable ngOnChanges - data length:', this.data?.length);
  }
  
  getFilterFields(): string[] {
    return this.columns.filter(col => col.filterable !== false).map(col => col.field);
  }
  
  hasActions(): boolean {
    return this.getVisibleActions().length > 0;
  }
  
  getVisibleActions(): TableAction[] {
    return this.actions.filter(action => 
      !action.permission || this.authService.hasPermission(action.permission)
    );
  }
  
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES');
  }
}