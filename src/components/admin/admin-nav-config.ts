import { ElementType } from 'react';
import {
  Truck,
  Users,
  Settings,
  Image as ImageIcon,
  Camera,
  Sliders,
  Award,
  Search,
} from 'lucide-react';

export interface AdminNavGroup {
  groupLabel: string;
  items: Array<{
    href: string;
    label: string;
    icon: ElementType;
    exact: boolean;
  }>;
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    groupLabel: 'Operaciones en Vivo',
    items: [
      { href: '/admin/pedidos', label: 'Despacho y Pedidos', icon: Truck, exact: false },
      { href: '/admin/busquedas', label: 'Inteligencia de Búsquedas', icon: Search, exact: true },
    ],
  },
  {
    groupLabel: 'Catálogo y Portada',
    items: [
      { href: '/admin/catalogo-config', label: 'Artículos, Cajas y Secciones', icon: Sliders, exact: true },
      { href: '/admin/productos', label: 'Fotografías WebP (SKU)', icon: Camera, exact: true },
      { href: '/admin/banners', label: 'Banners y Departamentos', icon: ImageIcon, exact: true },
      { href: '/admin/aliados', label: 'Marcas Aliadas y FAQ', icon: Award, exact: true },
    ],
  },
  {
    groupLabel: 'Sistema y Accesos',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios y Permisos', icon: Users, exact: true },
      { href: '/admin/configuracion', label: 'Negocio, BCV y Delivery GPS', icon: Settings, exact: true },
    ],
  },
];

