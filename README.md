# Crônicas de Valdora

RPG de turnos multiplayer: exploração de uma cidade de fantasia e combate por turnos,
com contas de jogador, personagens sorteados e um painel de administração.

## Como rodar

```bash
cd server
npm install
npm start
```

Abra `http://localhost:3000` no navegador. O servidor Express serve tanto a API quanto
o cliente (pasta `client/`).

Para criar a primeira conta de administrador, defina a variável de ambiente
`ADMIN_SIGNUP_CODE` antes de iniciar o servidor e informe esse mesmo código no campo
"Código de Admin" da tela de cadastro:

```bash
ADMIN_SIGNUP_CODE=escolha-um-codigo-secreto npm start
```

Sem essa variável definida, todo cadastro novo vira jogador comum.

## Estrutura do projeto

```
client/                Frontend (HTML/CSS/JS puro)
  index.html
  css/style.css          Tema visual
  css/animations.css     Animações (partículas, transições, dano flutuante)
  js/api.js               Wrapper de fetch com autenticação
  js/state.js              Estado global do app (token, usuário, personagem, dados do jogo)
  js/ui.js                 Helpers de interface (telas, barras, toasts, animações)
  js/audio.js              Música de fundo (arquivo próprio ou ambiente sintetizado)
  js/screens/              Telas: auth, criação de personagem, lobby, locais, combate, perfil, eventos, admin
  assets/audio/            Coloque um bgm.mp3 aqui para tocar como música de fundo

server/                 Backend (Node.js + Express + SQLite)
  src/server.js           Ponto de entrada, monta rotas e serve o client
  src/db.js                Schema do banco (SQLite via node:sqlite)
  src/combatEngine.js      Estado de combate em memória e cálculos
  src/data/                Raças, classes, destinos, inimigos, itens, locais, leveling
  src/middleware/auth.js   JWT + verificação de banimento
  src/routes/              auth, character, location, combat, shop, training, hospital, events, admin, guild, pvp, meta
  data/valdora.db          Banco SQLite (gerado automaticamente, ignorado pelo git)
```

## Sistema de personagem

Ao criar a conta, o jogador define nome, idade e sexo. Raça, classe e destino são
sorteados automaticamente pelo servidor (para impedir trapaça) e definem os atributos
finais, com uma pequena animação de revelação no cliente.

- **Raças**: Humano, Elfo, Anão, Orc, Halfling, Sangue das Sombras
- **Classes**: Guerreiro, Mago, Ladino, Clérigo, Caçador, Bárbaro
- **Destinos**: traço narrativo sorteado com um efeito passivo leve (Órfão de Guerra,
  Sangue Nobre, Marcado pelos Deuses, Fugitivo, Sobrevivente da Praga, Escolhido da Profecia)

## Cidade de Valdora

Praça Central (hub) conecta a Taverna (descanso), Loja (consumíveis), Ferreiro
(equipamentos), Centro de Treinamento (pontos de atributo), Guilda de Aventureiros
(ranking), Arena PvP (duelos simulados contra outros jogadores), Hospital (cura
completa + status) e as áreas selvagens Floresta Sombria / Ruínas Antigas (combate
aleatório).

## Painel de Administração

Contas com `role: admin` veem uma aba extra no lobby para:
- Criar, encerrar e excluir eventos (com recompensas em ouro/XP, visíveis a todos os jogadores)
- Listar jogadores e aplicar punições (aviso, mute, ban temporário ou permanente) com motivo registrado

## Limitações atuais / roadmap

- Banco SQLite local (arquivo único) — bom para rodar sozinho ou em rede local; para
  hospedar publicamente com muitos jogadores, considerar migrar para Postgres
- Combate ativo fica em memória do servidor (se o servidor reiniciar no meio de uma
  luta, essa luta se perde — o personagem não)
- PvP é uma simulação automática (não em tempo real), pensada para poucos cliques
- Guilda/Arena são funcionais mas simples; dá pra evoluir com contratos de quest reais,
  matchmaking por nível, chat entre jogadores, etc.
