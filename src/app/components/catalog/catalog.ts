import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';

/*
  Decorador del componente Catalog.
  Define el selector, imports, plantilla HTML y hoja de estilos.
*/
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})

/*
  Componente Catalog.
  Se encarga de cargar, buscar, filtrar y paginar
  todos los celulares disponibles del catálogo.
*/
export class Catalog implements OnInit {

  /*
    Signal reactiva que almacena el listado completo
    de productos obtenido desde el servicio.
  */
  products = signal<Product[]>([]);

  /*
    Signal reactiva para controlar el estado de carga.
  */
  loading = signal(true);

  /*
    Signal reactiva para mostrar mensajes de error.
  */
  errorMessage = signal('');

  /*
    Signal reactiva que almacena el texto ingresado
    en el buscador del catálogo.
  */
  searchTerm = signal('');

  /*
    Signal reactiva que almacena la marca seleccionada
    en el filtro. Por defecto está vacía para mostrar todas.
  */
  selectedBrand = signal('');

  /*
    Signal reactiva que controla la página actual
    de la paginación del catálogo.
  */
  currentPage = signal(1);

  /*
    Cantidad de productos por página.
    Con 20 productos se generarán 5 páginas.
  */
  readonly itemsPerPage = 4;

  /*
    Lista de marcas disponibles para el filtro.
    Se construye dinámicamente a partir de los productos.
  */
  brands = signal<string[]>([]);

  /*
    Signal reactiva que almacena los IDs
    de los productos marcados como favoritos.
  */ 
  favoriteIds = signal<number[]>([]);

  /*
    Clave centralizada para localStorage.
    Debe coincidir con Home, Favorites y Header.
  */
  private readonly storageKey = 'favorites';

  /*
    Inyectamos ActivatedRoute para poder leer la URL
    y detectar si llega el parámetro ?brand=
  */
  private route = inject(ActivatedRoute);

  /*
    Constructor del componente.
    Inyecta el servicio principal de productos.
  */
  constructor(private productService: ProductService) {}

  /*
    Método del ciclo de vida que se ejecuta al iniciar el componente.
    1. Carga todos los productos del catálogo.
    2. Carga los favoritos guardados.
    3. Escucha si la URL trae el parámetro ?brand=
  */
  ngOnInit(): void {
    this.loadProducts();
    this.loadFavorites();
  
  /* 
    Eschuchamos si la URL trae el parámetro '?brand='
    para activar automáticamente el filtro por marca.
  */
  this.route.queryParams.subscribe(params => {
    const brandFromUrl = params['brand'];
    if (brandFromUrl) {
      
      // Si viene una marca por la URL, activamos el filtro automáticamente
      this.setSelectedBrand(brandFromUrl); 
    }
  });
  }

  /*
    Carga todos los productos desde el servicio.
    También genera dinámicamente la lista de marcas.
  */
  private loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService
      .getProducts()
      .pipe(take(1))
      .subscribe({
        next: (products: Product[]) => {
          this.products.set(products);
          this.brands.set(this.extractBrands(products));
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No fue posible cargar el catálogo de celulares en este momento.'
          );
          this.loading.set(false);
        }
      });
  }

  /*
    Lee los IDs favoritos guardados en localStorage.
    Esto permite que el catálogo abra con los corazones
    correctamente marcados si el usuario ya había guardado productos.
  */
  private loadFavorites(): void {
    const storedFavorites = localStorage.getItem(this.storageKey);

    if (!storedFavorites) {
      this.favoriteIds.set([]);
      return;
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites);

      if (Array.isArray(parsedFavorites)) {
        const normalizedIds = parsedFavorites
          .map(id => Number(id))
          .filter(id => !Number.isNaN(id));

        this.favoriteIds.set(normalizedIds);
      } else {
        this.favoriteIds.set([]);
      }
    } catch {
      this.favoriteIds.set([]);
    }
  }

  /*
    Guarda los favoritos actualizados en localStorage
    y notifica a otros componentes, por ejemplo al Header,
    para que refresque el contador de favoritos.
  */
  private persistFavorites(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favoriteIds()));

    /*
      Evento personalizado para que el Header
      actualice el contador al instante.
    */
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  }

  /*
    Agrega o quita un producto de favoritos.
    Se usa desde el botón corazón dentro de cada card.
  */
  toggleFavorite(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const exists = this.favoriteIds().includes(product.id);

    const updatedIds = exists
      ? this.favoriteIds().filter(id => id !== product.id)
      : [...this.favoriteIds(), product.id];

    this.favoriteIds.set(updatedIds);
    this.persistFavorites();
  }

  /*
    Verifica si un producto ya está marcado como favorito.
    Sirve para aplicar clases activas al corazón.
  */
  isFavorite(product: Product): boolean {
    return this.favoriteIds().includes(product.id);
  }

  /*
    Extrae las marcas únicas y las ordena alfabéticamente.
  */
  private extractBrands(products: Product[]): string[] {
    return [...new Set(products.map(product => product.brand))]
      .sort((a, b) => a.localeCompare(b));
  }

  /*
    Actualiza el texto del buscador
    y reinicia la paginación a la primera página.
  */
  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  /*
    Actualiza la marca seleccionada
    y reinicia la paginación.
  */
  setSelectedBrand(value: string): void {
    this.selectedBrand.set(value);
    this.currentPage.set(1);
  }

  /*
    Limpia todos los filtros activos
    y vuelve a la primera página.
  */
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedBrand.set('');
    this.currentPage.set(1);
  }

  /*
    Filtra productos por:
    - texto de búsqueda
    - marca seleccionada
  */
  filteredProducts(): Product[] {
    const term = this.searchTerm().trim().toLowerCase();
    const brand = this.selectedBrand();

    return this.products().filter((product) => {
      const matchesBrand = !brand || product.brand === brand;

      const searchableText = [
        product.brand,
        product.model,
        product.description
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      return matchesBrand && matchesSearch;
    });
  }

  /*
    Devuelve solo los productos correspondientes
    a la página actual luego del filtrado.
  */
  paginatedProducts(): Product[] {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    return this.filteredProducts().slice(startIndex, endIndex);
  }

  /*
    Calcula el total de páginas.
  */
  totalPages(): number {
    const total = Math.ceil(this.filteredProducts().length / this.itemsPerPage);
    return total > 0 ? total : 1;
  }

  /*
    Devuelve el arreglo de páginas
    para construir la paginación.
  */
  getPages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, index) => index + 1);
  }

  /*
    Navega a una página específica.
  */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  /*
    Avanza a la siguiente página.
  */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  /*
    Regresa a la página anterior.
  */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  /*
    Indica si existen productos luego de aplicar filtros.
  */
  hasFilteredProducts(): boolean {
    return this.filteredProducts().length > 0;
  }

  /*
    Devuelve la cantidad total de productos encontrados
    después de aplicar filtros.
  */
  totalFilteredProducts(): number {
    return this.filteredProducts().length;
  }

  /*
    Devuelve el ID del producto.
  */
  getProductId(product: Product): number {
    return product.id;
  }

  /*
    Devuelve el nombre completo del producto.
  */
  getProductName(product: Product): string {
    return `${product.brand} ${product.model}`.trim();
  }

  /*
    Devuelve la marca del producto.
  */
  getProductBrand(product: Product): string {
    return product.brand;
  }

  /*
    Devuelve la imagen del producto.
  */
  getProductImage(product: Product): string {
    return product.image || 'assets/images/placeholder-phone.png';
  }

  /*
    Devuelve una descripción corta del producto
    para no saturar visualmente las cards.
  */
  getProductShortDescription(product: Product): string {
    const description =
      product.description ||
      'Consulta este smartphone en detalle y compáralo con otras opciones del catálogo.';

    return description.length > 85
      ? `${description.slice(0, 82)}...`
      : description;
  }

  /*
    Devuelve el precio del producto.
  */
  getProductPrice(product: Product): number {
    return Number(product.price) || 0;
  }

  /*
    Formatea un valor numérico en moneda COP.
  */
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}