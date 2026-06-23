import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { PromotionService } from '../../services/promotion.service';

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
  a favoritos, agregarlo al carrito y mostrar
  productos relacionados.
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
    Signal reactiva para mostrar un mensaje breve
    cuando un producto se agrega al carrito desde la vista detalle.
  */
  cartMessage = signal('');

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
    Inyectamos CartService para poder agregar productos
    al carrito de compras desde la vista de detalle.
  */
  private cartService = inject(CartService);

  /*
  Inyectamos PromotionService para aplicar la lógica
  de promociones en productos Samsung.
*/
private promotionService = inject(PromotionService);

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
    this.cartMessage.set('');

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
    Agrega un producto al carrito de compras.
    Si el producto ya existe, CartService incrementa la cantidad.
    También se dispara un evento personalizado para que luego
    el Header pueda actualizar el contador del carrito.
  */
  addToCart(product: Product, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.isOutOfStock(product)) {
      this.cartMessage.set('Este producto no tiene stock disponible.');
      return;
    }

    this.cartService.addToCart(product);

    this.cartMessage.set(`${this.getProductName(product)} fue agregado al carrito.`);

    window.dispatchEvent(new CustomEvent('cart-updated'));

    setTimeout(() => {
      this.cartMessage.set('');
    }, 2500);
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

    /*
  Verifica si un producto tiene promoción activa.
  Actualmente la promoción aplica solo para celulares Samsung.
*/
hasPromotion(product: Product): boolean {
  return this.promotionService.hasPromotion(product);
}

/*
  Devuelve el texto promocional del producto.
  Para Samsung devuelve: Incluye Buds4.
*/
getPromotionLabel(product: Product): string {
  return this.promotionService.getPromotionLabel(product);
}

/*
  Devuelve el porcentaje de descuento aplicado.
  Para Samsung devuelve 15.
*/
getDiscountPercent(product: Product): number {
  return this.promotionService.getDiscountPercent(product);
}

/*
  Devuelve el precio original del producto,
  es decir, el valor antes del descuento.
*/
getOriginalPrice(product: Product): number {
  return this.promotionService.getOriginalPrice(product);
}

/*
  Devuelve el precio final del producto.
  Si es Samsung, aplica el descuento del 15%.
*/
getFinalPrice(product: Product): number {
  return this.promotionService.getFinalPrice(product);
}

/*
  Devuelve el valor ahorrado por el usuario.
*/
getSavings(product: Product): number {
  return this.promotionService.getSavings(product);
}

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }
}