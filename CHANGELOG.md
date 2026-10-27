# Histórico de versões

Formato do número: `MAIOR.MENOR.PATCH-fase`. Exemplo: `1.0.1-alpha`.

- **PATCH** (o último número): correção ou ajuste pequeno, como o PIN da `1.0.1`.
- **MENOR**: funcionalidade nova.
- **MAIOR**: mudança grande, que altera o jeito de usar.
- **fase** (`alpha`): ainda em teste, sem garantia de estabilidade.

## 1.0.1-alpha — 27/10/2026

Patch de segurança. Objetivo: ninguém cair na conta de outra pessoa sem querer.

- **Entrada com PIN de 4 números.** Todo jogador entra com PIN, e no primeiro acesso é obrigado a criar o dele.
- **Reset de PIN no `/maneger`:** botão por jogador, com um PIN temporário definido pelo manager. O jogador entra com ele e cria um novo.
- Jogador novo cadastrado no `/maneger` já nasce com o PIN de reset.
- O endereço `player/?id=...` não entra mais sozinho: o id só vale depois de passar pelo PIN.
- A versão aparece no rodapé da tela inicial.
- Banco: nova tabela `pins` (`player_id`, `pin`, `definido`).
- Documentação passa a morar no repositório: `README.md`, `banco.sql` e a pasta `docs/`.

> O PIN **não é segurança de verdade**. Uma autenticação real está nos planos para versões futuras.

## 1.0.0-alpha

Primeira versão completa.

- Escolha da carta pelo nome, sem senha.
- Cartas de jogador com foto (recorte manual com arrastar e zoom), vulgo, característica e cinco habilidades.
- Avaliação entre os jogadores (notas de 1 a 5); a carta mostra a média.
- Confirmação de presença pelo próprio jogador.
- Sorteio de times balanceados no `/maneger`, com publicação para os jogadores.
- Tela da próxima partida, com o time do jogador em destaque.
- Cadastro de jogadores no `/maneger`.

## Como lançar uma versão nova

1. Faça as mudanças no código.
2. Se mexeu em algum arquivo de `assets/`, aumente o número `?v=` dele **em todas as páginas** que o carregam, no mesmo commit (senão o celular dos jogadores continua com a versão velha).
3. Troque o texto da constante `VERSAO` no `assets/app.js` (e aumente o `?v=` do `app.js`).
4. Acrescente a versão aqui, no topo, com a data e o que mudou.
5. Faça o commit e o `git push` na `main`.
