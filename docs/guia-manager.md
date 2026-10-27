# Vôlei — Guia do Manager

*Versão 1.0.1-alpha*

## Visão geral e acesso

O `/maneger` é a página de gestão da pelada: nela você confirma quem vai jogar, sorteia os times, publica o resultado, cadastra jogadores e reseta PINs.

- **Endereço:** `aron-dan.github.io/volei/maneger`
- **Acesso:** aberto, **sem senha**. Quem tiver o link consegue mexer, então divulgue só o link dos jogadores (a raiz do site), não o do `/maneger`.
- **Uso:** funciona no celular e no computador.

Os jogadores usam a parte `/player`, descrita no [Guia do jogador](guia-jogador.md).

## Quem vai jogar

O topo do `/maneger` mostra a carta de todos os jogadores. As cartas acesas, com um ✓, vão jogar; as apagadas não vão. O contador mostra quantos estão confirmados.

- **Marcar ou desmarcar:** toque na carta. Vale mesmo que o jogador já tenha respondido.
- **Marcar todos / Limpar:** botões acima da lista, para começar do zero ou incluir todo mundo.
- **Confirmações dos jogadores:** quando alguém toca em "Vou jogar!" ou "Não vou" na própria tela, a lista se atualiza sozinha em até 20 segundos, ou assim que você volta para a página.

Se um sorteio já estiver na tela quando alguém confirmar, ele não muda. Sorteie de novo para incluir a mudança.

## Sorteio dos times

O sorteio monta times de força parecida e espalha as características entre eles, sem repetir sempre a mesma divisão.

1. Defina os jogadores por time com os botões **−** e **+**. O padrão é 4, e o limite vai de 2 a 12.
2. Toque em **Sortear times**. O botão só habilita com 4 ou mais confirmados.
3. Veja os times com as cartas. Cada título mostra a média da nota geral do time.
4. Se não gostar, toque em **Sortear de novo**.

Como o balanceamento funciona:

- **Número de times:** total de confirmados dividido pelo tamanho escolhido, arredondado, com no mínimo 2. Os times diferem em no máximo 1 jogador.
- **Força:** o sorteio tenta deixar iguais as médias das notas dos times.
- **Características:** tenta distribuir de forma parecida levantadores, atacantes, recepções e versáteis.
- **Variedade:** entre os resultados mais equilibrados, escolhe um ao acaso.
- **Sem avaliação:** quem ainda não foi avaliado entra com nota 3 em todas as habilidades.

## Publicar os times

O sorteio só fica visível para a galera depois que você publica.

1. Faça o sorteio e fique com o resultado que quiser.
2. Toque em **Publicar para a galera**, embaixo dos times.
3. A mensagem "Publicado!" confirma. Os jogadores passam a ver os times em **Próxima partida**, cada um com o seu time destacado.

Só existe uma partida publicada por vez: publicar de novo substitui a anterior. Sortear sem publicar não muda nada para os jogadores.

## Cadastro de jogadores

O fim da página tem a seção **Cadastro de jogadores**, que mostra todos em lista com nome.

- **Adicionar:** preencha o vulgo e/ou o nome e toque em **Adicionar**. Pelo menos um dos dois é obrigatório. O jogador novo entra como "não vai jogar", sem notas e sem foto, e já nasce com o **PIN de reset** (veja abaixo).
- **Editar:** toque em **Editar**, mude vulgo e nome e toque em **Salvar** (o **×** cancela). A característica e a foto são o próprio jogador quem muda.
- **Remover:** toque em **Remover** e confirme. Isso apaga também as notas que ele deu e recebeu, o PIN e a foto dele, e **não dá para desfazer**.

O vulgo aparece em destaque na carta; o nome real fica pequeno embaixo.

## PIN dos jogadores

Cada jogador entra com um PIN de 4 números. No primeiro acesso ele é obrigado a criar o dele.

- **PIN de reset:** o campo logo acima da lista do cadastro. Ele começa em `0000` e é o PIN temporário usado em jogadores novos e nos resets. Você pode trocar quando quiser (só 4 números). A troca vale enquanto a página estiver aberta; ao recarregar, volta para `0000`.
- **Reset PIN:** botão na linha de cada jogador. Toque, confirme, e o PIN dele passa a ser o PIN de reset. No próximo acesso ele entra com esse PIN, cria um novo e pronto.
- **Esqueceu o PIN?** Use o **Reset PIN** e avise o jogador qual é o PIN temporário.
- Você **não consegue ver** o PIN que o jogador criou, só substituí-lo.

> O PIN **não é segurança de verdade**: serve para evitar que alguém entre na conta errada sem querer.

## Como a nota da carta é calculada

Os números da carta vêm só das avaliações feitas no app. As notas antigas da planilha não entram, e habilidade que ninguém avaliou ainda vale 3.

1. Cada habilidade (ataque, recepção, levantamento, saque, mobilidade) é a média das notas de 1 a 5 que os outros jogadores deram.
2. A média é convertida para a escala da carta multiplicando por 19,8. Nota 1 vira 20 e nota 5 vira 99.
3. O número grande da carta é a média dessas cinco habilidades.

Um jogador avaliado por uma só pessoa já tem carta, mas ela muda bastante a cada nova avaliação. Quanto mais gente avaliar, mais estável fica. Cada pessoa tem uma avaliação por jogador e pode refazê-la, então refazer não conta em dobro.

As notas individuais não aparecem em nenhuma tela do app.

## Manutenção

O app tem duas peças, e as duas ficam na sua conta.

| Peça | Onde fica | O que guarda |
|---|---|---|
| Site | GitHub, repositório `aron-dan/volei`, publicado pelo GitHub Pages | Páginas e visual do app |
| Dados | Supabase, projeto "volei" | Jogadores, avaliações, PINs, partida publicada e fotos |

No Supabase, as tabelas são `players`, `ratings`, `partida` e `pins`, a visão `player_stats` (médias das notas) e o armazenamento `fotos`.

Cuidados:

- **Acesso aberto:** não há login de verdade, então qualquer pessoa com o link consegue alterar dados. Isso foi escolhido de propósito por ser um grupo de amigos.
- **Chaves públicas:** a chave que está no código do site é pública por natureza. Nunca coloque a chave secreta (`service_role`) no site.
- **Projeto pausado:** projetos gratuitos do Supabase podem ser pausados após um tempo sem uso. Se o app parar de carregar, entre no painel do Supabase e retome o projeto.
- **Mudanças no site:** depois que o código é enviado ao GitHub, leva cerca de 1 minuto para valer. Quem vir uma versão antiga deve fechar a aba e abrir de novo.
