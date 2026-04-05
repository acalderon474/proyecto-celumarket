import { Component, inject, OnInit } from '@angular/core'; // <-- Agregamos OnInit aquí
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  // Inyección moderna de servicios
  private productService = inject(ProductService);
  
  // Lista de productos para la vista
  products: Product[] = [];

  ngOnInit(): void {
    // Nos suscribimos para obtener solo los destacados al cargar la página
    this.productService.getFeaturedProducts().subscribe(data => {
      this.products = data;
    });
  }
}