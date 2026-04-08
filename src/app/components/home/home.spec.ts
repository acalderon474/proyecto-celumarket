/* 
  Importa las herramientas necesarias de Angular para configurar
  y ejecutar pruebas unitarias sobre componentes.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* 
  Importa provideRouter para simular el sistema de rutas
  dentro del entorno de pruebas.
*/
import { provideRouter } from '@angular/router';

/* 
  Importa of de RxJS para crear un observable simple
  que devuelva datos simulados en la prueba.
*/
import { of } from 'rxjs';

/* 
  Importa el componente Home que será probado.
*/
import { Home } from './home';

/* 
  Importa el servicio ProductService, que en la prueba
  será reemplazado por un mock.
*/
import { ProductService } from '../../services/product.service';

/* 
  Mock simple del servicio ProductService.
  Simula el método getFeaturedProducts para evitar
  consumir datos reales en las pruebas.
*/
class ProductServiceMock {
  /* 
    Retorna un observable con un arreglo vacío,
    simulando una respuesta válida del servicio.
  */
  getFeaturedProducts() {
    return of([]);
  }
}

/* 
  Bloque principal de pruebas para el componente Home.
*/
describe('Home', () => {
  /* 
    Variable que almacenará la instancia del componente Home.
  */
  let component: Home;

  /* 
    Variable que almacenará el fixture del componente.
    El fixture permite interactuar con el componente
    y su vista dentro del entorno de pruebas.
  */
  let fixture: ComponentFixture<Home>;

  /* 
    beforeEach se ejecuta antes de cada prueba.
    Aquí se configura el módulo de pruebas.
  */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      /* 
        Como Home es un componente standalone,
        se importa directamente.
      */
      imports: [Home],

      /* 
        Se configuran los providers necesarios para la prueba:
        - Un router vacío
        - El servicio ProductService reemplazado por el mock
      */
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useClass: ProductServiceMock
        }
      ]
    }).compileComponents();

    /* 
      Crea una instancia del componente Home dentro del entorno de prueba.
    */
    fixture = TestBed.createComponent(Home);

    /* 
      Obtiene la instancia del componente desde el fixture.
    */
    component = fixture.componentInstance;

    /* 
      Ejecuta la detección de cambios inicial,
      renderizando el componente y disparando ngOnInit.
    */
    fixture.detectChanges();
  });

  /* 
    Prueba básica para verificar que el componente
    se crea correctamente.
  */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});