export interface Product {
  id: number;
  brand: string;      
  model: string;      
  price: number;      
  image: string;      
  description: string; 
  
  //Especificaciones Técnicas
  screen: string;     
  processor: string;  
  ram: string;        
  storage: string;    
  camera: string;     
  battery: string;    
  
  //Opciones de Personalización
  colors: string[];   
  
  //Lógica de Negocio y Estado
  stock: number;      
  featured: boolean;  
  favorite?: boolean; 
}