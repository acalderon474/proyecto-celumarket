import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

// Estructura de cada opción del menú
interface NavItem {
  label: string;
  route: string;
  icon: 'home' | 'catalog' | 'contact';
}

@Component({
  selector: 'app-header',
  standalone: true,
  // RouterModule permite usar routerLink en el template
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  // Nombre visible de la marca
  brandName = 'CeluMarket';

  // Signal para abrir/cerrar el menú móvil
  menuOpen = signal(false);

  // Signal para detectar si la pantalla es móvil
  isMobile = signal(false);

  // Signal para saber cuál ruta está activa
  currentUrl = signal('');

  // Signal para mostrar la cantidad de favoritos
  favoriteCount = signal(0);

  // Evita errores cuando la app corre con SSR
  private readonly isBrowser: boolean;

  // Opciones del menú principal
  navItems: NavItem[] = [
    { label: 'Inicio', route: '/home', icon: 'home' },
    { label: 'Catálogo', route: '/catalog', icon: 'catalog' },
    { label: 'Contacto', route: '/contact', icon: 'contact' }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Escucha cambios de ruta para:
    // 1. actualizar la ruta activa
    // 2. cerrar el menú en móvil
    // 3. actualizar favoritos
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.menuOpen.set(false);
        this.loadFavoriteCount();
      });
  }

  ngOnInit(): void {
    this.currentUrl.set(this.router.url);
    this.updateScreenMode();
    this.loadFavoriteCount();
  }

  // Se ejecuta cuando cambia el tamaño de la ventana
  @HostListener('window:resize')
  onResize(): void {
    this.updateScreenMode();
  }

  // Abre o cierra el menú hamburguesa
  toggleMenu(): void {
    if (this.isMobile()) {
      this.menuOpen.update(value => !value);
    }
  }

  // Cierra el menú móvil
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  // Verifica si una ruta del menú está activa
  isActive(route: string): boolean {
    return this.currentUrl() === route;
  }

  // Verifica si la ruta activa es favoritos
  isFavoriteRoute(): boolean {
    return this.currentUrl() === '/favorites';
  }

  // Detecta si estamos en móvil
  private updateScreenMode(): void {
    if (!this.isBrowser) {
      this.isMobile.set(false);
      return;
    }

    const mobile = window.innerWidth <= 768;
    this.isMobile.set(mobile);

    // Si vuelve a escritorio, cerramos el menú desplegable
    if (!mobile) {
      this.menuOpen.set(false);
    }
  }

  // Lee favoritos desde localStorage
  private loadFavoriteCount(): void {
    if (!this.isBrowser) {
      this.favoriteCount.set(0);
      return;
    }

    const savedFavorites = localStorage.getItem('favorites');

    if (!savedFavorites) {
      this.favoriteCount.set(0);
      return;
    }

    try {
      const parsedFavorites = JSON.parse(savedFavorites);
      this.favoriteCount.set(Array.isArray(parsedFavorites) ? parsedFavorites.length : 0);
    } catch {
      this.favoriteCount.set(0);
    }
  }
}