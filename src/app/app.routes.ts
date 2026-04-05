import { Routes } from '@angular/router';

// Importación de los componentes de CeluMarket
import { Home } from './components/home/home';
import { Catalog } from './components/catalog/catalog';
import { ProductDetail } from './components/product-detail/product-detail';
import { Contact } from './components/contact/contact';
import { Favorites } from './components/favorites/favorites';

export const routes: Routes = [
  // 1. Ruta por defecto: Redirige al Home al abrir la app
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 2. Rutas principales
  { path: 'home', component: Home },
  { path: 'catalog', component: Catalog },
  { path: 'contact', component: Contact },
  { path: 'favorites', component: Favorites },

  // 3. Ruta dinámica para el detalle (recibe el ID del celular)
  { path: 'product/:id', component: ProductDetail },

  // 4. Comodín (Wildcard): Redirige a home si la URL no existe
  { path: '**', redirectTo: 'home' }
];