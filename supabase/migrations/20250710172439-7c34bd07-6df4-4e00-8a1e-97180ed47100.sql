-- Mostrar todos os constraints da tabela usuarios
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.usuarios'::regclass;