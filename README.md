# Crônicas de Valdora

RPG de turnos em HTML, CSS e JavaScript puro (sem dependências ou build tools).
Foco em **exploração de uma cidade de fantasia** e **combate por turnos**.

## Como jogar

Abra `index.html` diretamente no navegador. Não precisa de servidor.

## Estrutura do projeto

```
index.html            Estrutura das telas (menu, exploração, combate)
css/style.css         Tema visual
js/
  data/
    locations.js       Locais da cidade e suas conexões
    enemies.js          Templates de inimigos
    items.js            Itens (poções, etc.)
  ui.js                Helpers de renderização (telas, barras, log)
  player.js            Criação do jogador, XP, level up, uso de itens
  combat.js            Sistema de combate por turnos
  exploration.js       Navegação pela cidade e encontros aleatórios
  main.js              Estado global do jogo, save/load, wiring dos botões
assets/
  images/, audio/      Reservado para arte e sons futuros
```

## Estado atual (vertical slice)

- Menu inicial com Novo Jogo / Continuar (save em `localStorage`)
- Cidade de Valdora com 5 locais: Praça Central (hub), Mercado, Taverna,
  Floresta Sombria e Ruínas Antigas
- Taverna permite descansar (recupera HP/MP)
- Locais "selvagens" (Floresta, Ruínas) têm chance de encontro aleatório
- Combate por turnos com 4 ações: Atacar, Habilidade, Item, Fugir
- Sistema de XP, level up e derrota (recupera na Praça com HP baixo)

## Roadmap / próximos passos

- [ ] Mercado funcional (comprar/vender itens e equipamentos)
- [ ] Mais locais na cidade (Castelo, Guilda de Aventureiros, Esgotos)
- [ ] Sistema de equipamentos (armas, armaduras) afetando atributos
- [ ] Mais habilidades de combate e inimigos com padrões de ataque próprios
- [ ] Missões/NPCs com diálogo na cidade
- [ ] Grupo de personagens (mais de um herói em combate)
- [ ] Arte (sprites/ilustrações) e efeitos sonoros
- [ ] Tela de "Fim de Jogo" / progressão de história
