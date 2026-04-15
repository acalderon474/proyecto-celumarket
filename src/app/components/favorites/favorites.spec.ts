/* 
  Importa las utilidades de testing de Angular.
  
  - ComponentFixture: permite crear una instancia controlada del componente
    dentro del entorno de pruebas y acceder tanto a su lógica como a su vista.
  
  - TestBed: se usa para configurar un módulo de pruebas,
    registrar dependencias y preparar el componente antes de ejecutarlo.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* 
  Importa provideRouter para simular el sistema de rutas de Angular
  dentro de la prueba.
  
  Esto es importante porque el componente Favorites usa RouterLink
  en su plantilla HTML, y sin un router de prueba podrían aparecer errores.
*/
import { provideRouter } from '@angular/router';

/* 
  Importa of desde RxJS.
  
  of(...) crea un observable simple que emite un valor inmediatamente.
  Aquí se usa para simular la respuesta del servicio ProductService
  sin conectarse a datos reales.
*/
import { of } from 'rxjs';

/* 
  Importa el componente Favorites que se va a probar.
*/
import { Favorites } from './favorites';

/* 
  Importa el servicio ProductService.
  
  En la prueba no se usará el servicio real, sino un mock,
  pero se necesita esta referencia para indicarle a Angular
  qué dependencia se va a reemplazar.
*/
import { ProductService } from '../../services/product.service';

/* 
  Mock simple del servicio ProductService para pruebas unitarias.
  
  Su función es reemplazar el servicio real y devolver datos controlados
  durante la ejecución del test.
  
  Esto permite:
  - evitar dependencias externas
  - hacer pruebas más rápidas
  - probar el componente de forma aislada
*/
class ProductServiceMock {

  /* 
    Simula el método getProducts() del servicio real.
    
    En este caso devuelve un observable con un arreglo vacío,
    como si el catálogo no tuviera productos o no hubiera favoritos cargados.
    
    Se usa of([]) para retornar inmediatamente un observable válido.
  */
  getProducts() {
    return of([]);
  }
}

/* 
  Bloque principal de pruebas del componente Favorites.
  
  describe(...) agrupa todas las pruebas relacionadas con este componente.
*/
describe('Favorites', () => {

  /* 
    Variable que almacenará la instancia del componente Favorites.
    
    Sirve para acceder a sus métodos, signals y lógica interna
    durante las pruebas.
  */
  let component: Favorites;

  /* 
    Variable que almacenará el fixture del componente.
    
    El fixture permite:
    - crear el componente dentro del entorno de pruebas
    - acceder al DOM renderizado
    - ejecutar detección de cambios
    - sincronizar lógica y vista
  */
  let fixture: ComponentFixture<Favorites>;

  /* 
    beforeEach se ejecuta antes de cada prueba.
    
    Aquí se configura y prepara todo lo necesario para poder probar
    el componente en un entorno controlado.
  */
  beforeEach(async () => {

    /* 
      Configura el módulo de pruebas de Angular.
      
      Se definen:
      - imports: componentes standalone necesarios
      - providers: servicios e inyecciones que el componente utilizará
    */
    await TestBed.configureTestingModule({

      /* 
        Como Favorites es un componente standalone,
        se importa directamente aquí.
      */
      imports: [Favorites],

      /* 
        Providers usados en la prueba:
        
        - provideRouter([]):
          crea un router de prueba vacío para que RouterLink funcione
          sin errores dentro del componente.
        
        - ProductService:
          se reemplaza la implementación real por ProductServiceMock,
          para controlar la respuesta del servicio durante la prueba.
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
      Crea una instancia real del componente Favorites
      dentro del entorno de pruebas.
    */
    fixture = TestBed.createComponent(Favorites);

    /* 
      Extrae la instancia del componente desde el fixture
      para poder usarla directamente en los tests.
    */
    component = fixture.componentInstance;

    /* 
      Ejecuta la detección inicial de cambios.
      
      Esto hace que Angular:
      - renderice la plantilla
      - dispare el ciclo de vida del componente
      - ejecute ngOnInit()
      - procese bindings, signals y lógica inicial
    */
    fixture.detectChanges();
  });

  /* 
    Prueba básica de creación del componente.
    
    Verifica que Angular pudo construir correctamente
    la instancia de Favorites sin errores.
    
    Si component existe, la prueba pasa.
  */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});