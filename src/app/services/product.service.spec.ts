import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// 1. Importamos el nombre correcto: ProductService
import { ProductService } from './product.service';

describe('ProductService', () => {
  // 2. Actualizamos el tipo de la variable
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // 3. Proveemos las herramientas HTTP falsas/de prueba para que el servicio no falle
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    // 4. Inyectamos el servicio con su nombre correcto
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});