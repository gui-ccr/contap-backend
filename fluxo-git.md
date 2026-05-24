## 🚀 Fluxo de Trabalho da Equipe (Como enviar seu código)

Nossa regra de ouro: **NUNCA comite diretamente na branch `main`**. A `main` é sagrada e só recebe código testado e aprovado pelo tech lead (Guilherme). 

Sempre que for começar uma nova tarefa, siga exatamente este passo a passo:

### Passo 1: Atualize sua máquina
Antes de começar qualquer coisa, garanta que você está na `main` e puxe o código mais recente que a equipe já aprovou.
```bash
git checkout main
git pull origin main
```

### Passo 2: Crie a sua "Ilha Isolada" (Sua Branch)
Crie uma ramificação só sua para trabalhar sem quebrar o código dos outros. Use os prefixos feat/ para novidades, fix/ para bugs ou docs/ para textos.

```bash
git checkout -b feat/nome-da-sua-tarefa
```
# Exemplo: git checkout -b feat/tela-login


### Passo 3: Trabalhe e Salve (Commits)
Escreva seu código normalmente. Quando terminar uma parte lógica, salve criando um histórico:

```bash 
git add .
git commit -m "Descreva o que você fez aqui"
```

### Passo 4: Envie sua branch para o github
Terminou a tarefa? Envie a sua branch lá para o GitHub. (Atenção: o nome da branch aqui tem que ser o mesmo que você criou no Passo 2!)

```bash 
git push origin feat/nome-da-sua-tarefa
```

### Passo 5: Peça permissão para juntar (Pull Request - PR)

1. Abra a página do nosso repositório no GitHub.
2. Você verá um botão verde gigante escrito "Compare & pull request". Clique nele!
3. Coloque um título dizendo o que você fez e crie o PR.
4. A mágica: Nossos robôs vão rodar testes automáticos no seu código. Se a bolinha ficar com um "X" vermelho, arrume o código na sua máquina e dê push de novo. Se ficar com um "Check" verde (✓), avise o Tech Lead para ele aprovar corrigir e juntar seu código na main!