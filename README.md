# Dice

Dados 3D para jogos de tabuleiro. Funciona no celular, pode ser instalado e rola de 1 a 4 dados d6, d8, d12 ou d20.

**https://kayooliveira.github.io/dice/**

## Como usar

1. Escolha o tipo no seletor: D6, D8, D12 ou D20.
2. Escolha a quantidade: 1, 2, 3 ou 4. O 2 serve, por exemplo, para o Banco Imobiliário.
3. Toque na área dos dados para rolar todos de uma vez.
4. Cada dado gira e para com a face sorteada exatamente de frente para a tela, com o número em pé.
5. Com um dado, o resultado fica só na face. Com dois ou mais, cada valor aparece e a soma total fica ao lado.

Todos os dados de uma rolagem usam o mesmo tipo. Cada face tem a mesma chance. O sorteio usa `crypto.getRandomValues`.

## Instalar

No Android, o aviso no topo oferece a instalação. No iPhone, use o Safari: compartilhar e Adicionar à Tela de Início. O aviso pode ser fechado.

## Código

- `index.html` — estrutura da página
- `css/app.css` — estilos dos componentes
- `js/app.js` — quantidade, tipo, soma, toque e instalação
- `js/dice.js` — geometria, materiais, luz e rolagem 3D

Não há etapa de build. O GitHub Pages publica a raiz do branch `current`.
