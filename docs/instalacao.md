# Vôlei — Instalação (monte o seu)

Passo a passo para colocar uma cópia do app no ar, com o seu próprio banco. Leva cerca de 20 minutos e **não custa nada**: usa só planos gratuitos do GitHub e do Supabase. Não precisa instalar nada no computador.

> Os nomes de menus do GitHub e do Supabase mudam de vez em quando. Se algo não estiver exatamente onde está escrito, procure um item com nome parecido.

## O que você vai precisar

- Uma conta no [GitHub](https://github.com) (guarda o site).
- Uma conta no [Supabase](https://supabase.com) (guarda jogadores, notas e fotos).

## 1. Copiar o repositório

1. Abra o repositório original: `github.com/aron-dan/volei`.
2. Clique em **Fork** e crie a cópia na sua conta.
3. O repositório precisa ficar **público**: o GitHub Pages gratuito exige isso.

## 2. Criar o banco no Supabase

1. No Supabase, crie um **New project**. O nome pode ser `volei`. Guarde a senha do banco em algum lugar, mas o app não usa ela.
2. Espere o projeto terminar de ser criado (1 a 2 minutos).
3. Abra o **SQL Editor** e crie uma consulta nova.
4. Abra o arquivo [`banco.sql`](../banco.sql) deste repositório, copie **tudo** e cole no SQL Editor.
5. Clique em **Run**. Deve aparecer *Success*. Rode **uma vez só**: rodar de novo dá erro de "já existe".

Isso cria as tabelas (`players`, `ratings`, `partida`, `pins`), a visão `player_stats` com as médias e o bucket `fotos`.

## 3. Pegar as duas chaves do projeto

Em **Project Settings**, procure **API** (ou **API Keys**) e copie:

- **Project URL**: parece com `https://xxxxxxxx.supabase.co`.
- **Chave pública** (*publishable* ou *anon*): começa com `sb_publishable_...` ou `eyJ...`.

> **Nunca use a chave secreta** (`secret` ou `service_role`). Ela dá controle total sobre o banco e **não pode** entrar no site, porque o repositório é público.

## 4. Colocar as chaves no código

1. No seu repositório no GitHub, abra o arquivo `assets/app.js`.
2. Clique no lápis (**Edit**). As duas primeiras linhas são:

   ```js
   const SUPABASE_URL = '...';
   const SUPABASE_KEY = '...';
   ```

3. Troque pelos seus valores (mantenha as aspas e o `;`).
4. Clique em **Commit changes**.

## 5. Ligar o GitHub Pages

1. No seu repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Em **Branch**, escolha `main` e a pasta `/ (root)`. Salve.
4. Espere cerca de 1 minuto. O endereço aparece na mesma tela:

   ```
   https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
   ```

## 6. Cadastrar os jogadores

1. Abra o endereço do passo 5 seguido de `/maneger/`.
2. Na seção **Cadastro de jogadores**, preencha **Vulgo** e/ou **Nome** e toque em **Adicionar**, um jogador por vez.
3. Antes de cadastrar, confira o campo **PIN de reset** (começa em `0000`). Todo jogador novo nasce com esse PIN.

## 7. Primeiro acesso dos jogadores

1. Mande aos jogadores o link **da raiz** (sem `/maneger`).
2. Cada um toca na própria carta e digita o PIN de reset (`0000`, se você não mudou).
3. O app pede um PIN novo de 4 números e a confirmação. Esse passa a ser o PIN dele.
4. Se alguém esquecer o PIN: no `/maneger`, botão **Reset PIN** na linha dele. Ele entra com o PIN de reset e cria um novo.

## 8. Teste rápido: deu certo?

- [ ] A tela inicial mostra as cartas e a versão no rodapé.
- [ ] Ao tocar numa carta, pede o PIN.
- [ ] Depois de criar o PIN, abre a tela **Minha carta**.
- [ ] No `/maneger`, marcar jogadores, sortear e publicar funciona.
- [ ] Na tela do jogador, **Próxima partida** mostra os times publicados.

## Cuidados

- **O `/maneger` não tem senha.** Divulgue só o link da raiz.
- **O PIN não é segurança de verdade.** Ele evita entrar na conta errada sem querer, mas quem ler o código consegue falar com o banco direto. Serve para um grupo de amigos.
- **Projeto pausado:** o Supabase gratuito pode pausar o projeto depois de um tempo sem uso. Se o app parar de carregar, entre no painel do Supabase e retome o projeto.
- **Mudanças no site** levam cerca de 1 minuto para valer. Quem vir a versão antiga deve fechar a aba e abrir de novo.
- **Backup:** exporte as tabelas de vez em quando pelo painel do Supabase.

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Tela inicial fica em "Carregando..." ou dá erro | URL ou chave erradas no `assets/app.js`, ou projeto pausado | Confira os passos 3 e 4; veja se o projeto está ativo |
| Página 404 ao abrir o endereço | Pages ainda não publicou, ou configuração errada | Espere 1 a 2 minutos; confira o passo 5 |
| `relation already exists` ao rodar o SQL | O `banco.sql` já foi rodado | Não rode de novo |
| Cartas aparecem, mas o PIN sempre dá "errado" | O jogador foi criado direto pelo SQL e não tem linha em `pins` | No `/maneger`, use **Reset PIN** nele |
| Erro ao enviar foto | Bucket `fotos` não foi criado | Confira se o passo 2 rodou até o fim |

## Como mexer depois

O documento [`desenvolvedores.md`](desenvolvedores.md) explica como o código funciona e traz receitas para as mudanças mais comuns (cores da carta, textos das notas, tamanho do time, novas características).
