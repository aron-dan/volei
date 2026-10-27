# 🏐 Vôlei

App web para organizar a pelada de vôlei de um grupo de amigos: confirmação de presença, sorteio de times equilibrados, avaliação entre os jogadores e cartas de jogador no estilo de jogo de futebol.

**Versão atual:** `1.0.1-alpha` · [histórico de versões](CHANGELOG.md)

## O que ele faz

- **Cartas de jogador:** cada um tem a sua, com foto, vulgo, característica (Atacante, Levantador, Versátil ou Recepção) e cinco habilidades de 0 a 99.
- **Avaliação da galera:** os jogadores dão notas de 1 a 5 uns aos outros. A carta mostra só a média; ninguém vê a nota individual de ninguém.
- **Presença:** cada jogador confirma "Vou jogar!" ou "Não vou" na própria tela.
- **Sorteio balanceado:** o manager sorteia times de força parecida, espalhando levantadores, atacantes e recepções entre eles.
- **Próxima partida:** o manager publica os times, e cada jogador vê o time dele destacado.
- **Entrada com PIN:** cada jogador entra com um PIN de 4 números, que ele mesmo cria no primeiro acesso. O manager pode resetar o PIN de qualquer um.

Funciona no celular e no computador, e não precisa instalar nada.

## Como funciona

O app é um **site estático**: não existe servidor próprio. O navegador baixa as páginas do GitHub Pages e conversa direto com o Supabase, que guarda os dados e as fotos. Toda a lógica roda no JavaScript do navegador.

```
Navegador (celular ou computador)
   │
   ├── baixa as páginas ──► GitHub Pages (este repositório, branch main)
   │                         HTML, CSS e JavaScript puros, sem build
   │
   └── lê e grava direto ─► Supabase (projeto "volei")
                             ├── Banco Postgres: players, ratings, partida, pins
                             │                   e a visão player_stats (médias)
                             └── Storage: bucket "fotos"
```

O código fica no GitHub. Tudo o que muda no dia a dia (jogadores, notas, times, PINs e fotos) fica no Supabase.

### Páginas

| Endereço | Quem usa | Para quê |
|---|---|---|
| `/` | Jogadores | Escolher a própria carta e digitar o PIN |
| `/player/` | Jogadores | Minha carta: vulgo, característica, foto, presença |
| `/player/avaliar/` | Jogadores | Dar notas aos outros |
| `/player/partida/` | Jogadores | Ver os times da próxima partida |
| `/maneger/` | Manager | Presença, sorteio, publicação, cadastro e reset de PIN |

### Estrutura do repositório

```
index.html                 tela inicial (escolher carta + PIN)
player/                    telas do jogador (carta, avaliar, partida)
maneger/                   tela de gestão
assets/app.js              código compartilhado (Supabase, identidade, PIN, cartas)
assets/foto.js             recorte e envio da foto
assets/style.css           visual comum
banco.sql                  SQL completo do banco
docs/                      guias e documentação
CHANGELOG.md               histórico de versões
```

## Documentação

| Documento | Para quem |
|---|---|
| [Guia do jogador](docs/guia-jogador.md) | Quem joga |
| [Guia do manager](docs/guia-manager.md) | Quem organiza a pelada |
| [Documentação para desenvolvedores](docs/desenvolvedores.md) | Quem vai mexer no código |
| [Instalação](docs/instalacao.md) | Quem quer montar o próprio app |

Os guias também estão em PDF, na pasta [`docs/pdf/`](docs/pdf/), para baixar.

## Quero o meu

Veja o passo a passo em [docs/instalacao.md](docs/instalacao.md). Usa só planos gratuitos do GitHub e do Supabase.

## Decisões de projeto e limites

É um projeto de hobby, e as escolhas priorizam **simplicidade e custo zero** em vez de segurança forte:

- **O PIN não é segurança de verdade.** Ele evita que alguém entre na conta errada sem querer. Quem ler o código consegue falar com o banco direto.
- **O `/maneger` não tem senha.** Divulgue só o link da raiz aos jogadores.
- **As chaves do Supabase no código são públicas** por natureza. Nunca coloque a chave secreta (`service_role`) no site.
- **Uma autenticação de verdade** (Supabase Auth) está nos planos para versões futuras.

Os detalhes e as alternativas estão na [documentação para desenvolvedores](docs/desenvolvedores.md).
