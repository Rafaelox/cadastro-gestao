-- Update create_custom_user to allow multiple masters
CREATE OR REPLACE FUNCTION public.create_custom_user(
  user_name text, 
  user_email text, 
  user_password text, 
  user_permission text DEFAULT 'user'::text, 
  user_consultor_id bigint DEFAULT NULL::bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate new ID
  new_user_id := gen_random_uuid();
  
  -- Insert into profiles (removed master check)
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    senha_temp,
    permissao,
    ativo,
    consultor_id
  ) VALUES (
    new_user_id,
    user_name,
    user_email,
    user_password,
    user_permission,
    true,
    user_consultor_id
  );
  
  RETURN new_user_id;
END;
$$;