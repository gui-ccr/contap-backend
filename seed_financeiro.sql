DO $$ 
DECLARE 
  v_empresa_id uuid;
BEGIN
  -- Pega a primeira empresa cadastrada no banco. 
  -- Caso tenha mais de uma, você pode substituir esta linha por: 
  -- v_empresa_id := 'seu-uuid-aqui';
  SELECT id INTO v_empresa_id FROM empresas ORDER BY criado_em ASC LIMIT 1;
  
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada no banco de dados. Por favor, crie uma empresa primeiro.';
  END IF;

  RAISE NOTICE 'Gerando dados para a empresa: %', v_empresa_id;

  -- ==========================================
  -- Opcional: Limpar dados financeiros anteriores (Descomente se quiser zerar antes)
  -- DELETE FROM contas_pagar WHERE empresa_id = v_empresa_id;
  -- DELETE FROM contas_receber WHERE empresa_id = v_empresa_id;
  -- ==========================================

  -- ==========================================
  -- 1. CONTAS A PAGAR (DESPESAS)
  -- ==========================================
  
  -- ALUGUEL E CONDOMÍNIO (Fixo todo mês - Dia 05)
  FOR i IN 1..8 LOOP -- Jan a Agosto de 2026
    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Aluguel Sala Comercial', 2500.00, make_date(2026, i, 5), 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN make_date(2026, i, 5) ELSE null END, 
      now(), 'Fixa', 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN 2500.00 ELSE null END
    );
  END LOOP;

  -- ENERGIA ELÉTRICA E INTERNET (Todo mês - Dias 10 e 15)
  FOR i IN 1..8 LOOP 
    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Conta de Energia (Enel/Light)', 350.00 + (random() * 100), make_date(2026, i, 10), 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN make_date(2026, i, 10) ELSE null END, 
      now(), 'Variável', 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN 350.00 + (random() * 100) ELSE null END
    );

    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Provedor de Internet', 150.00, make_date(2026, i, 15), 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN make_date(2026, i, 15) ELSE null END, 
      now(), 'Fixa', 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN 150.00 ELSE null END
    );
  END LOOP;

  -- FOLHA DE PAGAMENTO (Todo mês - Dia 05)
  FOR i IN 1..8 LOOP
    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Folha de Pagamento - Funcionários', 12500.00, make_date(2026, i, 5), 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN make_date(2026, i, 5) ELSE null END, 
      now(), 'Folha', 
      CASE WHEN make_date(2026, i, 5) < CURRENT_DATE THEN 12500.00 ELSE null END
    );
  END LOOP;

  -- IMPOSTOS E TAXAS (Simples Nacional / DAS - Dia 20)
  FOR i IN 1..8 LOOP
    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'DAS - Simples Nacional', 1850.50 + (random() * 500), make_date(2026, i, 20), 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN make_date(2026, i, 20) ELSE null END, 
      now(), 'Imposto', 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN 1850.50 + (random() * 500) ELSE null END
    );
  END LOOP;

  -- SERVIÇOS E ASSINATURAS (AWS, GitHub, Google Workspace, SaaS)
  FOR i IN 1..8 LOOP
    INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Google Workspace & AWS', 800.00, make_date(2026, i, 12), 
      CASE WHEN make_date(2026, i, 12) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 12) < CURRENT_DATE THEN make_date(2026, i, 12) ELSE null END, 
      now(), 'Fixa', 
      CASE WHEN make_date(2026, i, 12) < CURRENT_DATE THEN 800.00 ELSE null END
    );
  END LOOP;

  -- DESPESAS AVULSAS E MANUTENÇÃO
  INSERT INTO contas_pagar (id, empresa_id, descricao, valor, data_vencimento, pago, data_pagamento, criado_em, tipo, valor_pago) VALUES 
  (gen_random_uuid(), v_empresa_id, 'Manutenção Ar Condicionado', 450.00, '2026-02-14', true, '2026-02-14', now(), 'Avulsa', 450.00),
  (gen_random_uuid(), v_empresa_id, 'Compra de Monitores', 3200.00, '2026-04-22', true, '2026-04-22', now(), 'Investimento', 3200.00),
  (gen_random_uuid(), v_empresa_id, 'Consultoria Contábil Especial', 1500.00, '2026-05-10', true, '2026-05-10', now(), 'Serviços', 1500.00),
  (gen_random_uuid(), v_empresa_id, 'Brindes de Fim de Ano', 1200.00, '2026-12-10', false, null, now(), 'Avulsa', null);


  -- ==========================================
  -- 2. CONTAS A RECEBER (RECEITAS)
  -- ==========================================

  -- CONTRATOS MENSAIS / RECORRENTES (Recebimentos previsíveis)
  FOR i IN 1..8 LOOP 
    INSERT INTO contas_receber (id, empresa_id, origem, valor, data_previsao, recebido, data_recebimento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Cliente A - Contrato Mensal', 5500.00, make_date(2026, i, 10), 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN make_date(2026, i, 10) ELSE null END, 
      now(), 'Recorrente', 
      CASE WHEN make_date(2026, i, 10) < CURRENT_DATE THEN 5500.00 ELSE null END
    );

    INSERT INTO contas_receber (id, empresa_id, origem, valor, data_previsao, recebido, data_recebimento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Cliente B - Software Licenciado', 6800.00, make_date(2026, i, 15), 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN make_date(2026, i, 15) ELSE null END, 
      now(), 'Recorrente', 
      CASE WHEN make_date(2026, i, 15) < CURRENT_DATE THEN 6800.00 ELSE null END
    );

    INSERT INTO contas_receber (id, empresa_id, origem, valor, data_previsao, recebido, data_recebimento, criado_em, tipo, valor_pago)
    VALUES (
      gen_random_uuid(), v_empresa_id, 'Cliente C - Consultoria Retainer', 4200.00, make_date(2026, i, 20), 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN true ELSE false END, 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN make_date(2026, i, 20) ELSE null END, 
      now(), 'Recorrente', 
      CASE WHEN make_date(2026, i, 20) < CURRENT_DATE THEN 4200.00 ELSE null END
    );
  END LOOP;

  -- VENDAS / PROJETOS AVULSOS
  INSERT INTO contas_receber (id, empresa_id, origem, valor, data_previsao, recebido, data_recebimento, criado_em, tipo, valor_pago) VALUES
  (gen_random_uuid(), v_empresa_id, 'Projeto E-commerce (Entrada)', 9000.00, '2026-01-25', true, '2026-01-26', now(), 'Projeto', 9000.00),
  (gen_random_uuid(), v_empresa_id, 'Projeto E-commerce (Entrega)', 9000.00, '2026-03-10', true, '2026-03-15', now(), 'Projeto', 9000.00),
  (gen_random_uuid(), v_empresa_id, 'Auditoria de Sistemas (Sinal)', 5500.00, '2026-04-05', true, '2026-04-05', now(), 'Projeto', 5500.00),
  (gen_random_uuid(), v_empresa_id, 'Auditoria de Sistemas (Final)', 5500.00, '2026-05-20', true, '2026-05-22', now(), 'Projeto', 5500.00),
  (gen_random_uuid(), v_empresa_id, 'App Mobile FASE 1', 15000.00, '2026-06-15', true, '2026-06-16', now(), 'Projeto', 15000.00),
  (gen_random_uuid(), v_empresa_id, 'App Mobile FASE 2', 15000.00, '2026-08-15', false, null, now(), 'Projeto', null),
  (gen_random_uuid(), v_empresa_id, 'Treinamento In-company', 4500.00, '2026-07-28', false, null, now(), 'Serviço Avulso', null);

END $$;
