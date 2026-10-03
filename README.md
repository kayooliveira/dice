# Dice

Dado 3D para jogos de tabuleiro. Funciona no celular, pode ser instalado e rola d6, d8, d10, d12 e d20.

**https://kayooliveira.github.io/dice/**

## Como usar

1. Escolha o dado no seletor (D6 a D20).
2. Toque no dado para rolar.
3. O dado gira e para com a face sorteada exatamente de frente para a tela. O número se lê nessa face.

Cada face tem a mesma chance. O sorteio usa `crypto.getRandomValues`.

## Instalar

No Android, o aviso no topo oferece a instalação. No iPhone, use o Safari: compartilhar e Adicionar à Tela de Início. O aviso pode ser fechado.

## Código

- `index.html` — estrutura da página
- `css/app.css` — estilos dos componentes
- `js/app.js` — seleção do dado, toque e instalação
- `js/dice.js` — geometria, materiais, luz e rolagem 3D

Não há etapa de build. O GitHub Pages publica a raiz do branch `current`.
