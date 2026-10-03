# 🎲 Dice - Dado Digital para Jogos de Tabuleiro

Um aplicativo web simples e elegante para rolar dados em jogos de tabuleiro, RPG e outros jogos que necessitam de dados.

## O que é

Dice é um dado digital para celular que substitui dados físicos em jogos de tabuleiro. Suporta os dados mais comuns:

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

> **Nota para o administrador:** Para publicar o site, habilite o GitHub Pages em:
> Settings → Pages → Source: "GitHub Actions"

### Dica: Adicionar à tela inicial

No seu celular, você pode adicionar o app à tela inicial para acesso rápido:
- **iPhone**: Safari → Compartilhar → Adicionar à Tela de Início
- **Android**: Chrome → Menu (⋮) → Adicionar à tela inicial

## Como funciona a rolagem

1. **Escolha o dado**: Toque em um dos botões (d4, d6, d8, d10, d12, d20) para selecionar o tipo de dado
2. **Role o dado**: Toque na área central onde aparece o dado
3. **Veja o resultado**: O dado gira com uma animação realista e para mostrando o número sorteado

### Sobre a aleatoriedade

O aplicativo usa a API `crypto.getRandomValues()` do navegador para gerar números verdadeiramente aleatórios. Cada face do dado tem exatamente a mesma probabilidade de sair, garantindo uma rolagem justa e uniforme.

Por exemplo, em um d6, cada número de 1 a 6 tem exatamente 16,67% de chance de aparecer.

## Recursos

- ✅ Interface mobile-first, otimizada para uso com uma mão
- ✅ Botões grandes e fáceis de tocar
- ✅ Animação de rolagem natural
- ✅ Vibração ao completar a rolagem (em dispositivos compatíveis)
- ✅ Sem dependências, sem instalação
- ✅ Funciona offline após primeiro carregamento

## Tecnologias

HTML, CSS e JavaScript puros. Sem frameworks, sem build, sem backend.

---

Feito com ❤️ para jogadores de tabuleiro
