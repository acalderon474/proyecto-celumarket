// Importa las utilidades de Angular para pruebas unitarias.
// - ComponentFixture permite crear y manipular una instancia del componente en prueba.
// - TestBed configura un entorno de prueba similar al módulo real de Angular.
import { ComponentFixture, TestBed } from '@angular/core/testing';

// Importa el componente Catalog que será evaluado en la prueba.
import { Catalog } from './catalog';

// Define el bloque principal de pruebas para el componente Catalog.
describe('Catalog', () => {

  // Variable que almacenará la instancia del componente Catalog.
  let component: Catalog;

  // Variable que almacenará el fixture del componente.
  // El fixture permite acceder al componente y a su plantilla durante la prueba.
  let fixture: ComponentFixture<Catalog>;

  // beforeEach se ejecuta antes de cada prueba.
  // Aquí se prepara el entorno necesario para probar el componente.
  beforeEach(async () => {

    // Configura el módulo de pruebas de Angular.
    // Como Catalog es un componente standalone, se importa directamente.
    await TestBed.configureTestingModule({
      imports: [Catalog],
    }).compileComponents();

    // Crea una instancia real del componente dentro del entorno de prueba.
    fixture = TestBed.createComponent(Catalog);

    // Obtiene la instancia del componente desde el fixture.
    component = fixture.componentInstance;

    // Espera a que Angular termine procesos asíncronos pendientes
    // antes de ejecutar las validaciones.
    await fixture.whenStable();
  });

  // Prueba básica que verifica que el componente se crea correctamente.
  it('should create', () => {

    // Comprueba que la instancia del componente exista.
    expect(component).toBeTruthy();
  });
});