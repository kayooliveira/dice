import { DiceView } from './dice.js?v=10';

const typeButtons = [...document.querySelectorAll('[data-sides]')];
const countButtons = [...document.querySelectorAll('[data-count]')];
const stage = document.getElementById('stage');
const canvas = document.getElementById('canvas');
const hint = document.getElementById('hint');
const result = document.getElementById('result');
const resultFaces = document.getElementById('result-faces');
const resultSum = document.getElementById('result-sum');

const view = new DiceView(canvas);
view.setHost(stage);

function hintFor(count) {
    return count === 1 ? 'Toque no dado para rolar' : 'Toque nos dados para rolar';
}

function setControlsDisabled(disabled) {
    for (const button of [...typeButtons, ...countButtons]) {
        button.disabled = disabled;
    }
}

function clearResult() {
    result.hidden = true;
    resultFaces.replaceChildren();
    resultSum.textContent = '';
    delete stage.dataset.result;
    delete stage.dataset.sum;
}

function showResult(values) {
    if (values.length < 2) {
        clearResult();
        stage.dataset.result = String(values[0] ?? '');
        return;
    }
    result.hidden = false;
    resultFaces.replaceChildren();
    values.forEach((value) => {
        const part = document.createElement('span');
        part.className = 'result-part';
        part.textContent = String(value);
        resultFaces.append(part);
    });
    const total = values.reduce((sum, value) => sum + value, 0);
    resultSum.textContent = String(total);
    stage.dataset.result = values.join(',');
    stage.dataset.sum = String(total);
}

function selectSides(sides) {
    if (view.rolling) return;
    for (const button of typeButtons) {
        const selected = Number(button.dataset.sides) === sides;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
    }
    if (view.sides !== sides) {
        view.setSides(sides);
        clearResult();
        hint.textContent = hintFor(view.count);
    }
}

function selectCount(count) {
    if (view.rolling) return;
    for (const button of countButtons) {
        const selected = Number(button.dataset.count) === count;
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
    }
    stage.setAttribute('aria-label', count === 1 ? 'Rolar dado' : 'Rolar dados');
    if (view.count !== count) {
        view.setCount(count);
        clearResult();
    }
    hint.textContent = hintFor(count);
}

for (const button of typeButtons) {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectSides(Number(button.dataset.sides));
    });
}

for (const button of countButtons) {
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        selectCount(Number(button.dataset.count));
    });
}

async function roll(forcedValues) {
    if (view.rolling) return view.getFacing().map((face) => face.value);
    hint.textContent = 'Rolando';
    stage.classList.add('is-rolling');
    stage.setAttribute('aria-busy', 'true');
    setControlsDisabled(true);
    const values = await view.roll(forcedValues);
    stage.classList.remove('is-rolling');
    stage.removeAttribute('aria-busy');
    setControlsDisabled(false);
    showResult(values);
    hint.textContent = hintFor(view.count);
    return values;
}

stage.addEventListener('click', () => {
    roll();
});
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

function syncInstallOffset() {
    const showing = !installAndroid.classList.contains('hidden') || !installIos.classList.contains('hidden');
    document.getElementById('app').classList.toggle('has-install', showing);
}

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!localStorage.getItem('dice-install-dismissed')) {
        installAndroid.classList.remove('hidden');
        syncInstallOffset();
    }
});

document.getElementById('install-accept').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installAndroid.classList.add('hidden');
    syncInstallOffset();
});

document.getElementById('install-close').addEventListener('click', () => {
    installAndroid.classList.add('hidden');
    localStorage.setItem('dice-install-dismissed', '1');
    syncInstallOffset();
});

if (isIOS() && !isStandalone() && !localStorage.getItem('dice-ios-dismissed')) {
    installIos.classList.remove('hidden');
    syncInstallOffset();
}

document.getElementById('ios-close').addEventListener('click', () => {
    installIos.classList.add('hidden');
    localStorage.setItem('dice-ios-dismissed', '1');
    syncInstallOffset();
});

window.addEventListener('appinstalled', () => {
    installAndroid.classList.add('hidden');
    deferredPrompt = null;
    syncInstallOffset();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}

window.__DICE__ = {
    view,
    selectSides,
    selectCount,
    roll,
    facing: () => view.getFacing()
};
