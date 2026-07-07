DO $$ 
DECLARE 
  v_empresa_id uuid;
  v_conta_caixa uuid;
  v_conta_clientes uuid;
  v_conta_fornecedores uuid;
  v_conta_salarios_pagar uuid;
  v_conta_capital uuid;
  v_conta_receita uuid;
  v_conta_despesa_salario uuid;
  v_conta_despesa_aluguel uuid;
  v_conta_despesa_energia uuid;
  v_conta_despesa_internet uuid;
  v_lanc_id uuid;
BEGIN
  -- 1. IDENTIFICA A EMPRESA
  SELECT id INTO v_empresa_id FROM empresas ORDER BY criado_em ASC LIMIT 1;
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada.';
  END IF;

  -- 2. GARANTE QUE O PLANO DE CONTAS BÁSICO EXISTA
  -- Ativo
  SELECT id INTO v_conta_caixa FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '1.1.1.01' OR nome ILIKE '%Caixa%Banco%') LIMIT 1;
  IF v_conta_caixa IS NULL THEN
    v_conta_caixa := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_caixa, v_empresa_id, '1.1.1.01', 'Caixa e Equivalentes de Caixa', 'Ativo');
  END IF;

  SELECT id INTO v_conta_clientes FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '1.1.2.01' OR nome ILIKE '%Clientes%') LIMIT 1;
  IF v_conta_clientes IS NULL THEN
    v_conta_clientes := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_clientes, v_empresa_id, '1.1.2.01', 'Clientes a Receber', 'Ativo');
  END IF;

  -- Passivo
  SELECT id INTO v_conta_fornecedores FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '2.1.1.01' OR nome ILIKE '%Fornecedores%') LIMIT 1;
  IF v_conta_fornecedores IS NULL THEN
    v_conta_fornecedores := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_fornecedores, v_empresa_id, '2.1.1.01', 'Fornecedores', 'Passivo');
  END IF;

  SELECT id INTO v_conta_salarios_pagar FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '2.1.2.01' OR nome ILIKE '%Salários%Pagar%') LIMIT 1;
  IF v_conta_salarios_pagar IS NULL THEN
    v_conta_salarios_pagar := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_salarios_pagar, v_empresa_id, '2.1.2.01', 'Salários a Pagar', 'Passivo');
  END IF;

  -- Patrimônio Líquido
  SELECT id INTO v_conta_capital FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '3.1.1.01' OR nome ILIKE '%Capital Social%') LIMIT 1;
  IF v_conta_capital IS NULL THEN
    v_conta_capital := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_capital, v_empresa_id, '3.1.1.01', 'Capital Social', 'Patrimonio Liquido');
  END IF;

  -- Receitas
  SELECT id INTO v_conta_receita FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '4.1.1.01' OR nome ILIKE '%Receita%Serviços%') LIMIT 1;
  IF v_conta_receita IS NULL THEN
    v_conta_receita := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_receita, v_empresa_id, '4.1.1.01', 'Receita de Serviços', 'Receita');
  END IF;

  -- Despesas
  SELECT id INTO v_conta_despesa_salario FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '5.1.1.01' OR nome ILIKE '%Despesa%Salários%') LIMIT 1;
  IF v_conta_despesa_salario IS NULL THEN
    v_conta_despesa_salario := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_despesa_salario, v_empresa_id, '5.1.1.01', 'Despesa com Salários', 'Despesa');
  END IF;

  SELECT id INTO v_conta_despesa_aluguel FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '5.1.2.01' OR nome ILIKE '%Aluguel%') LIMIT 1;
  IF v_conta_despesa_aluguel IS NULL THEN
    v_conta_despesa_aluguel := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_despesa_aluguel, v_empresa_id, '5.1.2.01', 'Aluguel e Condomínio', 'Despesa');
  END IF;

  SELECT id INTO v_conta_despesa_energia FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '5.1.2.02' OR nome ILIKE '%Energia%') LIMIT 1;
  IF v_conta_despesa_energia IS NULL THEN
    v_conta_despesa_energia := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_despesa_energia, v_empresa_id, '5.1.2.02', 'Energia Elétrica', 'Despesa');
  END IF;

  SELECT id INTO v_conta_despesa_internet FROM plano_contas WHERE empresa_id = v_empresa_id AND (codigo = '5.1.2.03' OR nome ILIKE '%Internet%') LIMIT 1;
  IF v_conta_despesa_internet IS NULL THEN
    v_conta_despesa_internet := gen_random_uuid();
    INSERT INTO plano_contas (id, empresa_id, codigo, nome, tipo) VALUES (v_conta_despesa_internet, v_empresa_id, '5.1.2.03', 'Internet e Comunicação', 'Despesa');
  END IF;

  -- ==========================================
  -- 3. LANÇAMENTOS MÊS PASSADO (JUNHO/2026)
  -- ==========================================
  
  -- Integralização de Capital (Para ter saldo no balanço)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-01', 'Integralização de Capital Social', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'D', 150000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_capital, 'C', 150000.00, now());

  -- Faturamento de Junho
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-15', 'Faturamento de Serviços - Junho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_clientes, 'D', 35000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_receita, 'C', 35000.00, now());

  -- Recebimento de Clientes (Parte do faturamento)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-20', 'Recebimento de Clientes - Junho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'D', 25000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_clientes, 'C', 25000.00, now());

  -- Apropriação e Pagamento de Salários (Junho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-30', 'Provisão de Folha de Pagamento - Junho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_salario, 'D', 15000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_salarios_pagar, 'C', 15000.00, now());

  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-05', 'Pagamento de Salários - Competência Anterior', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_salarios_pagar, 'D', 12000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 12000.00, now());

  -- Despesa de Aluguel (Junho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-06-05', 'Pagamento Aluguel - Junho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_aluguel, 'D', 3500.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 3500.00, now());

  -- ==========================================
  -- 4. LANÇAMENTOS MÊS ATUAL (JULHO/2026)
  -- ==========================================
  
  -- Faturamento de Julho
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-10', 'Faturamento de Serviços - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_clientes, 'D', 42000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_receita, 'C', 42000.00, now());

  -- Recebimento de Clientes
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-15', 'Recebimento de Clientes - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'D', 30000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_clientes, 'C', 30000.00, now());

  -- Provisão de Folha de Pagamento (Julho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-31', 'Provisão de Folha de Pagamento - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_salario, 'D', 15000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_salarios_pagar, 'C', 15000.00, now());

  -- Pagamento de Salários (Referente a Junho, pago no dia 5 de Julho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-05', 'Pagamento de Salários - Ref Junho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_salarios_pagar, 'D', 15000.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 15000.00, now());

  -- Despesa de Aluguel (Julho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-05', 'Pagamento Aluguel - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_aluguel, 'D', 3500.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 3500.00, now());

  -- Despesa de Energia e Internet (Julho)
  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-10', 'Pagamento Energia - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_energia, 'D', 550.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 550.00, now());

  v_lanc_id := gen_random_uuid();
  INSERT INTO lancamentos (id, empresa_id, data_lancamento, descricao, criado_em) VALUES (v_lanc_id, v_empresa_id, '2026-07-15', 'Pagamento Internet - Julho', now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_despesa_internet, 'D', 150.00, now());
  INSERT INTO partidas (id, lancamento_id, conta_id, tipo, valor, criado_em) VALUES (gen_random_uuid(), v_lanc_id, v_conta_caixa, 'C', 150.00, now());

END $$;
