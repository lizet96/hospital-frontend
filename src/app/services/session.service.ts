import { Injectable, Inject, forwardRef } from '@angular/core';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { AuthService, User } from './auth.service';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';

export interface SessionInfo {
  user: User | null;
  loginTime: Date | null;
  lastActivity: Date | null;
  sessionDuration: number; // en minutos
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionInfoSubject = new BehaviorSubject<SessionInfo>({
    user: null,
    loginTime: null,
    lastActivity: null,
    sessionDuration: 0,
    isActive: false
  });

  public sessionInfo$ = this.sessionInfoSubject.asObservable();
  private sessionTimer: any;
  private warningTimer: any;
  private readonly SESSION_TIMEOUT = 30; // 30 minutos
  private readonly WARNING_TIME = 5; // 5 minutos antes del timeout
  private readonly STORAGE_KEY = 'hospital_session_info';

  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.initializeSession();
    this.setupActivityListeners();
  }

  private initializeSession() {
    // Esperar a que AuthService esté inicializado
    this.authService.initialized$.subscribe(initialized => {
      if (initialized) {
        // Recuperar información de sesión guardada
        this.loadSessionFromStorage();
        
        const user = this.authService.getCurrentUser();
        if (user && (!this.sessionInfoSubject.value || !this.sessionInfoSubject.value.isActive)) {
          // Solo crear sesión básica sin timers automáticos al recargar
          this.createBasicSession(user);
        }
      }
    });

    // Suscribirse a cambios en el usuario actual (login activo)
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Solo iniciar sesión completa en login activo, no en recarga
        const existingSession = this.sessionInfoSubject.value;
        if (!existingSession || !existingSession.isActive) {
          this.startSession(user);
        }
      } else {
        this.endSession();
      }
    });
  }

  private createBasicSession(user: User) {
    const now = new Date();
    const sessionInfo: SessionInfo = {
      user,
      loginTime: now,
      lastActivity: now,
      sessionDuration: 0,
      isActive: true
    };

    this.sessionInfoSubject.next(sessionInfo);
    this.saveSessionToStorage(sessionInfo);
    // No iniciar timers automáticos en recarga
  }

  private startSession(user: User) {
    const now = new Date();
    const sessionInfo: SessionInfo = {
      user,
      loginTime: now,
      lastActivity: now,
      sessionDuration: 0,
      isActive: true
    };

    this.sessionInfoSubject.next(sessionInfo);
    this.saveSessionToStorage(sessionInfo);
    this.startSessionTimer();
    
    this.alertService.success(`Bienvenido ${user.nombre} ${user.apellido}`, true, 3000);
  }

  private endSession() {
    const sessionInfo: SessionInfo = {
      user: null,
      loginTime: null,
      lastActivity: null,
      sessionDuration: 0,
      isActive: false
    };

    this.sessionInfoSubject.next(sessionInfo);
    this.clearSessionFromStorage();
    this.stopSessionTimer();
  }

  private startSessionTimer() {
    this.stopSessionTimer();

    // Timer para advertencia de sesión
    this.warningTimer = timer((this.SESSION_TIMEOUT - this.WARNING_TIME) * 60 * 1000).subscribe(() => {
      this.showSessionWarning();
    });

    // Timer para expiración de sesión
    this.sessionTimer = timer(this.SESSION_TIMEOUT * 60 * 1000).subscribe(() => {
      this.expireSession();
    });
  }

  private stopSessionTimer() {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      this.warningTimer.unsubscribe();
      this.warningTimer = null;
    }
  }

  private showSessionWarning() {
    this.alertService.warning(`Tu sesión expirará en ${this.WARNING_TIME} minutos. Realiza alguna acción para mantenerla activa.`, true, 10000);
  }

  private expireSession() {
    this.alertService.error('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.', true, 5000);

    this.logout();
  }

  private setupActivityListeners() {
    // Escuchar eventos de actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateLastActivity();
      }, true);
    });
  }

  private updateLastActivity() {
    const currentSession = this.sessionInfoSubject.value;
    if (currentSession.isActive && currentSession.user) {
      const now = new Date();
      const updatedSession: SessionInfo = {
        ...currentSession,
        lastActivity: now,
        sessionDuration: this.calculateSessionDuration(currentSession.loginTime!, now)
      };

      this.sessionInfoSubject.next(updatedSession);
      this.saveSessionToStorage(updatedSession);
      
      // Reiniciar el timer de sesión
      this.startSessionTimer();
    }
  }

  private calculateSessionDuration(loginTime: Date, currentTime: Date): number {
    return Math.floor((currentTime.getTime() - loginTime.getTime()) / (1000 * 60));
  }

  private saveSessionToStorage(sessionInfo: SessionInfo) {
    const sessionData = {
      ...sessionInfo,
      loginTime: sessionInfo.loginTime?.toISOString(),
      lastActivity: sessionInfo.lastActivity?.toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }

  private loadSessionFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        const sessionInfo: SessionInfo = {
          ...sessionData,
          loginTime: sessionData.loginTime ? new Date(sessionData.loginTime) : null,
          lastActivity: sessionData.lastActivity ? new Date(sessionData.lastActivity) : null
        };
        
        // Verificar si la sesión sigue siendo válida
        if (sessionInfo.isActive && sessionInfo.lastActivity) {
          const timeSinceLastActivity = Date.now() - sessionInfo.lastActivity.getTime();
          if (timeSinceLastActivity < this.SESSION_TIMEOUT * 60 * 1000) {
            this.sessionInfoSubject.next(sessionInfo);
            this.startSessionTimer();
          } else {
            this.clearSessionFromStorage();
          }
        }
      } catch (error) {
        this.clearSessionFromStorage();
      }
    }
  }

  private clearSessionFromStorage() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Métodos públicos
  getCurrentSession(): SessionInfo {
    return this.sessionInfoSubject.value;
  }

  extendSession(): void {
    this.updateLastActivity();
    this.alertService.info('Tu sesión ha sido extendida exitosamente.', true, 3000);
  }

  logout(): void {
    this.authService.performLogout();
    this.router.navigate(['/auth/login']);
    
    this.alertService.info('Has cerrado sesión exitosamente.', true, 3000);
  }

  getSessionDurationFormatted(): string {
    const session = this.getCurrentSession();
    if (!session.isActive || session.sessionDuration === 0) {
      return '0 min';
    }

    const hours = Math.floor(session.sessionDuration / 60);
    const minutes = session.sessionDuration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  isSessionActive(): boolean {
    return this.getCurrentSession().isActive;
  }

  getTimeUntilExpiration(): number {
    const session = this.getCurrentSession();
    if (!session.isActive || !session.lastActivity) {
      return 0;
    }

    const timeSinceLastActivity = Date.now() - session.lastActivity.getTime();
    const timeUntilExpiration = (this.SESSION_TIMEOUT * 60 * 1000) - timeSinceLastActivity;
    
    return Math.max(0, Math.floor(timeUntilExpiration / (1000 * 60)));
  }
}