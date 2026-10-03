(function() {
    'use strict';

    let currentSides = 6;
    let isRolling = false;
    let scene, camera, renderer, dice;
    let targetRotation = { x: 0, y: 0, z: 0 };
    let currentRotation = { x: 0, y: 0, z: 0 };
    let animationId;
    let rollResult = null;

    const canvas = document.getElementById('diceCanvas');
    const diceArea = document.getElementById('diceArea');
    const diceButtons = document.querySelectorAll('.dice-btn');
    const resultDisplay = document.getElementById('resultValue');

    const faceRotations = {
        6: {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 0, y: Math.PI / 2, z: 0 },
            3: { x: -Math.PI / 2, y: 0, z: 0 },
            4: { x: Math.PI / 2, y: 0, z: 0 },
            5: { x: 0, y: -Math.PI / 2, z: 0 },
            6: { x: Math.PI, y: 0, z: 0 }
        },
        4: {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 2.19, y: 0, z: 2.09 },
            3: { x: 2.19, y: 0, z: -2.09 },
            4: { x: -0.96, y: 0, z: Math.PI }
        },
        8: {
            1: { x: 0.615, y: 0, z: 0.785 },
            2: { x: 0.615, y: 0, z: -0.785 },
            3: { x: 0.615, y: Math.PI, z: 0.785 },
            4: { x: 0.615, y: Math.PI, z: -0.785 },
            5: { x: -0.615, y: 0, z: 0.785 },
            6: { x: -0.615, y: 0, z: -0.785 },
            7: { x: -0.615, y: Math.PI, z: 0.785 },
            8: { x: -0.615, y: Math.PI, z: -0.785 }
        },
        10: {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 0, y: Math.PI / 5, z: 0 },
            3: { x: 0, y: 2 * Math.PI / 5, z: 0 },
            4: { x: 0, y: 3 * Math.PI / 5, z: 0 },
            5: { x: 0, y: 4 * Math.PI / 5, z: 0 },
            6: { x: Math.PI, y: 0, z: 0 },
            7: { x: Math.PI, y: Math.PI / 5, z: 0 },
            8: { x: Math.PI, y: 2 * Math.PI / 5, z: 0 },
            9: { x: Math.PI, y: 3 * Math.PI / 5, z: 0 },
            10: { x: Math.PI, y: 4 * Math.PI / 5, z: 0 }
        },
        12: {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 0, y: Math.PI / 5, z: 0.5 },
            3: { x: 0, y: 2 * Math.PI / 5, z: 0 },
            4: { x: 0, y: 3 * Math.PI / 5, z: 0.5 },
            5: { x: 0, y: 4 * Math.PI / 5, z: 0 },
            6: { x: 0.5, y: Math.PI, z: 0 },
            7: { x: Math.PI, y: 0, z: 0 },
            8: { x: Math.PI, y: Math.PI / 5, z: 0.5 },
            9: { x: Math.PI, y: 2 * Math.PI / 5, z: 0 },
            10: { x: Math.PI, y: 3 * Math.PI / 5, z: 0.5 },
            11: { x: Math.PI, y: 4 * Math.PI / 5, z: 0 },
            12: { x: Math.PI + 0.5, y: Math.PI, z: 0 }
        },
        20: {
            1: { x: 0, y: 0, z: 0 },
            2: { x: 0.36, y: 0.63, z: 0 },
            3: { x: 0.36, y: 1.26, z: 0 },
            4: { x: 0.36, y: 1.88, z: 0 },
            5: { x: 0.36, y: 2.51, z: 0 },
            6: { x: 0.72, y: 0, z: 0.63 },
            7: { x: 0.72, y: 0.63, z: 0.63 },
            8: { x: 0.72, y: 1.26, z: 0.63 },
            9: { x: 0.72, y: 1.88, z: 0.63 },
            10: { x: 0.72, y: 2.51, z: 0.63 },
            11: { x: Math.PI - 0.72, y: 0, z: 0.63 },
            12: { x: Math.PI - 0.72, y: 0.63, z: 0.63 },
            13: { x: Math.PI - 0.72, y: 1.26, z: 0.63 },
            14: { x: Math.PI - 0.72, y: 1.88, z: 0.63 },
            15: { x: Math.PI - 0.72, y: 2.51, z: 0.63 },
            16: { x: Math.PI - 0.36, y: 0.63, z: 0 },
            17: { x: Math.PI - 0.36, y: 1.26, z: 0 },
            18: { x: Math.PI - 0.36, y: 1.88, z: 0 },
            19: { x: Math.PI - 0.36, y: 2.51, z: 0 },
            20: { x: Math.PI, y: 0, z: 0 }
        }
    };

    function getRandomInt(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return (array[0] % max) + 1;
    }

    function createTextTexture(text, bgColor = '#ffffff', textColor = '#1a1a2e') {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 128, 128);
        
        ctx.fillStyle = textColor;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);
        
        return new THREE.CanvasTexture(canvas);
    }

    function createD6() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const materials = [];
        
        const faceValues = [1, 6, 2, 5, 3, 4];
        for (let i = 0; i < 6; i++) {
            const texture = createTextTexture(faceValues[i].toString());
            materials.push(new THREE.MeshStandardMaterial({ map: texture }));
        }
        
        return new THREE.Mesh(geometry, materials);
    }

    function createD4() {
        const geometry = new THREE.TetrahedronGeometry(1.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a1a2e }));
        mesh.add(line);
        
        for (let i = 1; i <= 4; i++) {
            const sprite = createNumberSprite(i.toString());
            const angle = (i - 1) * Math.PI / 2;
            sprite.position.set(Math.cos(angle) * 0.8, -0.3, Math.sin(angle) * 0.8);
            sprite.scale.set(0.5, 0.5, 1);
            mesh.add(sprite);
        }
        
        return mesh;
    }

    function createD8() {
        const geometry = new THREE.OctahedronGeometry(1.4);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a1a2e }));
        mesh.add(line);
        
        return mesh;
    }

    function createD10() {
        const vertices = [];
        const top = 1.2;
        const mid = 0;
        const bottom = -1.2;
        const r = 1;
        
        vertices.push(0, top, 0);
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            vertices.push(Math.cos(angle) * r, mid + 0.3, Math.sin(angle) * r);
        }
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2 + Math.PI / 5;
            vertices.push(Math.cos(angle) * r, mid - 0.3, Math.sin(angle) * r);
        }
        vertices.push(0, bottom, 0);
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(vertices);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const indices = [
            0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 1,
            1, 6, 2, 2, 7, 3, 3, 8, 4, 4, 9, 5, 5, 10, 1,
            6, 7, 2, 7, 8, 3, 8, 9, 4, 9, 10, 5, 10, 6, 1,
            11, 7, 6, 11, 8, 7, 11, 9, 8, 11, 10, 9, 11, 6, 10
        ];
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        return mesh;
    }

    function createD12() {
        const geometry = new THREE.DodecahedronGeometry(1.3);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a1a2e }));
        mesh.add(line);
        
        return mesh;
    }

    function createD20() {
        const geometry = new THREE.IcosahedronGeometry(1.4);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x1a1a2e }));
        mesh.add(line);
        
        return mesh;
    }

    function createNumberSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        return new THREE.Sprite(material);
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

    function initThree() {
        scene = new THREE.Scene();
        
        const aspect = canvas.clientWidth / canvas.clientHeight;
        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        camera.position.z = 6;
        
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true, 
            alpha: true 
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0xe94560, 0.3);
        backLight.position.set(-5, -5, -5);
        scene.add(backLight);
        
        dice = createDice(currentSides);
        scene.add(dice);
        
        resizeRenderer();
        animate();
    }

    function resizeRenderer() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        
        if (isRolling) {
            const speed = 0.15;
            currentRotation.x += (targetRotation.x - currentRotation.x) * speed;
            currentRotation.y += (targetRotation.y - currentRotation.y) * speed;
            currentRotation.z += (targetRotation.z - currentRotation.z) * speed;
            
            dice.rotation.x = currentRotation.x;
            dice.rotation.y = currentRotation.y;
            dice.rotation.z = currentRotation.z;
            
            const dx = Math.abs(targetRotation.x - currentRotation.x);
            const dy = Math.abs(targetRotation.y - currentRotation.y);
            const dz = Math.abs(targetRotation.z - currentRotation.z);
            
            if (dx < 0.01 && dy < 0.01 && dz < 0.01) {
                isRolling = false;
                currentRotation.x = targetRotation.x;
                currentRotation.y = targetRotation.y;
                currentRotation.z = targetRotation.z;
                dice.rotation.x = targetRotation.x;
                dice.rotation.y = targetRotation.y;
                dice.rotation.z = targetRotation.z;
                
                if (rollResult !== null) {
                    resultDisplay.textContent = rollResult;
                    if ('vibrate' in navigator) {
                        navigator.vibrate(50);
                    }
                }
            }
        } else {
            dice.rotation.y += 0.005;
        }
        
        resizeRenderer();
        renderer.render(scene, camera);
    }

    function switchDice(sides) {
        if (dice) {
            scene.remove(dice);
            if (dice.geometry) dice.geometry.dispose();
            if (dice.material) {
                if (Array.isArray(dice.material)) {
                    dice.material.forEach(m => m.dispose());
                } else {
                    dice.material.dispose();
                }
            }
        }
        
        currentSides = sides;
        dice = createDice(sides);
        scene.add(dice);
        
        currentRotation = { x: 0, y: 0, z: 0 };
        targetRotation = { x: 0, y: 0, z: 0 };
        resultDisplay.textContent = '-';
    }

    function rollDice() {
        if (isRolling) return;
        
        isRolling = true;
        rollResult = getRandomInt(currentSides);
        
        const spins = 2 + Math.random() * 2;
        const baseRotation = faceRotations[currentSides] ? 
            faceRotations[currentSides][rollResult] : 
            { x: 0, y: 0, z: 0 };
        
        targetRotation = {
            x: baseRotation.x + Math.PI * 2 * spins * (Math.random() > 0.5 ? 1 : -1),
            y: baseRotation.y + Math.PI * 2 * spins * (Math.random() > 0.5 ? 1 : -1),
            z: baseRotation.z + Math.PI * 2 * spins * (Math.random() > 0.5 ? 1 : -1)
        };
        
        resultDisplay.textContent = '...';
    }

    function selectDice(sides) {
        diceButtons.forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.sides) === sides) {
                btn.classList.add('selected');
            }
        });
        
        switchDice(sides);
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

    window.addEventListener('resize', resizeRenderer);

    initThree();

    // PWA Installation
    let deferredPrompt;
    const installBanner = document.getElementById('installBanner');
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissBtn');
    const iosBanner = document.getElementById('iosBanner');
    const iosCloseBtn = document.getElementById('iosCloseBtn');

    function isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function isInStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBanner.classList.remove('hidden');
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            deferredPrompt = null;
            installBanner.classList.add('hidden');
        });
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            installBanner.classList.add('hidden');
            sessionStorage.setItem('installDismissed', 'true');
        });
    }

    if (isIOS() && !isInStandaloneMode() && !sessionStorage.getItem('iosDismissed')) {
        iosBanner.classList.remove('hidden');
    }

    if (iosCloseBtn) {
        iosCloseBtn.addEventListener('click', () => {
            iosBanner.classList.add('hidden');
            sessionStorage.setItem('iosDismissed', 'true');
        });
    }

    window.addEventListener('appinstalled', () => {
        installBanner.classList.add('hidden');
        deferredPrompt = null;
    });

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration.scope);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }
})();
