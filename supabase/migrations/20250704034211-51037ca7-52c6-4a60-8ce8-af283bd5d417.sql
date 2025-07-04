
-- Add account_email column to all tables to support multi-tenant data storage
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_email TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS account_email TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS account_email TEXT;
ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS account_email TEXT;
ALTER TABLE public.exchange_rates ADD COLUMN IF NOT EXISTS account_email TEXT;

-- Create indexes for better performance on account-based queries
CREATE INDEX IF NOT EXISTS idx_users_account_email ON public.users(account_email);
CREATE INDEX IF NOT EXISTS idx_products_account_email ON public.products(account_email);
CREATE INDEX IF NOT EXISTS idx_transactions_account_email ON public.transactions(account_email);
CREATE INDEX IF NOT EXISTS idx_receipts_account_email ON public.receipts(account_email);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_account_email ON public.exchange_rates(account_email);
