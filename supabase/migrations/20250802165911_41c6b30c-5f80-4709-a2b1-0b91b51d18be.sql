-- Add missing fields to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- Update transactions table to use proper field names
ALTER TABLE public.transactions RENAME COLUMN IF EXISTS user_id TO student_id;
ALTER TABLE public.transactions RENAME COLUMN IF EXISTS transaction_date TO created_at;