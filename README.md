# 🎲 Dice - Dado Digital 3D para Jogos de Tabuleiro

Um aplicativo web (PWA) com dados 3D realistas para jogos de tabuleiro, RPG e outros jogos que necessitam de dados.

## O que é

Dice é um dado digital 3D para celular que substitui dados físicos em jogos de tabuleiro. Os dados são renderizados em 3D real usando Three.js e giram de verdade quando você rola. Suporta os dados mais comuns:

- **d4** - Dado de 4 faces (tetraedro)
- **d6** - Dado de 6 faces (cubo tradicional)
- **d8** - Dado de 8 faces (octaedro)
- **d10** - Dado de 10 faces (decaedro)
- **d12** - Dado de 12 faces (dodecaedro)
- **d20** - Dado de 20 faces (icosaedro)

## Como abrir

Acesse diretamente pelo navegador do seu celular:

**[https://kayooliveira.github.io/dice/](https://kayooliveira.github.io/dice/)**

Funciona em qualquer navegador moderno, sem necessidade de instalação.

## Instalação como App (PWA)

O Dice pode ser instalado no seu celular como um aplicativo nativo!

### Android (Chrome)
1. Acesse o site pelo Chrome
2. Um banner aparecerá perguntando se você quer instalar
3. Toque em **"Instalar"**
4. O app aparecerá na sua tela inicial

### iPhone/iPad (Safari)
1. Acesse o site pelo Safari
2. Toque no ícone de **compartilhar** (⬆️)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Confirme tocando em **"Adicionar"**

Após instalado, o app funciona offline e abre em tela cheia como um app nativo!

## Como funciona a rolagem

1. **Escolha o dado**: Toque em um dos botões (d4, d6, d8, d10, d12, d20) para selecionar o tipo de dado
2. **Role o dado**: Toque na área central onde aparece o dado 3D
3. **Veja o resultado**: O dado gira em 3D real e para mostrando a face com o número sorteado

### Sobre a aleatoriedade

O aplicativo usa a API `crypto.getRandomValues()` do navegador para gerar números verdadeiramente aleatórios. Cada face do dado tem exatamente a mesma probabilidade de sair, garantindo uma rolagem justa e uniforme.

Por exemplo, em um d6, cada número de 1 a 6 tem exatamente 16,67% de chance de aparecer.

### Sobre a animação 3D

O dado é um objeto 3D real renderizado com Three.js. Quando você toca para rolar:
- O dado gira em todas as direções (X, Y, Z) simultaneamente
- A rotação desacelera naturalmente como um dado real
- O dado para exatamente na face correspondente ao resultado sorteado
- A animação é suave e roda bem em celulares

## Recursos

- ✅ Dados 3D realistas com Three.js
- ✅ Animação de rolagem física e natural
- ✅ PWA instalável como app nativo
- ✅ Funciona 100% offline após primeiro carregamento
- ✅ Interface mobile-first, otimizada para uso com uma mão
- ✅ Botões grandes e fáceis de tocar
- ✅ Vibração ao completar a rolagem (em dispositivos compatíveis)

## Tecnologias

- HTML, CSS e JavaScript puros
- Three.js para renderização 3D (via CDN)
- Service Worker para funcionamento offline
- Web App Manifest para instalação como PWA

Sem frameworks de build, sem backend. Apenas arquivos estáticos servidos pelo GitHub Pages.

---

Feito com ❤️ para jogadores de tabuleiro
