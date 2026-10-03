(function() {
    'use strict';

    let currentSides = 6;
    let isRolling = false;

    const diceElement = document.getElementById('dice');
    const diceValueElement = document.getElementById('diceValue');
    const diceArea = document.getElementById('diceArea');
    const diceButtons = document.querySelectorAll('.dice-btn');

    function getRandomInt(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return (array[0] % max) + 1;
    }

    function selectDice(sides) {
        currentSides = sides;
        
        diceButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.sides) === sides) {
                btn.classList.add('selected');
            }
        });

        diceValueElement.textContent = sides;
        
        diceElement.classList.add('bounce');
        setTimeout(() => {
            diceElement.classList.remove('bounce');
        }, 300);
    }

    function rollDice() {
        if (isRolling) return;
        
        isRolling = true;
        diceElement.classList.add('rolling');

        const rollDuration = 600;
        const flickerCount = 12;
        const flickerInterval = rollDuration / flickerCount;

        let flickerIndex = 0;
        const flickerTimer = setInterval(() => {
            diceValueElement.textContent = getRandomInt(currentSides);
            flickerIndex++;
            
            if (flickerIndex >= flickerCount) {
                clearInterval(flickerTimer);
            }
        }, flickerInterval);

        setTimeout(() => {
            const finalResult = getRandomInt(currentSides);
            diceValueElement.textContent = finalResult;
            
            diceElement.classList.remove('rolling');
            isRolling = false;

            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }, rollDuration);
    }

    diceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const sides = parseInt(btn.dataset.sides);
            selectDice(sides);
        });
    });

    diceArea.addEventListener('click', rollDice);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            rollDice();
        }
    });

    selectDice(6);
})();
