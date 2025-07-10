-- Verificar constraints existentes
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.usuarios'::regclass AND contype = 'c';