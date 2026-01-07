-- ============================================
-- FRANCA INSIGHTS - Dados de Teste
-- Execute APENAS em ambiente de desenvolvimento
-- ============================================

-- Cliente de teste 1
INSERT INTO clients (id, name, company_name, phone, email, start_date, segment, total_points)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Maria Silva',
  'Clínica Odonto Sorriso',
  '5567988881111',
  'maria@clinicasorriso.com',
  '2024-06-01',
  'Dentista',
  85
);

-- Cliente de teste 2
INSERT INTO clients (id, name, company_name, phone, email, start_date, segment, total_points)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'João Santos',
  'Advocacia Santos & Associados',
  '5567988882222',
  'joao@santosadvocacia.com',
  '2024-03-01',
  'Advogado',
  150
);

-- Registros mensais para Maria (últimos 6 meses)
INSERT INTO monthly_records (client_id, year, month, revenue, sales_count, ticket_average) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 7, 45000, 120, 375),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 8, 52000, 135, 385),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 9, 48000, 125, 384),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 10, 61000, 150, 406),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 11, 58000, 142, 408),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2024, 12, 72000, 168, 428);

-- Registros mensais para João (últimos 9 meses)
INSERT INTO monthly_records (client_id, year, month, revenue, sales_count, ticket_average) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 4, 28000, 8, 3500),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 5, 35000, 10, 3500),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 6, 32000, 9, 3555),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 7, 41000, 11, 3727),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 8, 38000, 10, 3800),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 9, 45000, 12, 3750),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 10, 52000, 13, 4000),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 11, 48000, 12, 4000),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2024, 12, 62000, 15, 4133);

-- Conquistas desbloqueadas para Maria
INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id FROM achievements WHERE code = 'first_record';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id FROM achievements WHERE code = 'growth_10';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id FROM achievements WHERE code = 'consistent_6';

-- Conquistas desbloqueadas para João
INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM achievements WHERE code = 'first_record';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM achievements WHERE code = 'growth_10';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM achievements WHERE code = 'growth_25';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM achievements WHERE code = 'record_breaker';

INSERT INTO client_achievements (client_id, achievement_id) 
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id FROM achievements WHERE code = 'consistent_6';

-- Atualizar view materializada
REFRESH MATERIALIZED VIEW client_metrics;

-- ============================================
-- Para testar login, use os telefones:
-- Maria: 5567988881111
-- João: 5567988882222
-- ============================================
