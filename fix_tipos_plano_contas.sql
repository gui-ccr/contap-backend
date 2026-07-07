-- =============================================================================
-- CORREÇÃO DOS TIPOS DO PLANO DE CONTAS
-- =============================================================================
-- O backend filtra por: 'ATIVO', 'PASSIVO', 'PL', 'RECEITA', 'DESPESA', 'CUSTO'
-- Os seeds anteriores inseriram com: 'Ativo', 'Passivo', 'Patrimonio Liquido', etc.
-- Este script corrige todos os registros para os valores esperados.
-- =============================================================================

DO $$
DECLARE
  v_empresa_id uuid;
  v_updated int;
BEGIN
  SELECT id INTO v_empresa_id FROM empresas ORDER BY criado_em ASC LIMIT 1;
  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma empresa encontrada.';
  END IF;

  RAISE NOTICE 'Corrigindo tipos do plano_contas para empresa: %', v_empresa_id;

  -- Ativo (qualquer variação → 'ATIVO')
  UPDATE plano_contas
  SET tipo = 'ATIVO'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE 'ativo';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de ATIVO corrigidas: %', v_updated;

  -- Passivo (qualquer variação → 'PASSIVO')
  UPDATE plano_contas
  SET tipo = 'PASSIVO'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE 'passivo';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de PASSIVO corrigidas: %', v_updated;

  -- Patrimônio Líquido (qualquer variação → 'PL')
  UPDATE plano_contas
  SET tipo = 'PL'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE ANY (ARRAY[
      'patrimonio liquido',
      'patrimônio líquido',
      'patrimônio liquido',
      'pl',
      'patrimonio_liquido'
    ]);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de PL corrigidas: %', v_updated;

  -- Receita (qualquer variação → 'RECEITA')
  UPDATE plano_contas
  SET tipo = 'RECEITA'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE 'receita%';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de RECEITA corrigidas: %', v_updated;

  -- Despesa (qualquer variação → 'DESPESA')
  UPDATE plano_contas
  SET tipo = 'DESPESA'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE 'despesa%';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de DESPESA corrigidas: %', v_updated;

  -- Custo (qualquer variação → 'CUSTO')
  UPDATE plano_contas
  SET tipo = 'CUSTO'
  WHERE empresa_id = v_empresa_id
    AND tipo ILIKE 'custo%';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RAISE NOTICE 'Contas de CUSTO corrigidas: %', v_updated;

  -- Resultado final
  RAISE NOTICE '--- Estado final do plano de contas ---';
END $$;

-- Visualizar resultado após a correção
SELECT tipo, COUNT(*) AS qtd_contas
FROM plano_contas
GROUP BY tipo
ORDER BY tipo;
