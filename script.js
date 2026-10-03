(function() {
    'use strict';

    let currentSides = 4;
    let isRolling = false;
    let scene, camera, renderer, diceMesh;
    let animationId;
    let rollResult = null;

    const canvas = document.getElementById('diceCanvas');
    const diceArea = document.getElementById('diceArea');
    const diceButtons = document.querySelectorAll('.dice-type');
    const tapHint = document.getElementById('tapHint');

    function getRandomInt(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return (array[0] % max) + 1;
    }

    function createTextTexture(text, size = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = '#1e1b4b';
        ctx.font = `bold ${size * 0.5}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, size / 2, size / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function createD4() {
        const geometry = new THREE.TetrahedronGeometry(1.4);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            flatShading: true,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.diceType = 4;
        return mesh;
    }

    function createD6() {
        const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const materials = [];
        const faceOrder = [3, 4, 2, 5, 1, 6];
        
        for (let i = 0; i < 6; i++) {
            const texture = createTextTexture(faceOrder[i].toString());
            materials.push(new THREE.MeshPhongMaterial({ 
                map: texture,
                shininess: 30
            }));
        }
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.diceType = 6;
        return mesh;
    }

    function createD8() {
        const geometry = new THREE.OctahedronGeometry(1.4);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            flatShading: true,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.diceType = 8;
        return mesh;
    }

    function createD10() {
        const geometry = new THREE.ConeGeometry(1.2, 2.2, 10);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            flatShading: true,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.diceType = 10;
        return mesh;
    }

    function createD12() {
        const geometry = new THREE.DodecahedronGeometry(1.3);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            flatShading: true,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.diceType = 12;
        return mesh;
    }

    function createD20() {
        const geometry = new THREE.IcosahedronGeometry(1.4);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            flatShading: true,
            shininess: 30
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.diceType = 20;
        return mesh;
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

    const d6FaceRotations = {
        1: { x: Math.PI / 2, y: 0, z: 0 },
        2: { x: 0, y: -Math.PI / 2, z: 0 },
        3: { x: 0, y: 0, z: 0 },
        4: { x: 0, y: Math.PI, z: 0 },
        5: { x: 0, y: Math.PI / 2, z: 0 },
        6: { x: -Math.PI / 2, y: 0, z: 0 }
    };

    function getFinalRotation(sides, result) {
        if (sides === 6) {
            return d6FaceRotations[result];
        }
        const angle = ((result - 1) / sides) * Math.PI * 2;
        return {
            x: Math.random() * 0.3,
            y: angle,
            z: Math.random() * 0.3
        };
    }

    function initThree() {
        scene = new THREE.Scene();
        
        const aspect = canvas.clientWidth / canvas.clientHeight;
        camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
        camera.position.z = 5;
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true, 
            alpha: true 
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(3, 5, 4);
        scene.add(mainLight);
        
        const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
        fillLight.position.set(-3, -2, 2);
        scene.add(fillLight);
        
        diceMesh = createDice(currentSides);
        scene.add(diceMesh);
        
        resizeRenderer();
        animate();
    }

    function resizeRenderer() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    let velocity = { x: 0, y: 0, z: 0 };
    let targetRotation = null;
    let idleRotation = 0;

    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (isRolling && targetRotation) {
            const damping = 0.92;
            const attraction = 0.08;
            
            velocity.x = velocity.x * damping + (targetRotation.x - diceMesh.rotation.x) * attraction;
            velocity.y = velocity.y * damping + (targetRotation.y - diceMesh.rotation.y) * attraction;
            velocity.z = velocity.z * damping + (targetRotation.z - diceMesh.rotation.z) * attraction;
            
            diceMesh.rotation.x += velocity.x;
            diceMesh.rotation.y += velocity.y;
            diceMesh.rotation.z += velocity.z;
            
            const totalVelocity = Math.abs(velocity.x) + Math.abs(velocity.y) + Math.abs(velocity.z);
            
            if (totalVelocity < 0.001) {
                diceMesh.rotation.x = targetRotation.x;
                diceMesh.rotation.y = targetRotation.y;
                diceMesh.rotation.z = targetRotation.z;
                isRolling = false;
                targetRotation = null;
                
                if (rollResult !== null && 'vibrate' in navigator) {
                    navigator.vibrate(30);
                }
            }
        } else if (!isRolling) {
            idleRotation += 0.003;
            diceMesh.rotation.y = idleRotation;
        }
        
        resizeRenderer();
        renderer.render(scene, camera);
    }

    function switchDice(sides) {
        if (diceMesh) {
            scene.remove(diceMesh);
            if (diceMesh.geometry) diceMesh.geometry.dispose();
            if (diceMesh.material) {
                if (Array.isArray(diceMesh.material)) {
                    diceMesh.material.forEach(m => m.dispose());
                } else {
                    diceMesh.material.dispose();
                }
            }
        }
        
        currentSides = sides;
        diceMesh = createDice(sides);
        scene.add(diceMesh);
        idleRotation = 0;
        velocity = { x: 0, y: 0, z: 0 };
        targetRotation = null;
        rollResult = null;
    }

    function rollDice() {
        if (isRolling) return;
        
        isRolling = true;
        rollResult = getRandomInt(currentSides);
        
        tapHint.classList.add('opacity-0');
        
        const spins = 3 + Math.random() * 2;
        const finalRot = getFinalRotation(currentSides, rollResult);
        
        velocity = {
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: (Math.random() - 0.5) * 0.8
        };
        
        targetRotation = {
            x: finalRot.x + Math.PI * 2 * spins,
            y: finalRot.y + Math.PI * 2 * spins,
            z: finalRot.z
        };
        
        idleRotation = finalRot.y;
    }

    function selectDice(sides) {
        diceButtons.forEach(btn => {
            const isSelected = parseInt(btn.dataset.sides) === sides;
            btn.classList.toggle('active', isSelected);
            btn.setAttribute('aria-pressed', isSelected);
        });
        
        if (currentSides !== sides) {
            switchDice(sides);
            tapHint.classList.remove('opacity-0');
        }
    }

    diceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectDice(parseInt(btn.dataset.sides));
        });
    });

    diceArea.addEventListener('click', rollDice);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            rollDice();
        }
    });

    window.addEventListener('resize', resizeRenderer);

    initThree();

    // PWA Installation
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const closeInstall = document.getElementById('closeInstall');
    const iosPrompt = document.getElementById('iosPrompt');
    const closeIos = document.getElementById('closeIos');

    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem('installDismissed')) {
            installPrompt.classList.remove('hidden');
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installPrompt.classList.add('hidden');
        });
    }

    if (closeInstall) {
        closeInstall.addEventListener('click', () => {
            installPrompt.classList.add('hidden');
            localStorage.setItem('installDismissed', 'true');
        });
    }

    if (isIOS() && !isStandalone() && !localStorage.getItem('iosDismissed')) {
        iosPrompt.classList.remove('hidden');
    }

    if (closeIos) {
        closeIos.addEventListener('click', () => {
            iosPrompt.classList.add('hidden');
            localStorage.setItem('iosDismissed', 'true');
        });
    }

    window.addEventListener('appinstalled', () => {
        installPrompt.classList.add('hidden');
        deferredPrompt = null;
    });

    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
})();
