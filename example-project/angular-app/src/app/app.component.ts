import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentLibraryModule } from 'component-library-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ComponentLibraryModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-app';
}
