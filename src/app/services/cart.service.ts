import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { PromotionService } from './promotion.service';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly storageKey = 'celumarket_cart';

    private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
    cartItems$ = this.cartItemsSubject.asObservable();

    /*
    Constructor del servicio.
    Inyecta PromotionService para calcular precios con descuento
    dentro del carrito de compras.
*/
    constructor(private promotionService: PromotionService) { }

    addToCart(product: Product): void {
        const currentItems = this.cartItemsSubject.value;
        const existingItem = currentItems.find(item => item.product.id === product.id);

        let updatedItems: CartItem[];

        if (existingItem) {
            updatedItems = currentItems.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            updatedItems = [...currentItems, { product, quantity: 1 }];
        }

        this.updateCart(updatedItems);
    }

    removeFromCart(productId: number): void {
        const updatedItems = this.cartItemsSubject.value.filter(
            item => item.product.id !== productId
        );

        this.updateCart(updatedItems);
    }

    increaseQuantity(productId: number): void {
        const updatedItems = this.cartItemsSubject.value.map(item =>
            item.product.id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );

        this.updateCart(updatedItems);
    }

    decreaseQuantity(productId: number): void {
        const updatedItems = this.cartItemsSubject.value
            .map(item =>
                item.product.id === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
            .filter(item => item.quantity > 0);

        this.updateCart(updatedItems);
    }

    clearCart(): void {
        this.updateCart([]);
    }

    getTotalItems(): number {
        return this.cartItemsSubject.value.reduce(
            (total, item) => total + item.quantity,
            0
        );
    }

    /*
    Calcula el total general del carrito.
    Si el producto tiene promoción, usa el precio final con descuento.
*/
    getTotalPrice(): number {
        return this.cartItemsSubject.value.reduce(
            (total, item) => total + this.getItemSubtotal(item),
            0
        );
    }

    /*
    Verifica si un producto tiene promoción activa.
*/
hasPromotion(product: Product): boolean {
    return this.promotionService.hasPromotion(product);
}

/*
    Devuelve el texto promocional del producto.
*/
getPromotionLabel(product: Product): string {
    return this.promotionService.getPromotionLabel(product);
}

/*
    Devuelve el porcentaje de descuento aplicado.
*/
getDiscountPercent(product: Product): number {
    return this.promotionService.getDiscountPercent(product);
}

/*
    
*/
getOriginalPrice(product: Product): number {
    return this.promotionService.getOriginalPrice(product);
}

/*
    Devuelve el precio final del producto.
    Para Samsung aplica el descuento del 15%.
*/
getFinalPrice(product: Product): number {
    return this.promotionService.getFinalPrice(product);
}

/*
    Devuelve el ahorro por unidad.
*/
getSavings(product: Product): number {
    return this.promotionService.getSavings(product);
}

/*
    Calcula el subtotal de un producto del carrito.
    Usa el precio final, no el precio original.
*/
getItemSubtotal(item: CartItem): number {
  return this.getFinalPrice(item.product) * item.quantity;
}

/*
    Calcula el ahorro total de un producto según su cantidad.
*/
getItemTotalSavings(item: CartItem): number {
  return this.getSavings(item.product) * item.quantity;
}

    private updateCart(items: CartItem[]): void {
        this.cartItemsSubject.next(items);
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    }

    private getCartFromStorage(): CartItem[] {
        const storedCart = localStorage.getItem(this.storageKey);
        return storedCart ? JSON.parse(storedCart) : [];
    }
}