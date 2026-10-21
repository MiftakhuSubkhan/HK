-- ==============================================================
-- Skema Database Catatan Tempo Pakan (Supabase / PostgreSQL)
-- Salin dan jalankan script ini di: Supabase Dashboard -> SQL Editor
-- ==============================================================

-- 1. Tabel Pelanggan (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  village TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabel Catatan Piutang / Tempo (Debts)
CREATE TABLE IF NOT EXISTS public.debts (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  village TEXT,
  phone TEXT,
  avatar_url TEXT,
  feed_items JSONB DEFAULT '[]'::jsonb,
  total_amount BIGINT NOT NULL DEFAULT 0,
  original_amount BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'safe', -- 'due_2_days' | 'due_5_days' | 'safe' | 'paid'
  start_date DATE DEFAULT CURRENT_DATE,
  due_date_label TEXT,
  due_date DATE,
  notes TEXT,
  photo_url TEXT,
  payment_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  paid_at TIMESTAMPTZ
);

-- 3. Indeks untuk performa pencarian cepat
CREATE INDEX IF NOT EXISTS idx_debts_customer_name ON public.debts (customer_name);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts (status);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts (due_date);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON public.debts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (name);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama jika ada
DROP POLICY IF EXISTS "Akses Publik Pelanggan" ON public.customers;
DROP POLICY IF EXISTS "Akses Publik Piutang" ON public.debts;

-- Buat policy agar aplikasi dapat membaca dan menulis data
CREATE POLICY "Akses Publik Pelanggan" ON public.customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Akses Publik Piutang" ON public.debts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Aktifkan Realtime Replication (agar perubahan sinkron langsung ke semua HP / Laptop)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
