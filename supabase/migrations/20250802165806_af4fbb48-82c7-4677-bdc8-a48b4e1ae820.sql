-- Update users table to match expected schema
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grade TEXT;

-- Update transactions table to match expected schema  
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'purchase';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;