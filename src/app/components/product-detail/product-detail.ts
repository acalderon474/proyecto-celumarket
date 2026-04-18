import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

/*
  Decorador del componente ProductDetail.
  Define el selector, los imports requeridos,
  la plantilla HTML y la hoja de estilos.
*/
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})

/*
  Componente ProductDetail.
  Se encarga de mostrar la información completa
  del producto seleccionado, permitir agregarlo
  a favoritos y mostrar productos relacionados.
*/
export class ProductDetail implements OnInit {
  /*
    Signal reactiva que almacena el producto actual.
    Cuando no se ha encontrado, su valor es null.
  */
  product = signal<Product | null>(null);

  /*
    Signal reactiva para almacenar productos relacionados
    de la misma marca, excluyendo el producto actual.
  */
  relatedProducts = signal<Product[]>([]);

  /*
    Signal reactiva para controlar el estado de carga.
  */
  loading = signal(true);

  /*
    Signal reactiva para mostrar mensajes de error.
  */
  errorMessage = signal('');

  /*
    Signal reactiva que guarda los IDs favoritos
    almacenados en localStorage.
  */
  favoriteIds = signal<number[]>([]);

  /*
    Clave centralizada usada por toda la app
    para guardar favoritos en localStorage.
  */
  private readonly storageKey = 'favorites';

  /*
    Inyectamos ActivatedRoute para leer el parámetro :id
    desde la URL actual.
  */
  private route = inject(ActivatedRoute);

  /*
    Constructor del componente.
    Inyecta el servicio principal de productos.
  */
  constructor(private productService: ProductService) {}

  /*
    Método del ciclo de vida que se ejecuta al iniciar.
    1. Carga favoritos guardados.
    2. Escucha el parámetro id de la ruta.
    3. Carga la información del producto.
  */
  ngOnInit(): void {
    this.loadFavorites();

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (Number.isNaN(id)) {
        this.product.set(null);
        this.relatedProducts.set([]);
        this.loading.set(false);
        this.errorMessage.set('No se encontró un identificador válido para el producto.');
        return;
      }

      this.loadProductDetail(id);
    });
  }

  /*
    Carga el producto actual y los productos relacionados.
    Para mantener compatibilidad con el servicio actual,
    usamos getProducts() y filtramos localmente.
  */
  private loadProductDetail(productId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productService
      .getProducts()
      .pipe(take(1))
      .subscribe({
        next: (products: Product[]) => {
          const selectedProduct = products.find(product => product.id === productId);

          if (!selectedProduct) {
            this.product.set(null);
            this.relatedProducts.set([]);
            this.loading.set(false);
            this.errorMessage.set('El producto solicitado no existe o ya no está disponible.');
            return;
          }

          this.product.set(selectedProduct);

          const related = products
            .filter(product =>
              product.brand === selectedProduct.brand &&
              product.id !== selectedProduct.id
            )
            .slice(0, 3);

          this.relatedProducts.set(related);
          this.loading.set(false);
        },
        error: () => {
          this.product.set(null);
          this.relatedProducts.set([]);
          this.loading.set(false);
          this.errorMessage.set(
            'No fue posible cargar el detalle del producto en este momento.'
          );
        }
      });
  }

  /*
    Lee la lista de favoritos guardada en localStorage.
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
    Guarda la lista actualizada de favoritos
    y notifica al Header para refrescar el contador.
  */
  private persistFavorites(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.favoriteIds()));
    window.dispatchEvent(new CustomEvent('favorites-updated'));
  }

  /*
    Agrega o quita el producto actual de favoritos.
  */
  toggleFavorite(product: Product, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const exists = this.favoriteIds().includes(product.id);

    const updatedIds = exists
      ? this.favoriteIds().filter(id => id !== product.id)
      : [...this.favoriteIds(), product.id];

    this.favoriteIds.set(updatedIds);
    this.persistFavorites();
  }

  /*
    Verifica si un producto ya está marcado como favorito.
  */
  isFavorite(product: Product): boolean {
    return this.favoriteIds().includes(product.id);
  }

  /*
    Devuelve un texto de stock amigable para la vista.
  */
  getStockLabel(product: Product): string {
    return product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Sin stock disponible';
  }

  /*
    Determina si el producto está agotado.
  */
  isOutOfStock(product: Product): boolean {
    return product.stock <= 0;
  }

  /*
    Devuelve el nombre completo del producto.
  */
  getProductName(product: Product): string {
    return `${product.brand} ${product.model}`.trim();
  }

  /*
    Devuelve el precio formateado en COP.
  */
  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}