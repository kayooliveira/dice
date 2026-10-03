import { DiceView } from './dice.js';

const buttons = [...document.querySelectorAll('.die-picker button')];
const stage = document.getElementById('stage');
const canvas = document.getElementById('canvas');
const hint = document.getElementById('hint');

const view = new DiceView(canvas);
view.setHost(stage);

function selectSides(sides) {
    for (const button of buttons) {
        const selected = Number(button.dataset.sides) === sides;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
    }
    if (view.sides !== sides) {
        view.setSides(sides);
        hint.textContent = 'Toque no dado para rolar';
    }
}

for (const button of buttons) {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectSides(Number(button.dataset.sides));
    });
}

async function roll() {
    if (view.rolling) return;
    hint.textContent = 'Rolando';
    stage.classList.add('is-rolling');
    const value = await view.roll();
    stage.classList.remove('is-rolling');
    hint.textContent = 'Toque no dado para rolar';
    stage.dataset.result = String(value);
}

stage.addEventListener('click', roll);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        roll();
    }
});

const resize = () => view.resize();
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
requestAnimationFrame(resize);

const installAndroid = document.getElementById('install-android');
const installIos = document.getElementById('install-ios');
let deferredPrompt = null;

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!localStorage.getItem('dice-install-dismissed')) {
        installAndroid.classList.remove('hidden');
    }
});

document.getElementById('install-accept').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installAndroid.classList.add('hidden');
});

document.getElementById('install-close').addEventListener('click', () => {
    installAndroid.classList.add('hidden');
    localStorage.setItem('dice-install-dismissed', '1');
});

if (isIOS() && !isStandalone() && !localStorage.getItem('dice-ios-dismissed')) {
    installIos.classList.remove('hidden');
}

document.getElementById('ios-close').addEventListener('click', () => {
    installIos.classList.add('hidden');
    localStorage.setItem('dice-ios-dismissed', '1');
});

window.addEventListener('appinstalled', () => {
    installAndroid.classList.add('hidden');
    deferredPrompt = null;
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

window.__DICE__ = {
    view,
    selectSides,
    roll: (value) => view.roll(value),
    facing: () => view.getFacing()
};
