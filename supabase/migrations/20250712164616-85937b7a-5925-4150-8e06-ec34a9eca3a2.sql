-- Remove the single master constraint trigger and function
DROP TRIGGER IF EXISTS enforce_single_master ON public.profiles;
DROP FUNCTION IF EXISTS public.check_single_master();

-- Update the delete_custom_user function to provide better feedback
CREATE OR REPLACE FUNCTION public.delete_custom_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Soft delete - mark as inactive
  UPDATE public.profiles 
  SET ativo = false, updated_at = now()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$;

-- Create a function to permanently delete inactive users (admin only)
CREATE OR REPLACE FUNCTION public.permanent_delete_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from profiles (this will cascade to related tables)
  DELETE FROM public.profiles WHERE id = user_id AND ativo = false;
  
  RETURN FOUND;
END;
$$;