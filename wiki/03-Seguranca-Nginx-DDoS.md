# Segurança, Gateway e Prevenção de DDoS

Um dos maiores diferenciais da arquitetura do ContaUp é não confiar cegamente no tráfego da internet.
Implementamos o **Nginx** como a primeira linha de defesa antes de qualquer requisição tocar o código JavaScript.

## 1. O Problema da Exposição Direta
Historicamente, subir uma API em Node.js (Express) publicamente na porta 443 expõe o servidor a ataques de negação de serviço (DDoS). O Express é excelente para lógica de negócios, mas é lento para descartar requisições em massa, pois ele precisa processar o protocolo HTTP na "thread" principal do JavaScript.

## 2. A Solução: Nginx Rate Limiting
O Nginx foi escrito em C e desenhado para lidar com dezenas de milhares de conexões simultâneas consumindo pouquíssima memória.

### Regra Configurada (`nginx.conf`)
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
...
limit_req zone=api_limit burst=10 nodelay;
```

**Como interpretar:**
1. **Identificação**: `$binary_remote_addr` identifica o IP real do usuário.
2. **Taxa Limite (Rate)**: `5r/s` (5 requisições por segundo). Se o usuário for mais rápido que isso, ele será marcado como suspeito.
3. **Pico (Burst)**: `10`. Permite que o usuário faça até 10 requisições simultâneas em um único milissegundo (muito comum quando o Frontend carrega uma página que dispara 3 ou 4 requisições ao mesmo tempo para montar a tela do Dashboard, por exemplo).
4. **Descarte Imediato**: Se ultrapassar o burst, o Nginx não enfileira as requisições (`nodelay`), ele simplesmente as destrói e retorna imediatamente o Erro **HTTP 429 Too Many Requests**, protegendo o Node.js de travar.

## 3. Isolamento da Rede Privada (Railway)
Para evitar que hackers descubram a URL real do Node.js e façam as requisições diretamente para ele (pulando o Nginx), configuramos o ambiente da seguinte forma:

1. O serviço Node.js **não possui domínio público**.
2. O Nginx utiliza a URL interna fantasma do Railway (`http://contap-backend.railway.internal:8080`) para encaminhar as conexões lícitas.
3. Isso significa que, do ponto de vista da Internet, o Node.js não existe. Ele só pode ser contatado de dentro do container do Nginx.

## 4. Política Dinâmica de CORS (Node.js)
Embora o Nginx barre ataques de força bruta, precisamos evitar que sites de terceiros (phishing) tentem usar as APIs se passando pelo nosso Frontend.

No `app.ts` do backend, usamos o Middleware de CORS dinâmico:
- **Produção**: O Node.js checa se o cabeçalho de origem (`Origin`) é exatamente `https://contaup-techbalance.vercel.app`. Se não for, ele rejeita e o navegador do atacante bloqueia o acesso aos dados.
- **Desenvolvimento**: O CORS é aberto (`*`) para permitir que o desenvolvedor utilize o Postman, Swagger e React rodando no `localhost`.
