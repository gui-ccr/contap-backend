# Database Schema

## Table `empresas`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `nome` | `text` |  |
| `razao_social` | `text` | Nullable |
| `cnpj` | `text` | Nullable Unique |
| `criado_em` | `timestamptz` | Nullable |
| `nome_fantasia` | `text` | Nullable |

## Table `plano_contas`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `codigo` | `text` |  |
| `nome` | `text` |  |
| `tipo` | `text` |  |
| `criado_em` | `timestamptz` | Nullable |

## Table `lancamentos`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `data_lancamento` | `date` |  |
| `descricao` | `text` |  |
| `criado_em` | `timestamptz` | Nullable |

## Table `partidas`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `lancamento_id` | `uuid` |  |
| `conta_id` | `uuid` |  |
| `tipo` | `bpchar` |  |
| `valor` | `numeric` |  |
| `criado_em` | `timestamptz` | Nullable |

## Table `contas_pagar`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `descricao` | `text` |  |
| `valor` | `numeric` |  |
| `data_vencimento` | `date` |  |
| `pago` | `bool` | Nullable |
| `data_pagamento` | `date` | Nullable |
| `criado_em` | `timestamptz` | Nullable |
| `tipo` | `text` |  |
| `valor_pago` | `numeric` | Nullable |

## Table `contas_receber`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `origem` | `text` |  |
| `valor` | `numeric` |  |
| `data_previsao` | `date` |  |
| `recebido` | `bool` | Nullable |
| `data_recebimento` | `date` | Nullable |
| `criado_em` | `timestamptz` | Nullable |
| `tipo` | `text` |  |
| `valor_pago` | `numeric` | Nullable |

## Table `usuarios`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` | Nullable |
| `nome` | `text` |  |
| `email` | `text` | Unique |
| `cargo` | `text` |  |
| `ativo` | `bool` | Nullable |
| `criado_em` | `timestamptz` | Nullable |
| `foto_url` | `text` | Nullable |

## Table `funcionarios`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `nome` | `text` |  |
| `cargo` | `text` |  |
| `email` | `text` |  |
| `criado_em` | `timestamptz` | Nullable |
| `cpf_cnpj` | `text` | Nullable |
| `salario` | `numeric` | Nullable |
| `dia_pagamento` | `int4` | Nullable |
| `foto_url` | `text` | Nullable |
| `data_admissao` | `date` | Nullable |
| `config_folha` | `jsonb` | Nullable |

## Table `holerites`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `funcionario_id` | `uuid` |  |
| `mes_referencia` | `int4` |  |
| `ano_referencia` | `int4` |  |
| `salario_bruto` | `numeric` |  |
| `total_descontos` | `numeric` |  |
| `total_acrescimos` | `numeric` |  |
| `salario_liquido` | `numeric` |  |
| `detalhes` | `jsonb` |  |
| `pago` | `bool` | Nullable |
| `data_pagamento` | `date` | Nullable |
| `link_pdf_recibo` | `text` | Nullable |
| `created_at` | `timestamptz` | Nullable |

## Table `notas_fiscais`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `tipo_referencia` | `text` |  |
| `referencia_id` | `uuid` |  |
| `numero_nota` | `text` | Nullable |
| `arquivo_url` | `text` |  |
| `arquivo_nome` | `text` |  |
| `emitida_em` | `date` | Nullable |
| `criado_em` | `timestamptz` | Nullable |

## Table `cargos`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `nome` | `text` |  |
| `descricao` | `text` | Nullable |
| `criado_em` | `timestamptz` | Nullable |

## Table `notificacoes`
| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `empresa_id` | `uuid` |  |
| `titulo` | `text` |  |
| `mensagem` | `text` |  |
| `lida` | `bool` | Nullable |
| `data_criacao` | `timestamptz` | Nullable |
