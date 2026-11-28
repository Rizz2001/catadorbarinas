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
  LayoutGrid,
  FolderKanban,
} from 'lucide-react';

export interface AdminNavGroup {
  groupLabel: string;
  items: Array<{
    href: string;
    label: string;
    icon: ElementType;
    exact: boolean;
    showPendingBadge?: boolean;
  }>;
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    groupLabel: 'Operaciones',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: Truck, exact: false, showPendingBadge: true },
      { href: '/admin/busquedas', label: 'Búsquedas', icon: Search, exact: true },
    ],
  },
  {
    groupLabel: 'Tienda y Catálogo',
    items: [
      { href: '/admin/inicio', label: 'Portada', icon: LayoutGrid, exact: true },
      { href: '/admin/categorias', label: 'Categorías', icon: FolderKanban, exact: true },
      { href: '/admin/catalogo-config', label: 'Catálogo', icon: Sliders, exact: true },
      { href: '/admin/productos', label: 'Fotos', icon: Camera, exact: true },
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon, exact: true },
      { href: '/admin/aliados', label: 'Marcas y FAQ', icon: Award, exact: true },
    ],
  },
  {
    groupLabel: 'Sistema',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users, exact: true },
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings, exact: true },
    ],
  },
];
