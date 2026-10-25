-- ============================================================================
-- MIGRACIÓN: Trigger Robusto de Autenticación con ON CONFLICT y Coalesce Seguro
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
  v_telefono TEXT;
  v_cedula TEXT;
  v_direccion TEXT;
  v_rol TEXT;
BEGIN
  -- Extraer de forma tolerante a múltiples nombres de claves en raw_user_meta_data
  v_nombre := COALESCE(
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'nombre_completo',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  v_telefono := COALESCE(
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'phone',
    ''
  );

  v_cedula := COALESCE(
    NEW.raw_user_meta_data->>'cedula',
    NEW.raw_user_meta_data->>'cedula_rif',
    NEW.raw_user_meta_data->>'rif',
    ''
  );

  v_direccion := COALESCE(
    NEW.raw_user_meta_data->>'direccion',
    NEW.raw_user_meta_data->>'address',
    ''
  );

  v_rol := COALESCE(
    NEW.raw_user_meta_data->>'rol',
    'cliente'
  );

  INSERT INTO public.perfiles (
    id,
    nombre,
    telefono,
    cedula,
    direccion,
    rol,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_nombre,
    v_telefono,
    v_cedula,
    v_direccion,
    v_rol,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    telefono = CASE WHEN EXCLUDED.telefono <> '' THEN EXCLUDED.telefono ELSE public.perfiles.telefono END,
    cedula = CASE WHEN EXCLUDED.cedula <> '' THEN EXCLUDED.cedula ELSE public.perfiles.cedula END,
    direccion = CASE WHEN EXCLUDED.direccion <> '' THEN EXCLUDED.direccion ELSE public.perfiles.direccion END,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Evitar que un fallo impida la creación del usuario en auth.users
  RAISE WARNING 'Error en handle_new_user para usuario %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
