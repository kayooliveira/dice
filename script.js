import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

(function() {
    'use strict';

    // State
    let currentSides = 4;
    let isRolling = false;
    let scene, camera, renderer, dice;
    let rollResult = null;

    // DOM
    const canvas = document.getElementById('diceCanvas');
    const container = document.getElementById('diceContainer');
    const buttons = document.querySelectorAll('.dice-type');
    const tapHint = document.getElementById('tapHint');
    const resultDisplay = document.getElementById('resultDisplay');
    const resultValue = document.getElementById('resultValue');

    // Random int [1, max]
    function randomInt(max) {
        const arr = new Uint32Array(1);
        crypto.getRandomValues(arr);
        return (arr[0] % max) + 1;
    }

    // Create texture with number
    function makeTexture(num, bg = '#ffffff', fg = '#1e293b') {
        const size = 256;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = fg;
        ctx.font = `bold ${size * 0.55}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(num), size / 2, size / 2 + 4);
        
        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
    }

    // D4 - Tetrahedron
    function createD4() {
        const group = new THREE.Group();
        const geo = new THREE.TetrahedronGeometry(1.6);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: 0x7c3aed, linewidth: 2 })
        );
        group.add(edges);
        
        group.userData.type = 4;
        group.userData.rotations = {
            1: { x: -0.34, y: 0, z: 0 },
            2: { x: 1.91, y: 0, z: 2.09 },
            3: { x: 1.91, y: 2.09, z: 0 },
            4: { x: 1.91, y: -2.09, z: 0 }
        };
        return group;
    }

    // D6 - Cube with rounded edges
    function createD6() {
        const group = new THREE.Group();
        
        let geo;
        try {
            geo = new RoundedBoxGeometry(1.7, 1.7, 1.7, 4, 0.15);
        } catch {
            geo = new THREE.BoxGeometry(1.7, 1.7, 1.7);
        }
        
        // D6 opposite faces sum to 7: 1-6, 2-5, 3-4
        // BoxGeometry faces: +x, -x, +y, -y, +z, -z
        const faceNums = [3, 4, 1, 6, 2, 5];
        const mats = faceNums.map(n => new THREE.MeshStandardMaterial({
            map: makeTexture(n),
            roughness: 0.15,
            metalness: 0.05
        }));
        
        const mesh = new THREE.Mesh(geo, mats);
        group.add(mesh);
        
        group.userData.type = 6;
        group.userData.rotations = {
            1: { x: -Math.PI / 2, y: 0, z: 0 },
            2: { x: 0, y: 0, z: Math.PI / 2 },
            3: { x: 0, y: 0, z: 0 },
            4: { x: Math.PI, y: 0, z: 0 },
            5: { x: 0, y: 0, z: -Math.PI / 2 },
            6: { x: Math.PI / 2, y: 0, z: 0 }
        };
        return group;
    }

    // D8 - Octahedron
    function createD8() {
        const group = new THREE.Group();
        const geo = new THREE.OctahedronGeometry(1.4);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: 0x0891b2, linewidth: 2 })
        );
        group.add(edges);
        
        group.userData.type = 8;
        group.userData.rotations = {
            1: { x: 0.62, y: 0, z: 0.79 },
            2: { x: 0.62, y: Math.PI / 2, z: 0.79 },
            3: { x: 0.62, y: Math.PI, z: 0.79 },
            4: { x: 0.62, y: -Math.PI / 2, z: 0.79 },
            5: { x: -0.62, y: 0, z: -0.79 },
            6: { x: -0.62, y: Math.PI / 2, z: -0.79 },
            7: { x: -0.62, y: Math.PI, z: -0.79 },
            8: { x: -0.62, y: -Math.PI / 2, z: -0.79 }
        };
        return group;
    }

    // D10 - Pentagonal trapezohedron
    function createD10() {
        const group = new THREE.Group();
        
        // D10 geometry: 10 kite-shaped faces
        const geo = new THREE.CylinderGeometry(0, 1.3, 2.2, 10, 1);
        geo.rotateX(Math.PI);
        
        const topGeo = new THREE.CylinderGeometry(0, 1.3, 2.2, 10, 1);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
            flatShading: true
        });
        
        const bottom = new THREE.Mesh(geo, mat);
        bottom.position.y = -0.3;
        const top = new THREE.Mesh(topGeo, mat);
        top.position.y = 0.3;
        top.rotation.y = Math.PI / 10;
        
        group.add(bottom);
        group.add(top);
        
        group.userData.type = 10;
        group.userData.rotations = {};
        for (let i = 0; i <= 9; i++) {
            const angle = (i * Math.PI * 2) / 5;
            group.userData.rotations[i] = { 
                x: i < 5 ? 0.5 : -0.5, 
                y: angle + (i >= 5 ? Math.PI / 5 : 0), 
                z: 0 
            };
        }
        return group;
    }

    // D12 - Dodecahedron
    function createD12() {
        const group = new THREE.Group();
        const geo = new THREE.DodecahedronGeometry(1.35);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo, 10),
            new THREE.LineBasicMaterial({ color: 0x059669, linewidth: 2 })
        );
        group.add(edges);
        
        group.userData.type = 12;
        group.userData.rotations = {};
        const phi = (1 + Math.sqrt(5)) / 2;
        const baseAngle = Math.atan(1 / phi);
        for (let i = 1; i <= 12; i++) {
            const ring = Math.floor((i - 1) / 5);
            const pos = (i - 1) % 5;
            const yAngle = (pos * 2 * Math.PI) / 5 + (ring === 1 ? Math.PI / 5 : 0);
            const xAngle = ring === 0 ? -baseAngle : ring === 1 ? baseAngle : Math.PI - baseAngle;
            group.userData.rotations[i] = { x: xAngle, y: yAngle, z: 0 };
        }
        return group;
    }

    // D20 - Icosahedron
    function createD20() {
        const group = new THREE.Group();
        const geo = new THREE.IcosahedronGeometry(1.45);
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            roughness: 0.2,
            metalness: 0.1,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo),
            new THREE.LineBasicMaterial({ color: 0x7c3aed, linewidth: 2 })
        );
        group.add(edges);
        
        group.userData.type = 20;
        group.userData.rotations = {};
        for (let i = 1; i <= 20; i++) {
            const tier = Math.floor((i - 1) / 5);
            const pos = (i - 1) % 5;
            const yAngle = (pos * 2 * Math.PI) / 5 + (tier % 2 ? Math.PI / 5 : 0);
            const xAngles = [0.46, 1.11, Math.PI - 1.11, Math.PI - 0.46];
            group.userData.rotations[i] = { 
                x: xAngles[Math.min(tier, 3)], 
                y: yAngle, 
                z: 0 
            };
        }
        return group;
    }

    function createDice(sides) {
        switch (sides) {
            case 4: return createD4();
            case 6: return createD6();
            case 8: return createD8();
            case 10: return createD10();
            case 12: return createD12();
            case 20: return createD20();
            default: return createD6();
        }
    }

    // Initialize Three.js
    function init() {
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 7);
        
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambient);
        
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(5, 8, 6);
        scene.add(key);
        
        const fill = new THREE.DirectionalLight(0xffffff, 0.5);
        fill.position.set(-5, 3, 4);
        scene.add(fill);
        
        const rim = new THREE.DirectionalLight(0x8b5cf6, 0.4);
        rim.position.set(0, -4, -5);
        scene.add(rim);
        
        dice = createDice(currentSides);
        scene.add(dice);
        
        resize();
        animate();
    }

    function resize() {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // Animation state
    let vel = { x: 0, y: 0, z: 0 };
    let target = null;
    let idle = 0;

    function animate() {
        requestAnimationFrame(animate);
        
        if (isRolling && target) {
            const damp = 0.88;
            const pull = 0.12;
            
            vel.x = vel.x * damp + (target.x - dice.rotation.x) * pull;
            vel.y = vel.y * damp + (target.y - dice.rotation.y) * pull;
            vel.z = vel.z * damp + (target.z - dice.rotation.z) * pull;
            
            dice.rotation.x += vel.x;
            dice.rotation.y += vel.y;
            dice.rotation.z += vel.z;
            
            const speed = Math.abs(vel.x) + Math.abs(vel.y) + Math.abs(vel.z);
            
            if (speed < 0.003) {
                dice.rotation.set(
                    target.x % (Math.PI * 2),
                    target.y % (Math.PI * 2),
                    target.z % (Math.PI * 2)
                );
                isRolling = false;
                target = null;
                idle = dice.rotation.y;
                
                // Show result
                resultValue.textContent = rollResult;
                resultValue.style.opacity = '1';
                tapHint.style.opacity = '0';
                
                if ('vibrate' in navigator) navigator.vibrate(25);
            }
        } else {
            idle += 0.005;
            dice.rotation.y = idle;
            dice.rotation.x = Math.sin(idle * 0.5) * 0.1;
        }
        
        renderer.render(scene, camera);
    }

    function switchDice(sides) {
        if (dice) {
            scene.remove(dice);
            dice.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(m => {
                        if (m.map) m.map.dispose();
                        m.dispose();
                    });
                }
            });
        }
        
        currentSides = sides;
        dice = createDice(sides);
        scene.add(dice);
        
        idle = 0;
        vel = { x: 0, y: 0, z: 0 };
        target = null;
        rollResult = null;
        
        resultValue.style.opacity = '0';
        tapHint.style.opacity = '1';
    }

    function roll() {
        if (isRolling) return;
        
        isRolling = true;
        rollResult = randomInt(currentSides);
        
        resultValue.style.opacity = '0';
        
        const spins = 2 + Math.random() * 2;
        const final = dice.userData.rotations[rollResult] || { x: 0, y: 0, z: 0 };
        
        vel = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.3
        };
        
        const dir = () => Math.random() > 0.5 ? 1 : -1;
        target = {
            x: final.x + Math.PI * 2 * spins * dir(),
            y: final.y + Math.PI * 2 * spins * dir(),
            z: final.z + Math.PI * 2 * Math.floor(spins / 2) * dir()
        };
    }

    function selectDice(sides) {
        buttons.forEach(btn => {
            const sel = parseInt(btn.dataset.sides) === sides;
            btn.classList.toggle('active', sel);
        });
        
        if (currentSides !== sides) {
            switchDice(sides);
        }
    }

    // Events
    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            selectDice(parseInt(btn.dataset.sides));
        });
    });

    container.addEventListener('click', roll);
    
    document.addEventListener('keydown', e => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            roll();
        }
    });

    window.addEventListener('resize', resize);

    // Initialize
    init();

    // PWA
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const closeInstall = document.getElementById('closeInstall');
    const iosPrompt = document.getElementById('iosPrompt');
    const closeIos = document.getElementById('closeIos');

    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem('installDismissed')) {
            installPrompt.classList.remove('hidden');
        }
    });

    installBtn?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    });

    closeInstall?.addEventListener('click', () => {
        installPrompt.classList.add('hidden');
        localStorage.setItem('installDismissed', 'true');
    });

    if (isIOS() && !isStandalone() && !localStorage.getItem('iosDismissed')) {
        iosPrompt.classList.remove('hidden');
    }

    closeIos?.addEventListener('click', () => {
        iosPrompt.classList.add('hidden');
        localStorage.setItem('iosDismissed', 'true');
    });

    window.addEventListener('appinstalled', () => {
        installPrompt.classList.add('hidden');
        deferredPrompt = null;
    });

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();
