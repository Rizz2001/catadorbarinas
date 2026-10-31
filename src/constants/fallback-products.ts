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
 * Subgrupos oficiales reales de SmartVentas con sus códigos exactos de FoxData
 */
export const DEFAULT_SUBGROUPS: Record<
  string,
  { CodGrupo: string; CodSubgrupo: string; Nombre: string }[]
> = {
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
    { CodGrupo: '01', CodSubgrupo: '1000', Nombre: 'LICORES' },
    { CodGrupo: '01', CodSubgrupo: '11', Nombre: 'L.DULCE' },
    { CodGrupo: '01', CodSubgrupo: '12', Nombre: 'JARABE' },
    { CodGrupo: '01', CodSubgrupo: '13', Nombre: 'SANGRIA' },
    { CodGrupo: '01', CodSubgrupo: '14', Nombre: 'SIDRA' },
    { CodGrupo: '01', CodSubgrupo: '15', Nombre: 'TEQUILA' },
    { CodGrupo: '01', CodSubgrupo: '16', Nombre: 'ANIS' },
    { CodGrupo: '01', CodSubgrupo: '17', Nombre: 'L.SECO' },
    { CodGrupo: '01', CodSubgrupo: '18', Nombre: 'VINO IMP.' },
    { CodGrupo: '01', CodSubgrupo: '23', Nombre: 'COCT.Y GUARAPITAS' },
    { CodGrupo: '01', CodSubgrupo: '24', Nombre: 'AGUARDIENTE' },
    { CodGrupo: '01', CodSubgrupo: '25', Nombre: 'COCUY' },
    { CodGrupo: '01', CodSubgrupo: '26', Nombre: 'JEREZ' },
  ],
  '02': [
    { CodGrupo: '02', CodSubgrupo: '1000', Nombre: 'REFRESCO' },
    { CodGrupo: '02', CodSubgrupo: '1001', Nombre: 'MALTA' },
    { CodGrupo: '02', CodSubgrupo: '43', Nombre: 'B.ENERGETICA' },
    { CodGrupo: '02', CodSubgrupo: '46', Nombre: 'SODA' },
  ],
  '03': [{ CodGrupo: '03', CodSubgrupo: '1000', Nombre: 'HIELOS' }],
  '04': [
    { CodGrupo: '04', CodSubgrupo: '41', Nombre: 'CIGARILLO' },
    { CodGrupo: '04', CodSubgrupo: '44', Nombre: 'FOSFORO' },
    { CodGrupo: '04', CodSubgrupo: '45', Nombre: 'YESQUERO' },
    { CodGrupo: '04', CodSubgrupo: '47', Nombre: 'CHIMO' },
  ],
  '05': [
    { CodGrupo: '05', CodSubgrupo: '1000', Nombre: 'CONFITERIA' },
    { CodGrupo: '05', CodSubgrupo: '1001', Nombre: 'PEPITOS' },
    { CodGrupo: '05', CodSubgrupo: '1002', Nombre: 'GALLETAS' },
    { CodGrupo: '05', CodSubgrupo: '1003', Nombre: 'CHOCOLATES' },
    { CodGrupo: '05', CodSubgrupo: '1004', Nombre: 'TORTAS Y PONQUES' },
    { CodGrupo: '05', CodSubgrupo: '1005', Nombre: 'CONFITERIAS DE CAJAS' },
    { CodGrupo: '05', CodSubgrupo: '1006', Nombre: 'CEREALES' },
  ],
  '06': [
    { CodGrupo: '06', CodSubgrupo: '40', Nombre: 'SERVILLETAS, CUCHARAS Y OTROS' },
    { CodGrupo: '06', CodSubgrupo: '46', Nombre: 'VASOS' },
    { CodGrupo: '06', CodSubgrupo: '47', Nombre: 'PLATOS' },
    { CodGrupo: '06', CodSubgrupo: '48', Nombre: 'CAVA' },
    { CodGrupo: '06', CodSubgrupo: '49', Nombre: 'COPAS Y VASOS' },
  ],
  '07': [{ CodGrupo: '07', CodSubgrupo: '1000', Nombre: 'CARBON' }],
  '08': [{ CodGrupo: '08', CodSubgrupo: '1000', Nombre: 'AGUA' }],
  '09': [
    { CodGrupo: '09', CodSubgrupo: '1000', Nombre: 'CVZA NAC' },
    { CodGrupo: '09', CodSubgrupo: '32', Nombre: 'CVZA IMP' },
  ],
  '10': [
    { CodGrupo: '10', CodSubgrupo: '01', Nombre: 'VARIOS' },
    { CodGrupo: '10', CodSubgrupo: '02', Nombre: 'CUIDADO PERSONAL' },
  ],
  '11': [
    { CodGrupo: '11', CodSubgrupo: '01', Nombre: 'DELICATECES' },
    { CodGrupo: '11', CodSubgrupo: '02', Nombre: 'CHARCUTERIA' },
    { CodGrupo: '11', CodSubgrupo: '03', Nombre: 'EMBUTIDOS' },
    { CodGrupo: '11', CodSubgrupo: '04', Nombre: 'ALIMENTOS' },
    { CodGrupo: '11', CodSubgrupo: '05', Nombre: 'HELADOS' },
    { CodGrupo: '11', CodSubgrupo: '06', Nombre: 'PAN' },
    { CodGrupo: '11', CodSubgrupo: '07', Nombre: 'ENLATADOS' },
    { CodGrupo: '11', CodSubgrupo: '08', Nombre: 'CONGELADOS' },
    { CodGrupo: '11', CodSubgrupo: '09', Nombre: 'CARNES' },
    { CodGrupo: '11', CodSubgrupo: '10', Nombre: 'REGULADOS' },
    { CodGrupo: '11', CodSubgrupo: '12', Nombre: 'PESCADOS Y MARISCOS' },
  ],
  '14': [
    { CodGrupo: '14', CodSubgrupo: '150', Nombre: 'JUGOS' },
    { CodGrupo: '14', CodSubgrupo: '151', Nombre: 'LACTEOS' },
    { CodGrupo: '14', CodSubgrupo: '152', Nombre: 'YOGOURT' },
  ],
};

const GROUP_SYNONYMS: Record<string, string> = {
  '01': 'licores destilados espirituosos',
  '02': 'refrescos bebidas gaseosas',
  '03': 'hielos hielo',
  '04': 'cigarrillos cigarros tabaco',
  '05': 'confiteria dulces chucherias snacks golosinas',
  '06': 'descartables desechables',
  '07': 'carbon parrilla brasa',
  '08': 'agua mineral potable',
  '09': 'cerveza cervezas birras',
  '10': 'varios hogar',
  '11': 'alimentos viveres despensa comida supermercado',
  '14': 'jugos lacteos bebidas',
};

export function resolveCategoryMetadata(codGrupo?: string, codSubgrupo?: string): {
  categoryLabel: string;
  searchKeywords: string;
} {
  const gCode = (codGrupo || '').trim();
  const sCode = (codSubgrupo || '').trim();

  const groupObj = DEFAULT_GROUPS.find((g) => g.CodGrupo === gCode);
  const subList = DEFAULT_SUBGROUPS[gCode] || [];
  const subObj = subList.find((s) => s.CodSubgrupo === sCode);

  const groupName = groupObj?.Nombre || 'Bodegón';
  const subName = subObj?.Nombre || '';

  const categoryLabel = subName && subName !== groupName ? `${groupName} • ${subName}` : groupName;
  const synonyms = GROUP_SYNONYMS[gCode] || '';
  const searchKeywords = `${groupName} ${subName} ${synonyms}`.trim();

  return { categoryLabel, searchKeywords };
}

export const FALLBACK_PRODUCTS: Product[] = [];

export function getFallbackProductsByGroup(): Product[] {
  return [];
}
