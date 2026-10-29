import { Product } from '@/types';

/**
 * Grupos oficiales reales sincronizados con la API de FoxData / SmartVentas (SmartVentas = 1)
 */
export const DEFAULT_GROUPS = [
  { CodGrupo: '01', Nombre: 'LICORES', SmartVentas: 1 },
  { CodGrupo: '02', Nombre: 'REFRESCOS', SmartVentas: 1 },
  { CodGrupo: '03', Nombre: 'HIELOS', SmartVentas: 1 },
  { CodGrupo: '04', Nombre: 'CIGARRILLOS-FOSFOROS', SmartVentas: 1 },
  { CodGrupo: '05', Nombre: 'CONFITERIA', SmartVentas: 1 },
  { CodGrupo: '06', Nombre: 'VASOS-PLATOS', SmartVentas: 1 },
  { CodGrupo: '07', Nombre: 'CARBON', SmartVentas: 1 },
  { CodGrupo: '08', Nombre: 'AGUA', SmartVentas: 1 },
  { CodGrupo: '09', Nombre: 'CERVEZA', SmartVentas: 1 },
  { CodGrupo: '10', Nombre: 'VARIOS', SmartVentas: 1 },
  { CodGrupo: '11', Nombre: 'ALIMENTOS', SmartVentas: 1 },
  { CodGrupo: '14', Nombre: 'JUGO Y LACTEAS', SmartVentas: 1 },
];

/**
 * Subgrupos oficiales reales de SmartVentas
 */
export const DEFAULT_SUBGROUPS: Record<string, { CodGrupo: string; CodSubgrupo: string; Nombre: string }[]> = {
  '01': [
    { CodGrupo: '01', CodSubgrupo: '01', Nombre: 'WHISKY IMP.' },
    { CodGrupo: '01', CodSubgrupo: '02', Nombre: 'RON' },
    { CodGrupo: '01', CodSubgrupo: '03', Nombre: 'GINEBRA' },
    { CodGrupo: '01', CodSubgrupo: '04', Nombre: 'VODKA' },
    { CodGrupo: '01', CodSubgrupo: '05', Nombre: 'WHISKY NAC.' },
    { CodGrupo: '01', CodSubgrupo: '06', Nombre: 'VINO NAC.' },
    { CodGrupo: '01', CodSubgrupo: '07', Nombre: 'B.E.SECA' },
    { CodGrupo: '01', CodSubgrupo: '08', Nombre: 'BRANDY' },
    { CodGrupo: '01', CodSubgrupo: '09', Nombre: 'VINO ESPUMANTE' },
    { CodGrupo: '01', CodSubgrupo: '10', Nombre: 'COÑAC' },
    { CodGrupo: '01', CodSubgrupo: '11', Nombre: 'LICORES' },
    { CodGrupo: '01', CodSubgrupo: '12', Nombre: 'L.DULCE' },
    { CodGrupo: '01', CodSubgrupo: '13', Nombre: 'JARABE' },
    { CodGrupo: '01', CodSubgrupo: '14', Nombre: 'SANGRIA' },
    { CodGrupo: '01', CodSubgrupo: '15', Nombre: 'SIDRA' },
    { CodGrupo: '01', CodSubgrupo: '16', Nombre: 'TEQUILA' },
    { CodGrupo: '01', CodSubgrupo: '17', Nombre: 'ANIS' },
    { CodGrupo: '01', CodSubgrupo: '18', Nombre: 'L.SECO' },
    { CodGrupo: '01', CodSubgrupo: '19', Nombre: 'VINO IMP.' },
    { CodGrupo: '01', CodSubgrupo: '20', Nombre: 'COCT.Y GUARAPITAS' },
    { CodGrupo: '01', CodSubgrupo: '21', Nombre: 'AGUARDIENTE' },
    { CodGrupo: '01', CodSubgrupo: '22', Nombre: 'COCUY' },
    { CodGrupo: '01', CodSubgrupo: '23', Nombre: 'JEREZ' },
  ],
  '02': [
    { CodGrupo: '02', CodSubgrupo: '01', Nombre: 'REFRESCOS' },
    { CodGrupo: '02', CodSubgrupo: '02', Nombre: 'JUGOS Y BEBIDAS' },
  ],
  '03': [
    { CodGrupo: '03', CodSubgrupo: '01', Nombre: 'HIELOS' },
  ],
  '05': [
    { CodGrupo: '05', CodSubgrupo: '01', Nombre: 'SNACKS Y GOLOSINAS' },
  ],
  '08': [
    { CodGrupo: '08', CodSubgrupo: '01', Nombre: 'AGUA MINERAL' },
  ],
  '09': [
    { CodGrupo: '09', CodSubgrupo: '01', Nombre: 'CERVEZAS NACIONALES' },
    { CodGrupo: '09', CodSubgrupo: '02', Nombre: 'CERVEZAS IMPORTADAS' },
  ],
  '11': [
    { CodGrupo: '11', CodSubgrupo: '01', Nombre: 'ALIMENTOS Y DESPENSA' },
  ],
  '14': [
    { CodGrupo: '14', CodSubgrupo: '01', Nombre: 'JUGOS Y LACTEOS' },
  ],
};

/**
 * Cero productos inventados: Todo el catálogo se basa 100% en la API de FoxData.
 */
export const FALLBACK_PRODUCTS: Product[] = [];

export function getFallbackProductsByGroup(): Product[] {
  return [];
}
