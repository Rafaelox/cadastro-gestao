-- Fix the generate_numero_recibo function
DROP FUNCTION IF EXISTS public.generate_numero_recibo();

CREATE OR REPLACE FUNCTION public.generate_numero_recibo()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number INTEGER;
  numero_recibo TEXT;
  current_year TEXT;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM now())::TEXT;
  
  -- Get the next number for the current year
  SELECT COALESCE(MAX(
    CASE 
      WHEN numero_recibo ~ '^[0-9]+/[0-9]{4}$' 
      THEN CAST(SPLIT_PART(numero_recibo, '/', 1) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_number
  FROM public.recibos
  WHERE numero_recibo LIKE '%/' || current_year;
  
  -- If no next_number found, start with 1
  IF next_number IS NULL THEN
    next_number := 1;
  END IF;
  
  -- Generate receipt number in format 000001/2025
  numero_recibo := LPAD(next_number::TEXT, 6, '0') || '/' || current_year;
  
  RETURN numero_recibo;
END;
$$;