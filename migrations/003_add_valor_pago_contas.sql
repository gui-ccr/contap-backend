-- Adiciona o campo valor_pago nas tabelas de contas financeiras
-- Esse campo armazenará o valor real pago/recebido caso tenha juros ou descontos.

ALTER TABLE contas_pagar ADD COLUMN IF NOT EXISTS valor_pago NUMERIC;
ALTER TABLE contas_receber ADD COLUMN IF NOT EXISTS valor_pago NUMERIC;

-- O valor pago pode ser igual ao valor original, mas só é preenchido no momento da baixa.
