DO $$
DECLARE
  v_empresa_id uuid;

  -- Ativo Circulante
  v_caixa          uuid;
  v_aplicacoes     uuid;
  v_estoque        uuid;
  v_adiantamentos  uuid;

  -- Ativo Não Circulante
  v_moveis         uuid;
  v_equipamentos   uuid;
  v_veiculos       uuid;
  v_software       uuid;

  -- Contrapartidas (Passivo / Caixa / Capital)
  v_caixa_banco    uuid;
  v_fornecedores   uuid;
  v_financiamentos uuid;
  v_capital        uuid;

  v_lanc_id uuid;
BEGIN
  -- Identifica a empresa
  SELECT id INTO v_empresa_id FROM empresas ORDER BY criado_em ASC LIMIT 1;
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada.';
  END IF;

  -- =============================================
  -- 1. GARANTE CONTAS NO PLANO DE CONTAS
  -- =============================================

  -- Caixa (já pode existir do seed_contabilidade.sql)
  SELECT id INTO v_caixa_banco FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.1.1.01' LIMIT 1;
  IF v_caixa_banco IS NULL THEN
    v_caixa_banco := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_caixa_banco, v_empresa_id, '1.1.1.01', 'Caixa e Equivalentes de Caixa', 'Ativo');
  END IF;

  -- Ativo Circulante: Aplicações Financeiras
  SELECT id INTO v_aplicacoes FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.1.3.01' LIMIT 1;
  IF v_aplicacoes IS NULL THEN
    v_aplicacoes := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_aplicacoes, v_empresa_id, '1.1.3.01', 'Aplicações Financeiras de Curto Prazo', 'Ativo');
  END IF;

  -- Ativo Circulante: Estoques
  SELECT id INTO v_estoque FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.1.4.01' LIMIT 1;
  IF v_estoque IS NULL THEN
    v_estoque := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_estoque, v_empresa_id, '1.1.4.01', 'Estoque de Materiais e Suprimentos', 'Ativo');
  END IF;

  -- Ativo Circulante: Adiantamentos a Fornecedores
  SELECT id INTO v_adiantamentos FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.1.5.01' LIMIT 1;
  IF v_adiantamentos IS NULL THEN
    v_adiantamentos := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_adiantamentos, v_empresa_id, '1.1.5.01', 'Adiantamentos a Fornecedores', 'Ativo');
  END IF;

  -- Ativo Não Circulante: Móveis e Utensílios
  SELECT id INTO v_moveis FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.2.1.01' LIMIT 1;
  IF v_moveis IS NULL THEN
    v_moveis := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_moveis, v_empresa_id, '1.2.1.01', 'Móveis e Utensílios', 'Ativo');
  END IF;

  -- Ativo Não Circulante: Equipamentos de Informática
  SELECT id INTO v_equipamentos FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.2.1.02' LIMIT 1;
  IF v_equipamentos IS NULL THEN
    v_equipamentos := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_equipamentos, v_empresa_id, '1.2.1.02', 'Equipamentos de Informática', 'Ativo');
  END IF;

  -- Ativo Não Circulante: Veículos
  SELECT id INTO v_veiculos FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.2.1.03' LIMIT 1;
  IF v_veiculos IS NULL THEN
    v_veiculos := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_veiculos, v_empresa_id, '1.2.1.03', 'Veículos', 'Ativo');
  END IF;

  -- Ativo Não Circulante: Software / Intangível
  SELECT id INTO v_software FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '1.2.2.01' LIMIT 1;
  IF v_software IS NULL THEN
    v_software := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_software, v_empresa_id, '1.2.2.01', 'Software e Licenças (Intangível)', 'Ativo');
  END IF;

  -- Passivo: Fornecedores (para contrapartida do estoque)
  SELECT id INTO v_fornecedores FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '2.1.1.01' LIMIT 1;
  IF v_fornecedores IS NULL THEN
    v_fornecedores := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_fornecedores, v_empresa_id, '2.1.1.01', 'Fornecedores', 'Passivo');
  END IF;

  -- Passivo: Financiamentos (para contrapartida de veículos)
  SELECT id INTO v_financiamentos FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '2.2.1.01' LIMIT 1;
  IF v_financiamentos IS NULL THEN
    v_financiamentos := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_financiamentos, v_empresa_id, '2.2.1.01', 'Financiamentos de Longo Prazo', 'Passivo');
  END IF;

  -- Capital Social
  SELECT id INTO v_capital FROM plano_contas
  WHERE empresa_id = v_empresa_id AND codigo = '3.1.1.01' LIMIT 1;
  IF v_capital IS NULL THEN
    v_capital := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo)
    VALUES (v_capital, v_empresa_id, '3.1.1.01', 'Capital Social', 'Patrimonio Liquido');
  END IF;

  -- =============================================
  -- 2. LANÇAMENTOS — ATIVO CIRCULANTE
  -- =============================================
  -- Meta: ~R$ 30.000 em circulante
  --   Aplicações Financeiras  R$ 15.000
  --   Estoque                 R$ 9.000
  --   Adiantamentos           R$ 6.000

  -- Aplicação Financeira de Curto Prazo (D: Aplicações, C: Caixa)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-06-10', 'Aplicação Financeira CDB 90 dias', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_aplicacoes,  'D', 15000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco, 'C', 15000.00, now());

  -- Compra de Estoque a Prazo (D: Estoque, C: Fornecedores)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-06-12', 'Compra de Materiais e Suprimentos - NF 001', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_estoque,      'D', 9000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_fornecedores, 'C', 9000.00, now());

  -- Adiantamento a Fornecedor (D: Adiantamentos, C: Caixa)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-07-02', 'Adiantamento para Fornecedor de TI', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_adiantamentos, 'D', 6000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco,   'C', 6000.00, now());

  -- =============================================
  -- 3. LANÇAMENTOS — ATIVO NÃO CIRCULANTE
  -- =============================================
  -- Meta: ~R$ 43.000 em não circulante
  --   Móveis e Utensílios     R$ 8.000  (pago à vista)
  --   Equipamentos Informática R$ 18.000 (pago à vista)
  --   Veículos                R$ 25.000 (financiado)
  --   Software/Licenças       R$ 8.500  (pago à vista)
  -- Total Não Circulante      = R$ 59.500

  -- Móveis e Utensílios comprados (D: Móveis, C: Caixa)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-06-03', 'Aquisição de Móveis para Escritório - NF 215', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_moveis,     'D', 8000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco, 'C', 8000.00, now());

  -- Equipamentos de Informática (D: Equipamentos, C: Caixa)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-06-05', 'Compra de Servidores e Notebooks - NF 832', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_equipamentos, 'D', 18000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco,  'C', 18000.00, now());

  -- Veículo financiado (D: Veículos, C: Caixa R$5k entrada + C: Financiamentos R$20k)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-06-15', 'Aquisição de Veículo - Entrada + Financiamento', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_veiculos,       'D', 25000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco,    'C',  5000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_financiamentos, 'C', 20000.00, now());

  -- Software e Licenças (D: Software, C: Caixa)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em)
  VALUES (v_lanc_id, v_empresa_id, '2026-07-01', 'Licença de Software ERP - NF 044', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_software,    'D', 8500.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em)
  VALUES (gen_random_uuid(), v_lanc_id, v_caixa_banco, 'C', 8500.00, now());

  -- =============================================
  -- RESUMO ESPERADO NO BALANÇO
  -- =============================================
  -- ATIVO CIRCULANTE
  --   Aplicações Financeiras    R$  15.000
  --   Estoque de Materiais      R$   9.000
  --   Adiantamentos             R$   6.000
  --   + Caixa (já existente via seed_contabilidade.sql)
  --   Subtotal Circulante     ≥  R$  30.000
  --
  -- ATIVO NÃO CIRCULANTE
  --   Móveis e Utensílios       R$   8.000
  --   Equipamentos Informática  R$  18.000
  --   Veículos                  R$  25.000
  --   Software (Intangível)     R$   8.500
  --   Subtotal Não Circulante     R$  59.500
  --
  -- TOTAL ATIVO                 ≥ R$  89.500
  -- (+ saldo de caixa remanescente do seed_contabilidade.sql)

  RAISE NOTICE 'Ativos inseridos com sucesso para a empresa %', v_empresa_id;
  RAISE NOTICE 'Total mínimo esperado em Ativos: R$ 89.500,00 + saldo de caixa';
END $$;
