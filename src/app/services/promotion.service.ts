import { Injectable } from '@angular/core';

import { Product } from '../models/product.model';

/*
    Servicio de promociones de CeluMarket.

    Este servicio centraliza la lógica de descuentos para evitar
    repetir cálculos en diferentes componentes como:
    - Catálogo
    - Detalle del producto
    - Carrito de compras

    En este caso, la promoción aplica únicamente para productos
    de la marca Samsung.
*/
@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    /*
        Porcentaje de descuento aplicado a los productos Samsung.
    
        El valor 0.15 representa el 15%.
    */
    private readonly samsungDiscountRate = 0.15;

    /*
        Texto promocional que se mostrará en las tarjetas
        y en la vista de detalle para productos Samsung.
    */
    private readonly samsungPromotionLabel = 'Incluye Buds4';

    /*
        Verifica si un producto pertenece a la marca Samsung.
    
        Se usa trim() y toLowerCase() para evitar errores
        por espacios o diferencias entre mayúsculas y minúsculas.
    */
    isSamsungProduct(product: Product): boolean {
        return product.brand.trim().toLowerCase() === 'samsung';
    }

    /*
        Indica si un producto tiene promoción activa.
    
        Actualmente solo Samsung tiene promoción,
        pero este método permite ampliar la lógica en el futuro
        para otras marcas o campañas.
    */
    hasPromotion(product: Product): boolean {
        return this.isSamsungProduct(product);
    }

    /*
        Devuelve el porcentaje de descuento correspondiente.
    
        Si el producto es Samsung, retorna 15.
        Si no tiene promoción, retorna 0.
    */
    getDiscountPercent(product: Product): number {
        return this.hasPromotion(product)
            ? this.samsungDiscountRate * 100
            : 0;
    }

    /*
        Devuelve el precio original del producto.
    
        Se convierte a número para evitar errores si en algún momento
        el precio llega como texto desde una fuente externa.
    */
    getOriginalPrice(product: Product): number {
        return Number(product.price) || 0;
    }

    /*
        Calcula el precio final del producto.
    
        Si el producto tiene promoción, aplica el descuento.
        Si no tiene promoción, devuelve el precio original.
    */
    getFinalPrice(product: Product): number {
        const originalPrice = this.getOriginalPrice(product);

        if (!this.hasPromotion(product)) {
            return originalPrice;
        }

        return Math.round(originalPrice * (1 - this.samsungDiscountRate));
    }

    /*
        Calcula cuánto dinero ahorra el usuario.
    
        Para productos sin promoción, el ahorro será 0.
    */
    getSavings(product: Product): number {
        const originalPrice = this.getOriginalPrice(product);
        const finalPrice = this.getFinalPrice(product);

        return originalPrice - finalPrice;
    }

    /*
        Devuelve el texto de la promoción.
    
        Para Samsung devuelve: Incluye Buds4.
        Para productos sin promoción devuelve una cadena vacía.
    */
    getPromotionLabel(product: Product): string {
        return this.hasPromotion(product)
            ? this.samsungPromotionLabel
            : '';
    }
}