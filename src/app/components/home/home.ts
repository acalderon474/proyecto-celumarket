/* 
  Importa CommonModule para usar directivas comunes de Angular
  y isPlatformBrowser para validar si el código se está ejecutando
  en el navegador y no en renderizado del lado del servidor.
*/
import { CommonModule, isPlatformBrowser } from '@angular/common';

/* 
  Importa decoradores, utilidades y funciones base de Angular:
  - Component: define el componente
  - Inject: permite inyectar dependencias manualmente
  - OnInit: ciclo de vida al iniciar el componente
  - PLATFORM_ID: identifica la plataforma actual
  - signal: manejo reactivo de estado
*/
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';

/* 
  Importa RouterLink para permitir navegación entre rutas
  desde el template HTML del componente.
*/
import { RouterLink } from '@angular/router';

/* 
  Importa take de RxJS para tomar solo una emisión del observable
  y completar automáticamente la suscripción.
*/
import { take } from 'rxjs';

/* 
  Importa el modelo Product para tipar los datos de productos.
*/
import { Product } from '../../models/product.model';

/* 
  Importa el servicio principal que proporciona los productos.
*/
import { ProductService } from '../../services/product.service';

/* 
  Interfaz para representar visualmente cada marca destacada
  que se muestra en la página principal.
*/
interface BrandBadge {
  name: string;      /* Nombre visible de la marca */
  cssClass: string;  /* Clase CSS asociada para estilos personalizados */
}

/* 
  Interfaz para representar cada beneficio destacado
  visible en la Home.
*/
interface BenefitItem {
  title: string;        /* Título del beneficio */
  description: string;  /* Descripción breve del beneficio */
  icon: 'shield' | 'truck' | 'badge'; /* Ícono permitido */
}

/* 
  Tipo flexible para leer productos que pueden venir
  con diferentes nombres de propiedades.
*/
interface ProductFlexible {
  id?: string | number;
  productId?: string | number;
  codigo?: string | number;

  name?: string;
  nombre?: string;
  title?: string;

  brand?: string;
  marca?: string;

  model?: string;
  modelo?: string;

  image?: string;
  imagen?: string;
  imageUrl?: string;
  photo?: string;

  shortDescription?: string;
  description?: string;
  descripcion?: string;

  price?: number | string;
  precio?: number | string;
  referencePrice?: number | string;
  precioReferencia?: number | string;
}

/* 
  Decorador del componente Home.
  Define selector, imports, template y estilos.
*/
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})

/* 
  Componente Home.
  Implementa OnInit para ejecutar lógica al inicializarse.
*/
export class Home implements OnInit {

  /* 
    Signal reactiva que almacena los productos destacados.
  */
  featuredProducts = signal<Product[]>([]);

  /* 
    Signal reactiva para controlar el estado de carga.
  */
  loading = signal(true);

  /* 
    Signal reactiva para guardar un posible mensaje de error.
  */
  errorMessage = signal('');

  /* 
    Signal reactiva con los IDs de productos favoritos
    guardados en localStorage.
  */
  favoriteIds = signal<Array<string | number>>([]);

  /* 
    Variable privada para validar si el código está corriendo
    en navegador, evitando errores con localStorage en SSR.
  */
  private readonly isBrowser: boolean;

  /* 
    Marcas visibles en la página principal,
    de acuerdo con el mockup del proyecto.
  */
  brands: BrandBadge[] = [
    { name: 'Samsung', cssClass: 'samsung' },
    { name: 'Apple', cssClass: 'apple' },
    { name: 'Motorola', cssClass: 'motorola' },
    { name: 'Xiaomi', cssClass: 'xiaomi' }
  ];

  /* 
    Beneficios destacados que se muestran debajo
    de la sección de marcas.
  */
  benefits: BenefitItem[] = [
    {
      title: 'Garantía Oficial',
      description: 'Todos nuestros celulares cuentan con garantía oficial de la marca.',
      icon: 'shield'
    },
    {
      title: 'Envío Gratis',
      description: 'Envío sin costo en compras mayores a $1.000.000 COP.',
      icon: 'truck'
    },
    {
      title: 'Mejor Precio',
      description: 'Garantizamos los mejores precios del mercado.',
      icon: 'badge'
    }
  ];

  /* 
    Constructor del componente.
    Inyecta el servicio de productos y el identificador de plataforma.
  */
  constructor(
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    /* 
      Determina si la ejecución se realiza en navegador.
    */
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /* 
    Método del ciclo de vida que se ejecuta al iniciar el componente.
    Carga productos destacados y favoritos.
  */
  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadFavorites();
  }

  /* 
    Carga los productos destacados desde el servicio principal.
  */
  private loadFeaturedProducts(): void {
    this.loading.set(true);       /* Activa estado de carga */
    this.errorMessage.set('');    /* Limpia errores anteriores */

    this.productService
      .getFeaturedProducts()
      .pipe(take(1)) /* Toma solo una respuesta del observable */
      .subscribe({
        next: (products: Product[]) => {
          /* 
            Limita a 6 productos para que la Home
            no se vea sobrecargada.
          */
          this.featuredProducts.set(products.slice(0, 6));
          this.loading.set(false); /* Finaliza estado de carga */
        },
        error: () => {
          /* 
            Muestra mensaje de error si falla la carga.
          */
          this.errorMessage.set(
            'No fue posible cargar los productos destacados en este momento.'
          );
          this.loading.set(false); /* Finaliza estado de carga */
        }
      });
  }

  /* 
    Lee los favoritos guardados en localStorage.
  */
  private loadFavorites(): void {
    /* 
      Si no está en navegador, no intenta acceder a localStorage.
    */
    if (!this.isBrowser) {
      this.favoriteIds.set([]);
      return;
    }

    /* 
      Obtiene los favoritos almacenados.
    */
    const storedFavorites = localStorage.getItem('favorites');

    /* 
      Si no hay favoritos guardados, deja el arreglo vacío.
    */
    if (!storedFavorites) {
      this.favoriteIds.set([]);
      return;
    }

    try {
      /* 
        Convierte el texto almacenado en arreglo.
      */
      const parsedFavorites = JSON.parse(storedFavorites);

      /* 
        Valida que realmente sea un arreglo antes de asignarlo.
      */
      this.favoriteIds.set(Array.isArray(parsedFavorites) ? parsedFavorites : []);
    } catch {
      /* 
        Si el JSON está corrupto o inválido, reinicia favoritos.
      */
      this.favoriteIds.set([]);
    }
  }

  /* 
    Agrega o quita un producto de favoritos.
    También evita que el clic active navegación no deseada.
  */
  toggleFavorite(product: Product, event: Event): void {
    event.preventDefault(); /* Evita navegación por defecto */
    event.stopPropagation(); /* Evita propagación del evento */

    const productId = this.getProductId(product);
    const favorites = [...this.favoriteIds()];
    const exists = favorites.includes(productId);

    /* 
      Si ya existe, lo elimina.
      Si no existe, lo agrega.
    */
    const updatedFavorites = exists
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];

    /* 
      Actualiza el estado reactivo.
    */
    this.favoriteIds.set(updatedFavorites);

    /* 
      Guarda en localStorage si está en navegador.
    */
    if (this.isBrowser) {
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  }

  /* 
    Verifica si un producto está marcado como favorito.
  */
  isFavorite(product: Product): boolean {
    return this.favoriteIds().includes(this.getProductId(product));
  }

  /* 
    Obtiene el ID del producto de manera flexible,
    soportando diferentes nombres de propiedad.
  */
  getProductId(product: Product): string | number {
    const item = product as ProductFlexible;

    return (
      item.id ??
      item.productId ??
      item.codigo ??
      this.getProductName(product)
    );
  }

  /* 
    Obtiene el nombre completo del producto.
    Primero intenta un nombre directo; si no existe,
    construye uno a partir de marca y modelo.
  */
  getProductName(product: Product): string {
    const item = product as ProductFlexible;

    const directName =
      item.name ||
      item.nombre ||
      item.title;

    if (directName) {
      return directName;
    }

    const brand = item.brand || item.marca || '';
    const model = item.model || item.modelo || '';

    return `${brand} ${model}`.trim() || 'Celular destacado';
  }

  /* 
    Obtiene la marca del producto.
    Si no existe, devuelve un valor por defecto.
  */
  getProductBrand(product: Product): string {
    const item = product as ProductFlexible;

    return item.brand || item.marca || 'Marca';
  }

  /* 
    Obtiene la ruta de imagen del producto.
    Soporta distintos nombres de propiedad y un placeholder por defecto.
  */
  getProductImage(product: Product): string {
    const item = product as ProductFlexible;

    return (
      item.image ||
      item.imagen ||
      item.imageUrl ||
      item.photo ||
      'assets/images/placeholder-phone.png'
    );
  }

  /* 
    Obtiene una descripción corta del producto.
    Si la descripción es muy larga, la recorta.
  */
  getProductShortDescription(product: Product): string {
    const item = product as ProductFlexible;

    const description =
      item.shortDescription ||
      item.description ||
      item.descripcion ||
      'Descubre este smartphone con excelente rendimiento y gran diseño.';

    return description.length > 70
      ? `${description.slice(0, 67)}...`
      : description;
  }

  /* 
    Obtiene el precio numérico del producto.
    Soporta distintos nombres de propiedad.
  */
  getProductPrice(product: Product): number {
    const item = product as ProductFlexible;

    const price =
      item.price ??
      item.precio ??
      item.referencePrice ??
      item.precioReferencia ??
      0;

    return Number(price) || 0;
  }

  /* 
    Formatea un valor numérico al formato de moneda COP.
  */
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}