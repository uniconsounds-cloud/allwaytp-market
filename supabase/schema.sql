-- ============================================================
-- AllwayTP EA Marketplace Database Schema
-- Compatible with Supabase PostgreSQL
-- ============================================================

-- 1. Table: eas (Master list of Expert Advisors)
CREATE TABLE IF NOT EXISTS public.eas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    pair TEXT DEFAULT 'XAUUSD',
    timeframe TEXT DEFAULT 'M15',
    min_deposit NUMERIC DEFAULT 100,
    currency_type TEXT DEFAULT 'USD', -- 'USD' or 'CENT'
    recommended_broker TEXT DEFAULT 'Versus Trade',
    download_url TEXT,
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: licenses (Account-level EA permissions & Telemetry)
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ea_code TEXT NOT NULL REFERENCES public.eas(code) ON UPDATE CASCADE ON DELETE RESTRICT,
    account_number TEXT NOT NULL,
    broker_server TEXT NOT NULL DEFAULT 'VersusTrade-Live',
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED', 'EXPIRED')),
    expires_at TIMESTAMPTZ, -- NULL = lifetime or active until revoked
    approved_by TEXT,
    notes TEXT,
    
    -- Telemetry & Portfolio Tracking fields (Updated periodically via Heartbeat)
    balance NUMERIC DEFAULT 0,
    equity NUMERIC DEFAULT 0,
    floating_pnl NUMERIC DEFAULT 0,
    free_margin NUMERIC DEFAULT 0,
    account_currency TEXT DEFAULT 'USD',
    leverage INT DEFAULT 100,
    open_orders_count INT DEFAULT 0,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    ping_count INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_license_account_ea UNIQUE (ea_code, account_number, broker_server)
);

-- In case licenses table already exists, add telemetry columns safely:
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS equity NUMERIC DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS floating_pnl NUMERIC DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS free_margin NUMERIC DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS account_currency TEXT DEFAULT 'USD';
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS leverage INT DEFAULT 100;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS open_orders_count INT DEFAULT 0;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS ping_count INT DEFAULT 0;

-- 3. Table: license_logs (Audit trail for verification checks from MQL)
CREATE TABLE IF NOT EXISTS public.license_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
    account_number TEXT NOT NULL,
    ea_code TEXT NOT NULL,
    broker_server TEXT,
    ip_address TEXT,
    status_result TEXT NOT NULL, -- 'AUTHORIZED', 'REJECTED_REVOKED', 'REJECTED_EXPIRED', 'NOT_FOUND'
    client_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for ultra-fast verification lookups & telemetry monitoring
CREATE INDEX IF NOT EXISTS idx_licenses_lookup 
ON public.licenses (account_number, ea_code, broker_server, status);

CREATE INDEX IF NOT EXISTS idx_licenses_last_seen 
ON public.licenses (last_seen_at);

CREATE INDEX IF NOT EXISTS idx_license_logs_account 
ON public.license_logs (account_number, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.eas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for active EAs
CREATE POLICY "Public read active EAs" 
ON public.eas FOR SELECT USING (is_active = TRUE);

-- Anon users can submit license registration requests
CREATE POLICY "Anon insert license requests"
ON public.licenses FOR INSERT WITH CHECK (status = 'PENDING');

-- Insert Initial Seed Data for the 3 EAs
INSERT INTO public.eas (code, name, description, pair, timeframe, min_deposit, currency_type, version)
VALUES
    (
        'RECON_100', 
        'Recon AiAuto100', 
        'EA เริ่มต้นสำหรับทดลองระบบและเรียนรู้การทำงาน ออกแบบเพื่อความเสถียรและควบคุมความเสี่ยงอย่างรัดกุม', 
        'XAUUSD / Forex', 
        'M15', 
        100, 
        'USD', 
        '1.0.0'
    ),
    (
        'RANGER_500', 
        'Ranger AiAuto500', 
        'EA เทรดทองคำสำหรับพอร์ต Cent ออกแบบมาเพื่อเน้นการสะสมกำไรและการจัดการ Drawdown ที่ยืดหยุ่น', 
        'XAUUSD', 
        'M15', 
        500, 
        'CENT', 
        '1.0.0'
    ),
    (
        'DELTA_1500', 
        'Delta AiAuto1500', 
        'EA เทรดทองคำสำหรับพอร์ต Dollar ประสิทธิภาพสูง อัลกอริทึมจัดการความเสี่ยงขั้นสูงสำหรับนักลงทุนมืออาชีพ', 
        'XAUUSD', 
        'H1', 
        1500, 
        'USD', 
        '1.0.0'
    )
ON CONFLICT (code) DO NOTHING;
