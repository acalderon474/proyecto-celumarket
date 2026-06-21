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
    return item.product.price * item.quantity;
  }

  getTotalItems(): number {
    return this.cartService.getTotalItems();
  }

  getTotalPrice(): number {
    return this.cartService.getTotalPrice();
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