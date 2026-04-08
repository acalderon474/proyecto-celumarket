import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Importamos los componentes globales que se mostrarán
// en toda la aplicación: Header arriba y Footer abajo.
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,

  // Aquí registramos los elementos que este componente raíz utilizará.
  // RouterOutlet permite cargar las vistas según la ruta actual.
  // Header y Footer se integran de forma global.
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Señal base del proyecto.
  // Puedes mantenerla porque no genera conflicto con nada
  // y además ya hace parte de tu estructura inicial.
  protected readonly title = signal('proyecto-celumarket');
}