import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../models/cart-item.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartItems: CartItem[] = [];
  purchaseMessage = '';

  constructor(private cartService: CartService) {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  increaseQuantity(productId: number): void {
    this.cartService.increaseQuantity(productId);
  }

  decreaseQuantity(productId: number): void {
    this.cartService.decreaseQuantity(productId);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.purchaseMessage = '';
  }

  getSubtotal(item: CartItem): number {
  return this.cartService.getItemSubtotal(item);
  }

  getTotalItems(): number {
    return this.cartService.getTotalItems();
  }

  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
  }

  /*
  Verifica si el producto tiene promoción activa.
*/
hasPromotion(item: CartItem): boolean {
  return this.cartService.hasPromotion(item.product);
}

/*
  Devuelve el texto promocional del producto.
*/
getPromotionLabel(item: CartItem): string {
  return this.cartService.getPromotionLabel(item.product);
}

/*
  Devuelve el porcentaje de descuento aplicado.
*/
getDiscountPercent(item: CartItem): number {
  return this.cartService.getDiscountPercent(item.product);
}

/*
  Devuelve el precio original del producto.
*/
getOriginalPrice(item: CartItem): number {
  return this.cartService.getOriginalPrice(item.product);
}

/*
  Devuelve el precio final del producto.
*/
getFinalPrice(item: CartItem): number {
  return this.cartService.getFinalPrice(item.product);
}

/*
  Devuelve el ahorro por unidad.
*/
getSavings(item: CartItem): number {
  return this.cartService.getSavings(item.product);
}

/*
  Devuelve el ahorro total del producto según la cantidad.
*/
getItemTotalSavings(item: CartItem): number {
  return this.cartService.getItemTotalSavings(item);
}

  completePurchase(): void {
    if (this.cartItems.length === 0) {
      return;
    }

    this.purchaseMessage =
      'Compra simulada correctamente. Gracias por elegir CeluMarket.';

    this.cartService.clearCart();
  }
}