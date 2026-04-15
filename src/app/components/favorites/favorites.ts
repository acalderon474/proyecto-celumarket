/* 
  Importa isPlatformBrowser desde Angular Common.
  Esta función permite validar si el código se está ejecutando
  realmente en el navegador y no en SSR.
*/
import { isPlatformBrowser } from '@angular/common';

/* 
  Importa elementos principales de Angular:
  - Component: define el componente
  - Inject: permite inyectar dependencias manualmente
  - OnInit: interfaz del ciclo de vida al iniciar el componente
  - PLATFORM_ID: identifica la plataforma actual
  - signal: manejo reactivo del estado
*/
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal
} from '@angular/core';

/* 
  Importa RouterLink para poder navegar desde el HTML
  hacia otras rutas del proyecto.
*/
import { RouterLink } from '@angular/router';

/* 
  Importa take de RxJS para tomar una sola emisión
  del observable y completar la suscripción.
*/
import { take } from 'rxjs';

/* 
  Importa el modelo Product para tipar correctamente
  los productos que maneja este componente.
*/
import { Product } from '../../models/product.model';

/* 
  Importa el servicio de productos,
  desde donde se consultan todos los celulares del catálogo.
*/
import { ProductService } from '../../services/product.service';

/* 
  Decorador del componente Favorites.
  Define:
  - selector: nombre del componente
  - standalone: indica que es un componente independiente
  - imports: módulos o directivas necesarias en su template
  - templateUrl: archivo HTML asociado
  - styleUrl: archivo CSS asociado
*/
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})

/* 
  Componente Favorites.
  Implementa OnInit para ejecutar lógica de inicialización
  cuando el componente se carga.
*/
export class Favorites implements OnInit {

  /* 
    Signal reactiva que guarda la lista final de productos favoritos
    que se mostrarán en pantalla.
    
    Aquí no se guardan solo IDs, sino los objetos Product completos
    después de filtrarlos desde el catálogo general.
  */
  favoriteProducts = signal<Product[]>([]);

  /* 
    Signal reactiva que guarda únicamente los IDs de productos favoritos,
    tal como vienen almacenados en localStorage.
    
    Se usa como base para luego buscar los productos completos.
  */
  favoriteIds = signal<Array<string | number>>([]);

  /* 
    Signal reactiva para controlar el estado de carga de la vista.
    Sirve para mostrar mensajes como "Cargando favoritos...".
  */
  loading = signal(true);

  /* 
    Signal reactiva para almacenar un posible mensaje de error.
    Si ocurre una falla al cargar productos, se muestra este texto.
  */
  errorMessage = signal('');

  /* 
    Clave centralizada para localStorage.
    Se define en una constante privada para evitar repetir
    el string 'favorites' en varias partes del código.
  */
  private readonly storageKey = 'favorites';

  /* 
    Variable privada que indica si el código corre en navegador.
    Esto es importante porque localStorage y window no existen en SSR.
  */
  private readonly isBrowser: boolean;

  /* 
    Constructor del componente.
    
    Inyecta:
    - productService: servicio principal para consultar productos
    - platformId: identificador de plataforma para saber si estamos en browser
  */
  constructor(
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    /* 
      Determina si la ejecución actual es en navegador.
      Si no lo es, evitamos acceder a localStorage o window.
    */
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /* 
    Método del ciclo de vida de Angular.
    Se ejecuta una vez cuando el componente inicia.
    
    Primero carga los IDs favoritos desde localStorage
    y luego consulta los productos completos correspondientes.
  */
  ngOnInit(): void {
    this.loadFavoriteIds();
    this.loadFavoriteProducts();
  }

  /* 
    Lee desde localStorage el arreglo de IDs favoritos.
    
    Este método:
    1. Verifica si estamos en navegador
    2. Busca la clave 'favorites' en localStorage
    3. Convierte el JSON a arreglo
    4. Guarda el resultado en la signal favoriteIds
  */
  private loadFavoriteIds(): void {

    /* 
      Si no estamos en navegador, no intentamos usar localStorage
      porque eso rompería la ejecución en SSR.
    */
    if (!this.isBrowser) {
      this.favoriteIds.set([]);
      return;
    }

    /* 
      Lee el contenido almacenado bajo la clave 'favorites'.
    */
    const storedFavorites = localStorage.getItem(this.storageKey);

    /* 
      Si no existe nada guardado, simplemente dejamos
      la lista de IDs favoritos vacía.
    */
    if (!storedFavorites) {
      this.favoriteIds.set([]);
      return;
    }

    try {
      /* 
        Intenta convertir el contenido del localStorage desde JSON.
      */
      const parsedFavorites = JSON.parse(storedFavorites);

      /* 
        Valida que el resultado realmente sea un arreglo.
        Si lo es, lo guarda; si no, asigna un arreglo vacío.
      */
      this.favoriteIds.set(Array.isArray(parsedFavorites) ? parsedFavorites : []);
    } catch {
      /* 
        Si el JSON está corrupto o no se puede convertir,
        se limpia el estado para evitar errores.
      */
      this.favoriteIds.set([]);
    }
  }

  /* 
    Consulta todos los productos del servicio
    y filtra únicamente aquellos que estén marcados como favoritos.
    
    Este método llena la signal favoriteProducts,
    que es la que realmente se pinta en la vista.
  */
  private loadFavoriteProducts(): void {

    /* 
      Activa el estado de carga
      y limpia cualquier mensaje de error previo.
    */
    this.loading.set(true);
    this.errorMessage.set('');

    /* 
      Si no hay favoritos guardados, no tiene sentido llamar al servicio.
      En ese caso:
      - la lista visual queda vacía
      - se desactiva loading
      - se termina el método
    */
    if (this.favoriteIds().length === 0) {
      this.favoriteProducts.set([]);
      this.loading.set(false);
      return;
    }

    /* 
      Consulta todos los productos del catálogo.
      Luego toma solo una emisión y filtra los favoritos.
    */
    this.productService
      .getProducts()
      .pipe(take(1))
      .subscribe({
        next: (products: Product[]) => {

          /* 
            Convierte los IDs favoritos a Set para hacer búsquedas
            más rápidas y uniformes.
            
            Se convierten a string para evitar problemas
            cuando unos IDs son number y otros string.
          */
          const favoriteIdSet = new Set(
            this.favoriteIds().map(id => String(id))
          );

          /* 
            Filtra únicamente los productos cuyo ID esté presente
            en la lista de favoritos guardados.
          */
          const filteredProducts = products.filter(product =>
            favoriteIdSet.has(String(this.getProductId(product)))
          );

          /* 
            Guarda en la signal solo los productos favoritos
            que realmente existen dentro del catálogo.
          */
          this.favoriteProducts.set(filteredProducts);

          /* 
            Finaliza el estado de carga.
          */
          this.loading.set(false);
        },
        error: () => {

          /* 
            Si ocurre una falla al consultar los productos,
            se muestra un mensaje de error amigable.
          */
          this.errorMessage.set(
            'No fue posible cargar tus favoritos en este momento.'
          );

          /* 
            Finaliza el estado de carga incluso si hubo error.
          */
          this.loading.set(false);
        }
      });
  }

  /* 
    Elimina un producto específico de la lista de favoritos.
    
    Este método:
    1. Evita navegación accidental si viene desde un botón dentro de un enlace
    2. Elimina el ID del arreglo de favoriteIds
    3. Actualiza también la lista visible favoriteProducts
    4. Guarda los cambios en localStorage
  */
  removeFavorite(product: Product, event?: Event): void {

    /* 
      Si el método fue disparado desde un evento del DOM,
      se evita el comportamiento por defecto y la propagación.
      
      Esto es útil si el botón de eliminar está dentro de una card clickeable.
    */
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    /* 
      Obtiene el ID del producto y lo normaliza como string
      para comparar de forma consistente.
    */
    const productId = String(this.getProductId(product));

    /* 
      Genera un nuevo arreglo de IDs excluyendo el producto eliminado.
    */
    const updatedIds = this.favoriteIds().filter(
      id => String(id) !== productId
    );

    /* 
      Actualiza la signal de IDs favoritos.
    */
    this.favoriteIds.set(updatedIds);

    /* 
      Actualiza también la lista visual de productos favoritos
      sin necesidad de volver a consultar el servicio.
      
      Esto mejora la experiencia del usuario porque el cambio
      se refleja al instante.
    */
    this.favoriteProducts.set(
      this.favoriteProducts().filter(
        item => String(this.getProductId(item)) !== productId
      )
    );

    /* 
      Persiste el cambio en localStorage
      y notifica a otros componentes.
    */
    this.persistFavorites();
  }

  /* 
    Vacía completamente la lista de favoritos.
    
    Se limpian:
    - los IDs guardados
    - los productos visibles
    - el contenido persistido en localStorage
  */
  clearFavorites(): void {
    this.favoriteIds.set([]);
    this.favoriteProducts.set([]);
    this.persistFavorites();
  }

  /* 
    Guarda la lista actual de favoritos en localStorage
    y además notifica a otros componentes del proyecto.
    
    Esto permite, por ejemplo, que el Header actualice
    su contador de favoritos inmediatamente.
  */
  private persistFavorites(): void {

    /* 
      Si no estamos en navegador, no hacemos nada,
      porque localStorage y window no existen en SSR.
    */
    if (!this.isBrowser) {
      return;
    }

    /* 
      Guarda el arreglo actual de IDs favoritos en localStorage.
    */
    localStorage.setItem(this.storageKey, JSON.stringify(this.favoriteIds()));

    /* 
      Dispara un evento personalizado para avisar a otros componentes
      que la lista de favoritos cambió.
      
      Ejemplo de uso:
      el Header puede escuchar este evento y refrescar el contador.
    */
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  }

  // Retorna la cantidad de productos favoritos visibles
  getFavoriteCount(): number {
    return this.favoriteProducts().length;
  }

  // ===== Métodos auxiliares tipados directamente con Product =====

  // Obtiene el ID del producto
  getProductId(product: Product): number {
    return product.id;
  }

  // Construye el nombre del producto con marca + modelo
  getProductName(product: Product): string {
    return `${product.brand} ${product.model}`.trim();
  }

  // Retorna la marca del producto
  getProductBrand(product: Product): string {
    return product.brand;
  }

  // Retorna la imagen del producto
  getProductImage(product: Product): string {
    return product.image || 'assets/images/placeholder-phone.png';
  }

  // Retorna una descripción corta del producto
  getProductShortDescription(product: Product): string {
    const description =
      product.description ||
      'Consulta este smartphone en detalle y compáralo con otras opciones del catálogo.';

    return description.length > 90
      ? `${description.slice(0, 87)}...`
      : description;
  }

  // Retorna el precio del producto
  getProductPrice(product: Product): number {
    return Number(product.price) || 0;
  }

  // Formatea el precio en moneda colombiana
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}