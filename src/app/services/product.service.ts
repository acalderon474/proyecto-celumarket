import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  // Ruta exacta hacia el archivo de datos
  private jsonUrl = 'assets/data/products.json';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista completa de los 20 celulares
   * @returns Observable con el arreglo de productos
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.jsonUrl);
  }

  /**
   * Busca un celular específico por su ID
   * @param id El identificador único del celular
   */
  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map((products: Product[]) => products.find(p => p.id === id))
    );
  }

  /**
   * Filtra los celulares por marca
   * @param brand Nombre de la marca
   */
  getProductsByBrand(brand: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products: Product[]) => 
        products.filter(p => p.brand.toLowerCase() === brand.toLowerCase())
      )
    );
  }

  /**
   * Obtiene solo los productos destacados (featured: true)
   */
  getFeaturedProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products: Product[]) => products.filter(p => p.featured))
    );
  }
}