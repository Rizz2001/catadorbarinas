import { Product } from '@/types';
import { adaptProducts, RawProductDto } from '@/adapters/productAdapter';

/**
 * Catálogo maestro de productos para Gran Catador / Distribuidora Bodegón del Catador (Barinas)
 * Organizado por departamentos canónicos con precios duales listos para BCV.
 */
const CATALOG_PRODUCTS: RawProductDto[] = [
  {
    id: 'gc-01',
    sku: 'GC-W01',
    nombre: 'Whisky Buchanan\'s De Luxe 12 Años 750ml',
    marca: 'Buchanan\'s',
    categoria: 'Whisky Escocés',
    departamento: 'licores-vinos',
    precio_usd: 28.5,
    precio_regular_usd: 34.0,
    porcentaje_descuento: 16,
    disponible: true,
    stock: 35,
    calificacion: 4.9,
    opiniones: 112,
    imagenes: ['https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Botella 750ml',
    es_oferta_del_dia: true,
    es_tendencia: true,
    es_producto_estrella: true,
  },
  {
    id: 'gc-02',
    sku: 'GC-R02',
    nombre: 'Ron Santa Teresa 1796 Solera Reserva Exclusiva',
    marca: 'Santa Teresa',
    categoria: 'Ron Premium',
    departamento: 'licores-vinos',
    precio_usd: 39.0,
    precio_regular_usd: 46.0,
    porcentaje_descuento: 15,
    disponible: true,
    stock: 20,
    calificacion: 5.0,
    opiniones: 140,
    imagenes: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Botella 750ml',
    es_oferta_del_dia: true,
    es_tendencia: true,
  },
  {
    id: 'gc-03',
    sku: 'GC-W03',
    nombre: 'Whisky Old Parr 12 Años De Luxe 750ml',
    marca: 'Old Parr',
    categoria: 'Whisky Escocés',
    departamento: 'licores-vinos',
    precio_usd: 29.9,
    precio_regular_usd: 36.0,
    porcentaje_descuento: 17,
    disponible: true,
    stock: 18,
    calificacion: 4.8,
    opiniones: 89,
    imagenes: ['https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Botella 750ml',
    es_oferta_del_dia: true,
    es_tendencia: true,
  },
  {
    id: 'gc-04',
    sku: 'GC-V04',
    nombre: 'Vino Tinto Casillero del Diablo Cabernet Sauvignon',
    marca: 'Concha y Toro',
    categoria: 'Vinos Tintos',
    departamento: 'licores-vinos',
    precio_usd: 10.5,
    precio_regular_usd: 13.0,
    porcentaje_descuento: 19,
    disponible: true,
    stock: 45,
    calificacion: 4.7,
    opiniones: 64,
    imagenes: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Botella 750ml',
    es_oferta_del_dia: true,
  },
  {
    id: 'gc-05',
    sku: 'GC-C05',
    nombre: 'Queso Parmesano Reggiano Auténtico Madurado',
    marca: 'Gran Catador Selección',
    categoria: 'Quesos Madurados',
    departamento: 'charcuteria-quesos',
    precio_usd: 14.5,
    precio_regular_usd: 18.0,
    porcentaje_descuento: 19,
    disponible: true,
    stock: 25,
    calificacion: 4.9,
    opiniones: 53,
    imagenes: ['https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Pieza 450g',
    es_oferta_del_dia: true,
    es_tendencia: true,
  },
  {
    id: 'gc-06',
    sku: 'GC-C06',
    nombre: 'Jamón Serrano Reserva Loncheado 100g',
    marca: 'Navidul',
    categoria: 'Embutidos Ibéricos',
    departamento: 'charcuteria-quesos',
    precio_usd: 6.8,
    precio_regular_usd: 8.5,
    porcentaje_descuento: 20,
    disponible: true,
    stock: 40,
    calificacion: 4.8,
    opiniones: 41,
    imagenes: ['https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Paquete 100g',
    es_oferta_del_dia: true,
  },
  {
    id: 'gc-07',
    sku: 'GC-A07',
    nombre: 'Aceite de Oliva Extra Virgen Carbonell 1 Litro',
    marca: 'Carbonell',
    categoria: 'Aceites & Condimentos',
    departamento: 'viveres',
    precio_usd: 11.2,
    precio_regular_usd: 13.5,
    porcentaje_descuento: 17,
    disponible: true,
    stock: 60,
    calificacion: 4.7,
    opiniones: 78,
    imagenes: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Botella 1 Litro',
    es_tendencia: true,
  },
  {
    id: 'gc-08',
    sku: 'GC-S08',
    nombre: 'Papas Pringles Original Importadas 158g',
    marca: 'Pringles',
    categoria: 'Snacks & Pasapalos',
    departamento: 'snacks-dulces',
    precio_usd: 3.5,
    precio_regular_usd: 4.2,
    porcentaje_descuento: 16,
    disponible: true,
    stock: 80,
    calificacion: 4.9,
    opiniones: 95,
    imagenes: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Lata 158g',
    es_tendencia: true,
  },
  {
    id: 'gc-09',
    sku: 'GC-B09',
    nombre: 'Pack 6x Cerveza Corona Extra 355ml',
    marca: 'Corona',
    categoria: 'Cervezas Importadas',
    departamento: 'licores-vinos',
    precio_usd: 12.0,
    precio_regular_usd: 14.5,
    porcentaje_descuento: 17,
    disponible: true,
    stock: 50,
    calificacion: 4.9,
    opiniones: 130,
    imagenes: ['https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Pack 6 Botellas',
    es_tendencia: true,
  },
  {
    id: 'gc-10',
    sku: 'GC-M10',
    nombre: 'Punta Trasera Angus Premium para Parrilla',
    marca: 'Gran Catador Carnicería',
    categoria: 'Cortes Especiales',
    departamento: 'carniceria',
    precio_usd: 16.5,
    precio_regular_usd: 19.5,
    porcentaje_descuento: 15,
    disponible: true,
    stock: 22,
    calificacion: 5.0,
    opiniones: 72,
    imagenes: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'],
    unidad: 'Kilo empacado al vacío',
    es_tendencia: true,
  },
];

import { fetchArticulosSmartVentas } from './foxdata.service';

export async function getAllProducts(): Promise<Product[]> {
  try {
    const liveProducts = await fetchArticulosSmartVentas('01');
    if (liveProducts && liveProducts.length > 0) {
      // Filtrar artículos que tengan precio de venta válido en divisas
      const valid = liveProducts.filter((p) => p.priceUsd > 0);
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch (err) {
    console.warn('Fallback a catálogo local debido a error en FoxData:', err);
  }
  return adaptProducts(CATALOG_PRODUCTS);
}

export async function getFeaturedDeals(): Promise<Product[]> {
  const all = await getAllProducts();
  const deals = all.filter((p) => p.isDealOfTheDay || (p.discountPercentage && p.discountPercentage > 0));
  if (deals.length > 0) return deals.slice(0, 6);
  return all.slice(0, 6);
}

export async function getWeeklyTrends(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.slice(0, 5);
}

export async function getStarProduct(): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.isStarProduct) || all[0];
}
