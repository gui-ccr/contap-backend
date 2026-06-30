-- Tabela de Notas Fiscais
-- Vincula arquivos de NF a lançamentos de contas a pagar ou contas a receber

CREATE TABLE IF NOT EXISTS notas_fiscais (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo_referencia TEXT        NOT NULL CHECK (tipo_referencia IN ('conta_pagar', 'conta_receber')),
  referencia_id   UUID        NOT NULL,
  numero_nota     TEXT,
  arquivo_url     TEXT        NOT NULL,
  arquivo_nome    TEXT        NOT NULL,
  emitida_em      DATE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notas_fiscais_empresa     ON notas_fiscais (empresa_id);
CREATE INDEX idx_notas_fiscais_referencia  ON notas_fiscais (referencia_id);

-- Storage bucket (executar no painel Supabase > Storage ou via API)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('notas-fiscais', 'notas-fiscais', true)
-- ON CONFLICT (id) DO NOTHING;
