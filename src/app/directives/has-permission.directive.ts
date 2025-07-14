import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../services/permissions.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private permission: string = '';
  private resource: string = '';
  private action: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  @Input() set appHasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  @Input() set appHasPermissionResource(resource: string) {
    this.resource = resource;
    this.updateView();
  }

  @Input() set appHasPermissionAction(action: string) {
    this.action = action;
    this.updateView();
  }

  ngOnInit() {
    // Escuchar cambios en los permisos del usuario
    this.permissionsService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    let hasPermission = false;

    // Verificar por nombre de permiso específico
    if (this.permission) {
      hasPermission = this.permissionsService.hasPermission(this.permission);
    }
    // Verificar por recurso y acción
    else if (this.resource && this.action) {
      hasPermission = this.permissionsService.canPerformAction(this.resource, this.action);
    }
    // Verificar solo por recurso (asume acción 'read')
    else if (this.resource) {
      hasPermission = this.permissionsService.canRead(this.resource);
    }

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva para mostrar elementos solo si el usuario puede leer un recurso
 */
@Directive({
  selector: '[appCanRead]',
  standalone: true
})
export class CanReadDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private resource: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  @Input() set appCanRead(resource: string) {
    this.resource = resource;
    this.updateView();
  }

  ngOnInit() {
    this.permissionsService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const canRead = this.permissionsService.canRead(this.resource);

    if (canRead && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!canRead && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva para mostrar elementos solo si el usuario puede crear un recurso
 */
@Directive({
  selector: '[appCanCreate]',
  standalone: true
})
export class CanCreateDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private resource: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  @Input() set appCanCreate(resource: string) {
    this.resource = resource;
    this.updateView();
  }

  ngOnInit() {
    this.permissionsService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const canCreate = this.permissionsService.canCreate(this.resource);

    if (canCreate && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!canCreate && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva para mostrar elementos solo si el usuario puede actualizar un recurso
 */
@Directive({
  selector: '[appCanUpdate]',
  standalone: true
})
export class CanUpdateDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private resource: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  @Input() set appCanUpdate(resource: string) {
    this.resource = resource;
    this.updateView();
  }

  ngOnInit() {
    this.permissionsService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const canUpdate = this.permissionsService.canUpdate(this.resource);

    if (canUpdate && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!canUpdate && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Directiva para mostrar elementos solo si el usuario puede eliminar un recurso
 */
@Directive({
  selector: '[appCanDelete]',
  standalone: true
})
export class CanDeleteDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;
  private resource: string = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {}

  @Input() set appCanDelete(resource: string) {
    this.resource = resource;
    this.updateView();
  }

  ngOnInit() {
    this.permissionsService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const canDelete = this.permissionsService.canDelete(this.resource);

    if (canDelete && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!canDelete && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}