export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type EstadoPedido = 'recibido' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';
export type EstadoPago = 'pendiente' | 'verificado' | 'rechazado';
export type MetodoPago = 'pago_movil' | 'zelle' | 'efectivo_usd' | 'punto_venta';
export type TipoMensaje = 'texto' | 'imagen' | 'evento_estado' | 'solicitud_pago';
export type RemitenteRol = 'cliente' | 'admin' | 'sistema';

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre: string;
          telefono: string | null;
          cedula: string | null;
          direccion: string | null;
          rol: 'cliente' | 'admin' | 'repartidor';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          telefono?: string | null;
          cedula?: string | null;
          direccion?: string | null;
          rol?: 'cliente' | 'admin' | 'repartidor';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          telefono?: string | null;
          cedula?: string | null;
          direccion?: string | null;
          rol?: 'cliente' | 'admin' | 'repartidor';
          updated_at?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          numero_orden: string;
          usuario_id: string | null;
          guest_token: string | null;
          cliente_nombre: string;
          cliente_telefono: string;
          cliente_cedula: string;
          cliente_email: string | null;
          tipo_entrega: 'delivery' | 'pickup';
          direccion_entrega: string | null;
          zona_barinas: string | null;
          subtotal_usd: number;
          subtotal_ves: number;
          delivery_usd: number;
          delivery_ves: number;
          total_usd: number;
          total_ves: number;
          tasa_bcv: number;
          estado_pedido: EstadoPedido;
          estado_pago: EstadoPago;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          numero_orden: string;
          usuario_id?: string | null;
          guest_token?: string | null;
          cliente_nombre: string;
          cliente_telefono: string;
          cliente_cedula: string;
          cliente_email?: string | null;
          tipo_entrega: 'delivery' | 'pickup';
          direccion_entrega?: string | null;
          zona_barinas?: string | null;
          subtotal_usd: number;
          subtotal_ves: number;
          delivery_usd: number;
          delivery_ves: number;
          total_usd: number;
          total_ves: number;
          tasa_bcv: number;
          estado_pedido?: EstadoPedido;
          estado_pago?: EstadoPago;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          numero_orden?: string;
          usuario_id?: string | null;
          guest_token?: string | null;
          cliente_nombre?: string;
          cliente_telefono?: string;
          cliente_cedula?: string;
          cliente_email?: string | null;
          tipo_entrega?: 'delivery' | 'pickup';
          direccion_entrega?: string | null;
          zona_barinas?: string | null;
          subtotal_usd?: number;
          subtotal_ves?: number;
          delivery_usd?: number;
          delivery_ves?: number;
          total_usd?: number;
          total_ves?: number;
          tasa_bcv?: number;
          estado_pedido?: EstadoPedido;
          estado_pago?: EstadoPago;
          notas?: string | null;
          updated_at?: string;
        };
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          cod_articulo_foxdata: string;
          nombre_articulo: string;
          cantidad: number;
          precio_unitario_usd: number;
          precio_unitario_ves: number;
          subtotal_usd: number;
          subtotal_ves: number;
          imagen_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          cod_articulo_foxdata: string;
          nombre_articulo: string;
          cantidad: number;
          precio_unitario_usd: number;
          precio_unitario_ves: number;
          subtotal_usd: number;
          subtotal_ves: number;
          imagen_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          cod_articulo_foxdata?: string;
          nombre_articulo?: string;
          cantidad?: number;
          precio_unitario_usd?: number;
          precio_unitario_ves?: number;
          subtotal_usd?: number;
          subtotal_ves?: number;
          imagen_url?: string | null;
        };
      };
      pagos_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          metodo_pago: MetodoPago;
          monto_usd: number;
          monto_ves: number;
          banco_origen: string | null;
          telefono_origen: string | null;
          referencia: string | null;
          comprobante_url: string | null;
          billete_pago_usd: number | null;
          vuelto_calculado_usd: number | null;
          estado: EstadoPago;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          metodo_pago: MetodoPago;
          monto_usd: number;
          monto_ves: number;
          banco_origen?: string | null;
          telefono_origen?: string | null;
          referencia?: string | null;
          comprobante_url?: string | null;
          billete_pago_usd?: number | null;
          vuelto_calculado_usd?: number | null;
          estado?: EstadoPago;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          metodo_pago?: MetodoPago;
          monto_usd?: number;
          monto_ves?: number;
          banco_origen?: string | null;
          telefono_origen?: string | null;
          referencia?: string | null;
          comprobante_url?: string | null;
          billete_pago_usd?: number | null;
          vuelto_calculado_usd?: number | null;
          estado?: EstadoPago;
          updated_at?: string;
        };
      };
      pedido_mensajes: {
        Row: {
          id: string;
          pedido_id: string;
          remitente_id: string | null;
          remitente_rol: RemitenteRol;
          remitente_nombre: string;
          mensaje: string;
          adjunto_url: string | null;
          tipo_mensaje: TipoMensaje;
          leido: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          remitente_id?: string | null;
          remitente_rol: RemitenteRol;
          remitente_nombre: string;
          mensaje: string;
          adjunto_url?: string | null;
          tipo_mensaje?: TipoMensaje;
          leido?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          remitente_id?: string | null;
          remitente_rol?: RemitenteRol;
          remitente_nombre?: string;
          mensaje?: string;
          adjunto_url?: string | null;
          tipo_mensaje?: TipoMensaje;
          leido?: boolean;
        };
      };
    };
  };
}

export type PedidoRow = Database['public']['Tables']['pedidos']['Row'];
export type PedidoInsert = Database['public']['Tables']['pedidos']['Insert'];
export type PedidoItemRow = Database['public']['Tables']['pedido_items']['Row'];
export type PagoPedidoRow = Database['public']['Tables']['pagos_pedido']['Row'];
export type PedidoMensajeRow = Database['public']['Tables']['pedido_mensajes']['Row'];
export type PedidoMensajeInsert = Database['public']['Tables']['pedido_mensajes']['Insert'];

export interface PedidoConDetalles extends PedidoRow {
  items: PedidoItemRow[];
  pago?: PagoPedidoRow;
  mensajes?: PedidoMensajeRow[];
  mensajes_no_leidos?: number;
}
