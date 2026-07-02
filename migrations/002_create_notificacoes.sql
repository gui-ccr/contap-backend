-- Criação da tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para melhorar a performance
CREATE INDEX idx_notificacoes_empresa_id ON public.notificacoes(empresa_id);
CREATE INDEX idx_notificacoes_data_criacao ON public.notificacoes(data_criacao DESC);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all actions" 
ON public.notificacoes 
FOR ALL 
USING (true);
