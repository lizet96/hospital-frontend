import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertContainerComponent } from './shared/components/alert-container/alert-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hospital-frontend';
}
