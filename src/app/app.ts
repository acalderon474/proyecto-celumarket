import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// 1. Importamos los componentes para la integración global
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Agregamos Header y Footer al arreglo de imports
  imports: [
    RouterOutlet, 
    Header, 
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // 3. Mantenemos tu señal para el título (muy moderno, ¡bien ahí!)
  protected readonly title = signal('proyecto-celumarket');
}