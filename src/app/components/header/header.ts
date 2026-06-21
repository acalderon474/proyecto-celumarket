import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

/*
  Estructura de cada opción del menú principal.
  Cada elemento tiene:
  - label: texto visible
  - route: ruta a la que navega
  - icon: tipo de ícono que se mostrará en el HTML
*/
interface NavItem {
  label: string;
  route: string;
  icon: 'home' | 'catalog' | 'contact';
}

/*
  Decorador del componente Header.
  Define el selector, los módulos necesarios,
  la plantilla HTML y la hoja de estilos.
*/
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

/*
  Componente Header.
  Se encarga de mostrar la barra superior de navegación,
  controlar el menú móvil, resaltar la ruta activa,
  mostrar el contador de favoritos y mostrar el contador
  de productos agregados al carrito.
*/
export class Header implements OnInit {
  /*
    Nombre visible de la marca.
    Se muestra junto al logo del header.
  */
  brandName = 'CeluMarket';

  /*
    Signal para abrir o cerrar el menú móvil.
  */
  menuOpen = signal(false);

  /*
    Signal para identificar si la pantalla actual
    corresponde a un dispositivo móvil.
  */
  isMobile = signal(false);

  /*
    Signal que guarda la URL actual.
    Permite resaltar visualmente la opción activa del menú.
  */
  currentUrl = signal('');

  /*
    Signal que guarda la cantidad de productos favoritos.
  */
  favoriteCount = signal(0);

  /*
    Signal que guarda la cantidad total de productos
    agregados al carrito de compras.
  */
  cartCount = signal(0);

  /*
    Variable para evitar errores cuando Angular se ejecuta
    en contextos donde no existe window o localStorage,
    por ejemplo durante renderizado del lado del servidor.
  */
  private readonly isBrowser: boolean;

  /*
    Opciones principales del menú.
    El carrito y favoritos se manejan como accesos separados,
    porque tienen contador propio.
  */
  navItems: NavItem[] = [
    { label: 'Inicio', route: '/home', icon: 'home' },
    { label: 'Catálogo', route: '/catalog', icon: 'catalog' },
    { label: 'Contacto', route: '/contact', icon: 'contact' }
  ];

  /*
    Constructor del componente.
    Inyecta Router para controlar navegación y PLATFORM_ID
    para validar si la aplicación se está ejecutando en navegador.
  */
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    /*
      Escucha los cambios de ruta para:
      1. Actualizar la ruta activa.
      2. Cerrar el menú móvil.
      3. Refrescar contador de favoritos.
      4. Refrescar contador del carrito.
    */
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.menuOpen.set(false);
        this.loadFavoriteCount();
        this.loadCartCount();
      });
  }

  /*
    Método del ciclo de vida que se ejecuta al iniciar el Header.
    Inicializa la ruta actual, detecta el tamaño de pantalla
    y carga los contadores de favoritos y carrito.
  */
  ngOnInit(): void {
    this.currentUrl.set(this.router.url);
    this.updateScreenMode();
    this.loadFavoriteCount();
    this.loadCartCount();
  }

  /*
    Se ejecuta cuando cambia el tamaño de la ventana.
    Permite actualizar el comportamiento del menú móvil.
  */
  @HostListener('window:resize')
  onResize(): void {
    this.updateScreenMode();
  }

  /*
    Se ejecuta cuando otros componentes disparan el evento
    favorites-updated, por ejemplo al agregar o quitar favoritos.
  */
  @HostListener('window:favorites-updated')
  onFavoritesUpdated(): void {
    this.loadFavoriteCount();
  }

  /*
    Se ejecuta cuando otros componentes disparan el evento
    cart-updated, por ejemplo al agregar productos al carrito.
  */
  @HostListener('window:cart-updated')
  onCartUpdated(): void {
    this.loadCartCount();
  }

  /*
    Abre o cierra el menú hamburguesa.
    Solo aplica cuando la pantalla está en modo móvil.
  */
  toggleMenu(): void {
    if (this.isMobile()) {
      this.menuOpen.update(value => !value);
    }
  }

  /*
    Cierra el menú móvil.
    Se usa al hacer clic en cualquier enlace.
  */
  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /*
    Verifica si una ruta del menú principal está activa.
  */
  isActive(route: string): boolean {
    return this.currentUrl() === route;
  }

  /*
    Verifica si la ruta actual corresponde a favoritos.
  */
  isFavoriteRoute(): boolean {
    return this.currentUrl() === '/favorites';
  }

  /*
    Verifica si la ruta actual corresponde al carrito.
  */
  isCartRoute(): boolean {
    return this.currentUrl() === '/cart';
  }

  /*
    Detecta si la pantalla está en tamaño móvil.
    Si vuelve a escritorio, cierra el menú desplegable.
  */
  private updateScreenMode(): void {
    if (!this.isBrowser) {
      this.isMobile.set(false);
      return;
    }

    const mobile = window.innerWidth <= 768;
    this.isMobile.set(mobile);

    if (!mobile) {
      this.menuOpen.set(false);
    }
  }

  /*
    Lee los favoritos desde localStorage.
    Los favoritos se guardan como arreglo de IDs.
  */
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

  /*
    Lee los productos del carrito desde localStorage.
    El carrito se guarda con la clave celumarket_cart
    y cada elemento contiene producto y cantidad.
  */
  private loadCartCount(): void {
    if (!this.isBrowser) {
      this.cartCount.set(0);
      return;
    }

    const savedCart = localStorage.getItem('celumarket_cart');

    if (!savedCart) {
      this.cartCount.set(0);
      return;
    }

    try {
      const parsedCart = JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        this.cartCount.set(0);
        return;
      }

      const totalItems = parsedCart.reduce((total, item) => {
        const quantity = Number(item?.quantity) || 0;
        return total + quantity;
      }, 0);

      this.cartCount.set(totalItems);
    } catch {
      this.cartCount.set(0);
    }
  }
}