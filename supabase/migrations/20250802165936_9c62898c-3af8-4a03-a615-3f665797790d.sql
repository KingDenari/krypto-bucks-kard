-- Add missing fields to products table
ALTER TABLE public.products ADD COLUMN category TEXT DEFAULT '';

-- Check column existence and rename if needed for transactions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        ALTER TABLE public.transactions RENAME COLUMN user_id TO student_id;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'transaction_date') THEN
        ALTER TABLE public.transactions RENAME COLUMN transaction_date TO created_at;
    END IF;
END $$;