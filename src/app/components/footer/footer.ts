import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Estructura simple para los enlaces internos del footer
interface FooterLink {
  label: string;
  route: string;
}

// Estructura para marcas mostradas en el footer
interface BrandItem {
  name: string;
}

// Estructura para redes sociales
interface SocialItem {
  label: string;
  href: string;
  icon: 'facebook' | 'instagram' | 'x';
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  // Nombre visible del proyecto
  brandName = 'CeluMarket';

  // Año actual para el copyright
  currentYear = new Date().getFullYear();

  // Descripción corta institucional de la marca
  brandDescription =
    'Tu tienda de confianza para encontrar los mejores Smartphones del mercado.';

  // Enlaces rápidos del aplicativo
  quickLinks: FooterLink[] = [
    { label: 'Inicio', route: '/home' },
    { label: 'Catálogo', route: '/catalog' },
    { label: 'Contacto', route: '/contact' }
  ];

  // Marcas que maneja el catálogo
  brands: BrandItem[] = [
    { name: 'Samsung' },
    { name: 'iPhone' },
    { name: 'Motorola' },
    { name: 'Xiaomi' }
  ];

  // Información de contacto visible en el footer
  contactEmail = 'info@celumarket.com';
  contactPhone = '+57 3231234567';
  contactCity = 'Colombia';

  // Redes sociales de ejemplo
  socials: SocialItem[] = [
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'X', href: '#', icon: 'x' }
  ];
}