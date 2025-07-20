import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  closable: boolean;
  duration?: number; // Auto-close after milliseconds
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<AlertMessage[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addAlert(type: AlertMessage['type'], message: string, closable: boolean = true, duration?: number): void {
    const alert: AlertMessage = {
      id: this.generateId(),
      type,
      message,
      closable,
      duration
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, alert]);

    // Auto-remove after duration if specified
    if (duration) {
      setTimeout(() => {
        this.removeAlert(alert.id);
      }, duration);
    }
  }

  success(message: string, closable: boolean = true, duration?: number): void {
    this.addAlert('success', message, closable, duration);
  }

  error(message: string, closable: boolean = true, duration?: number): void {
    this.addAlert('error', message, closable, duration);
  }

  warning(message: string, closable: boolean = true, duration?: number): void {
    this.addAlert('warning', message, closable, duration);
  }

  info(message: string, closable: boolean = true, duration?: number): void {
    this.addAlert('info', message, closable, duration);
  }

  removeAlert(id: string): void {
    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next(currentAlerts.filter(alert => alert.id !== id));
  }

  clearAll(): void {
    this.alertsSubject.next([]);
  }

  // Métodos de conveniencia para operaciones CRUD comunes
  successCreate(entityName: string): void {
    this.success(`${entityName} creado correctamente`, true, 5000);
  }

  successUpdate(entityName: string): void {
    this.success(`${entityName} actualizado correctamente`, true, 5000);
  }

  successDelete(entityName: string): void {
    this.success(`${entityName} eliminado correctamente`, true, 5000);
  }

  errorCreate(entityName: string, details?: string): void {
    const message = details 
      ? `Error al crear ${entityName}: ${details}`
      : `Error al crear ${entityName}. Por favor, verifique los datos e intente nuevamente.`;
    this.error(message);
  }

  errorUpdate(entityName: string, details?: string): void {
    const message = details 
      ? `Error al actualizar ${entityName}: ${details}`
      : `Error al actualizar ${entityName}. Por favor, verifique los datos e intente nuevamente.`;
    this.error(message);
  }

  errorDelete(entityName: string, details?: string): void {
    const message = details 
      ? `Error al eliminar ${entityName}: ${details}`
      : `Error al eliminar ${entityName}. El registro puede estar siendo utilizado por otros elementos.`;
    this.error(message);
  }

  errorLoad(entityName: string, details?: string): void {
    const message = details 
      ? `Error al cargar ${entityName}: ${details}`
      : `Error al cargar ${entityName}. Por favor, recargue la página e intente nuevamente.`;
    this.error(message);
  }

  warningValidation(message: string): void {
    this.warning(`Validación: ${message}`);
  }

  infoNoData(entityName: string): void {
    this.info(`No se encontraron ${entityName} para mostrar.`, true, 3000);
  }

  // Mensajes específicos para autenticación
  authSuccess(action: string): void {
    this.success(`${action} exitoso. Bienvenido al sistema.`, true, 4000);
  }

  authError(details: string): void {
    this.error(`Error de autenticación: ${details}`);
  }

  sessionExpired(): void {
    this.warning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
  }

  permissionDenied(): void {
    this.error('No tiene permisos suficientes para realizar esta acción.');
  }

  // Mensajes para validaciones de formularios
  formValidationError(field: string, error: string): void {
    this.warning(`${field}: ${error}`);
  }

  requiredFieldsError(): void {
    this.warning('Por favor, complete todos los campos obligatorios marcados con *');
  }

  emailFormatError(): void {
    this.warning('Por favor, ingrese un email válido.');
  }

  passwordRequirementsError(): void {
    this.warning('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.');
  }

  dateFormatError(): void {
    this.warning('Por favor, seleccione una fecha válida.');
  }

  // Mensajes para operaciones de red
  networkError(): void {
    this.error('Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.');
  }

  serverError(): void {
    this.error('Error interno del servidor. Por favor, contacte al administrador del sistema.');
  }

  timeoutError(): void {
    this.error('La operación ha tardado demasiado tiempo. Por favor, intente nuevamente.');
  }
}