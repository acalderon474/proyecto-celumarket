import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProductDetail } from './product-detail';
import { ProductService } from '../../services/product.service';

/*
  Mock simple del servicio principal.
  Retorna un pequeño arreglo de productos
  para probar la creación del componente.
*/
class ProductServiceMock {
  getProducts() {
    return of([
      {
        id: 1,
        brand: 'Samsung',
        model: 'Galaxy A54 5G',
        price: 5000000,
        image: 'assets/images/a54.png',
        description: 'Smartphone de alto rendimiento con gran cámara.',
        screen: '6.4" Super AMOLED',
        processor: 'Exynos 1380',
        ram: '8 GB',
        storage: '128 GB',
        camera: '50 MP',
        battery: '5000 mAh',
        colors: ['Negro', 'Blanco'],
        stock: 5,
        featured: true
      },
      {
        id: 2,
        brand: 'Samsung',
        model: 'Galaxy S24 Ultra',
        price: 5999999,
        image: 'assets/images/s24.png',
        description: 'Equipo premium con gran potencia.',
        screen: '6.8" AMOLED',
        processor: 'Snapdragon',
        ram: '12 GB',
        storage: '256 GB',
        camera: '200 MP',
        battery: '5000 mAh',
        colors: ['Titanio'],
        stock: 3,
        featured: true
      }
    ]);
  }
}

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetail],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useClass: ProductServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});