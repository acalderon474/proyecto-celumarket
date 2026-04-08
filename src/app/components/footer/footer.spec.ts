/* 
  Importa las utilidades necesarias para crear y manipular
  el componente dentro del entorno de pruebas de Angular.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

/* 
  Importa provideRouter para simular el sistema de rutas
  dentro de las pruebas, en caso de que el componente use routerLink.
*/
import { provideRouter } from '@angular/router';

/* 
  Importa el componente Footer que se va a probar.
*/
import { Footer } from './footer';

/* 
  describe agrupa todas las pruebas relacionadas con el componente Footer.
*/
describe('Footer', () => {
  /* 
    Variable que almacenará la instancia del componente Footer.
  */
  let component: Footer;

  /* 
    Variable que almacenará el fixture del componente.
    El fixture permite acceder al componente, al DOM renderizado
    y ejecutar detección de cambios.
  */
  let fixture: ComponentFixture<Footer>;

  /* 
    beforeEach se ejecuta antes de cada prueba.
    Aquí se configura el entorno de testing del componente.
  */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      /* 
        Como Footer es un componente standalone,
        se importa directamente en la configuración de pruebas.
      */
      imports: [Footer],

      /* 
        Se provee un router vacío para evitar errores
        si el componente usa enlaces de navegación.
      */
      providers: [provideRouter([])]
    }).compileComponents();

    /* 
      Crea una instancia del componente Footer dentro del entorno de prueba.
    */
    fixture = TestBed.createComponent(Footer);

    /* 
      Obtiene la instancia del componente creada por el fixture.
    */
    component = fixture.componentInstance;

    /* 
      Ejecuta la detección de cambios inicial,
      renderizando el componente y aplicando su lógica.
    */
    fixture.detectChanges();
  });

  /* 
    Prueba básica para verificar que el componente se crea correctamente.
  */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});