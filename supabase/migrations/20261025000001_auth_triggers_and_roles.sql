-- ============================================================================
-- MIGRACIÓN: Triggers de Autenticación, Creación de Perfiles y Roles
-- ============================================================================

-- 1. Función para manejar la creación automática de perfiles al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (
    id,
    nombre,
    telefono,
    cedula,
    direccion,
    rol
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'cedula',
    NEW.raw_user_meta_data->>'direccion',
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = COALESCE(EXCLUDED.telefono, public.perfiles.telefono),
    cedula = COALESCE(EXCLUDED.cedula, public.perfiles.cedula),
    direccion = COALESCE(EXCLUDED.direccion, public.perfiles.direccion),
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$;

-- Trigger disparado cada vez que un usuario se crea en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Función administrativa segura para promover un usuario a 'admin' o 'repartidor'
CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validar que solo un admin pueda ejecutar esta función
  IF NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Acceso denegado: Se requieren permisos de administrador';
  END IF;

  IF new_role NOT IN ('cliente', 'admin', 'repartidor') THEN
    RAISE EXCEPTION 'Rol inválido: %', new_role;
  END IF;

  UPDATE public.perfiles
  SET rol = new_role, updated_at = timezone('utc'::text, now())
  WHERE id = target_user_id;
END;
$$;
