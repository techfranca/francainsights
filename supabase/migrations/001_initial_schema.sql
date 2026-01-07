-- ============================================
-- FRANCA INSIGHTS - Migration Supabase
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: clients (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  segment TEXT,
  current_level INT DEFAULT 1,
  total_points INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- ============================================
-- TABELA: monthly_records (Registros Mensais)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  revenue DECIMAL(12,2) NOT NULL CHECK (revenue >= 0),
  sales_count INT,
  ticket_average DECIMAL(10,2),
  notes TEXT,
  highlight TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  is_locked BOOLEAN DEFAULT false,
  UNIQUE(client_id, year, month)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_records_client ON monthly_records(client_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON monthly_records(year, month);

-- ============================================
-- TABELA: achievements (Conquistas)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  points INT DEFAULT 10
);

-- ============================================
-- TABELA: client_achievements (Conquistas do Cliente)
-- ============================================
CREATE TABLE IF NOT EXISTS client_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  record_id UUID REFERENCES monthly_records(id),
  UNIQUE(client_id, achievement_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_client_achievements ON client_achievements(client_id);

-- ============================================
-- TABELA: auth_codes (Códigos OTP)
-- ============================================
CREATE TABLE IF NOT EXISTS auth_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT false
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_auth_codes_phone ON auth_codes(phone, used);

-- Limpeza automática de códigos expirados (opcional - cron job)
-- DELETE FROM auth_codes WHERE expires_at < now() - INTERVAL '1 day';

-- ============================================
-- TABELA: admin_users (Administradores)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- INSERIR CONQUISTAS PADRÃO
-- ============================================
INSERT INTO achievements (code, name, description, icon, points) VALUES
  ('first_record', 'Primeira Vez', 'Registrou seu primeiro mês', '🚀', 10),
  ('growth_10', 'Crescimento', 'Cresceu 10% ou mais em um mês', '📈', 20),
  ('growth_25', 'Decolando', 'Cresceu 25% ou mais em um mês', '🛫', 30),
  ('growth_50', 'Foguete', 'Cresceu 50% ou mais em um mês', '🚀', 50),
  ('streak_3', 'Em Chamas', '3 meses consecutivos de crescimento', '🔥', 40),
  ('streak_6', 'Imparável', '6 meses consecutivos de crescimento', '⚡', 80),
  ('record_breaker', 'Recorde', 'Bateu seu próprio recorde de faturamento', '💎', 30),
  ('consistent_6', 'Consistente', 'Registrou 6 meses seguidos', '📅', 25),
  ('consistent_12', 'Dedicado', 'Registrou 12 meses seguidos', '🏆', 50),
  ('ticket_up_20', 'Ticket de Ouro', 'Ticket médio subiu 20% ou mais', '🎫', 25),
  ('six_figures', 'Seis Dígitos', 'Faturou R$ 100.000+ em um mês', '💰', 100),
  ('first_year', 'Aniversário', 'Completou 1 ano de acompanhamento', '🎂', 50)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilita RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_codes ENABLE ROW LEVEL SECURITY;

-- Policy para clientes visualizarem próprios dados
-- (Não aplicamos RLS pois usamos service_role no backend)

-- ============================================
-- VIEW MATERIALIZADA: Métricas do Cliente
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS client_metrics AS
SELECT 
  c.id as client_id,
  c.name,
  c.company_name,
  COUNT(mr.id) as total_months,
  COALESCE(SUM(mr.revenue), 0) as total_revenue,
  COALESCE(AVG(mr.revenue), 0) as avg_monthly_revenue,
  COALESCE(MAX(mr.revenue), 0) as best_month_revenue
FROM clients c
LEFT JOIN monthly_records mr ON mr.client_id = c.id
GROUP BY c.id, c.name, c.company_name;

-- Índice na view
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_metrics_id ON client_metrics(client_id);

-- Função para atualizar a view (chamar periodicamente ou após inserts)
CREATE OR REPLACE FUNCTION refresh_client_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY client_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Atualizar pontos ao desbloquear conquista
-- ============================================
CREATE OR REPLACE FUNCTION update_client_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients 
  SET total_points = total_points + (
    SELECT points FROM achievements WHERE id = NEW.achievement_id
  )
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_points
AFTER INSERT ON client_achievements
FOR EACH ROW
EXECUTE FUNCTION update_client_points();

-- ============================================
-- CLIENTE ADMIN INICIAL (EXECUTE SEPARADAMENTE)
-- ============================================
-- Substitua os valores abaixo pelos seus dados reais

/*
-- 1. Criar cliente admin
INSERT INTO clients (name, company_name, phone, email, start_date)
VALUES ('Gabriel França', 'Franca Assessoria', '5567999999999', 'gabriel@francaassessoria.com', '2024-01-01')
RETURNING id;

-- 2. Tornar admin (use o ID retornado acima)
INSERT INTO admin_users (user_id, email)
VALUES ('ID_DO_CLIENTE_AQUI', 'gabriel@francaassessoria.com');
*/

-- ============================================
-- FIM DA MIGRATION
-- ============================================
