// ============================================
// SHATO STEAKHOUSE - 3D HERO SCENE
// Rotating meat block + smoke particles + ember lights
// ============================================

import * as THREE from 'three';

const canvas = document.getElementById('hero3d');
const isMobile = window.innerWidth < 768;
const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !prefersReducedMotion) {
    const heroSection = document.querySelector('.hero');

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0F0B08, 0.06);

    // Camera
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(0, 1.6, 6);
    camera.lookAt(0, 0.5, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0x4A2818, 0.4);
    scene.add(ambient);

    // Main ember key light
    const emberLight = new THREE.PointLight(0xD17847, 3.5, 18, 1.5);
    emberLight.position.set(2, 2.5, 2);
    scene.add(emberLight);

    // Warm rim light from behind
    const rimLight = new THREE.PointLight(0xC2693F, 2, 14, 1.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Subtle fill from below (grill glow)
    const grillLight = new THREE.PointLight(0xFF4500, 1.5, 8, 2);
    grillLight.position.set(0, -1, 0);
    scene.add(grillLight);

    // Cool top accent
    const topLight = new THREE.DirectionalLight(0xFFEEDD, 0.4);
    topLight.position.set(0, 5, 3);
    scene.add(topLight);

    // ====== TEXTURED MEAT BLOCK ======
    const textureLoader = new THREE.TextureLoader();
    const meatTexture = textureLoader.load('images/shato_03_DJhCrnoI8IN.jpg');
    meatTexture.wrapS = THREE.RepeatWrapping;
    meatTexture.wrapT = THREE.RepeatWrapping;
    meatTexture.colorSpace = THREE.SRGBColorSpace;

    // Cutting board base
    const boardGeo = new THREE.BoxGeometry(3.2, 0.18, 1.8);
    const boardMat = new THREE.MeshStandardMaterial({
        color: 0x3a2418,
        roughness: 0.85,
        metalness: 0.05
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = -0.25;
    scene.add(board);

    // Meat slab (the star)
    const meatGroup = new THREE.Group();
    const meatGeo = new THREE.BoxGeometry(1.6, 0.65, 1.2);
    // round the edges by modifying vertices slightly (chamfer)
    const meatMat = new THREE.MeshStandardMaterial({
        map: meatTexture,
        roughness: 0.55,
        metalness: 0.0,
        color: 0xffffff
    });
    const meat = new THREE.Mesh(meatGeo, meatMat);
    meat.position.y = 0.18;
    meatGroup.add(meat);

    // Char/dark edges - thin frame above meat
    const charGeo = new THREE.BoxGeometry(1.62, 0.1, 1.22);
    const charMat = new THREE.MeshStandardMaterial({
        color: 0x2a1408,
        roughness: 0.95,
        metalness: 0.0
    });
    const char = new THREE.Mesh(charGeo, charMat);
    char.position.y = 0.5;
    meatGroup.add(char);

    scene.add(meatGroup);

    // ====== SMOKE PARTICLES ======
    const smokeCount = isMobile || isLowEnd ? 120 : 250;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeVelocities = new Float32Array(smokeCount * 3);
    const smokeLifetimes = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
        smokePositions[i * 3] = (Math.random() - 0.5) * 1.4;
        smokePositions[i * 3 + 1] = Math.random() * 2 + 0.5;
        smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 1;
        smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.003;
        smokeVelocities[i * 3 + 1] = 0.005 + Math.random() * 0.008;
        smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
        smokeLifetimes[i] = Math.random();
    }

    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));

    // Soft circular smoke sprite via canvas
    const smokeCanvas = document.createElement('canvas');
    smokeCanvas.width = 128;
    smokeCanvas.height = 128;
    const sctx = smokeCanvas.getContext('2d');
    const gradient = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(245,230,200,0.9)');
    gradient.addColorStop(0.4, 'rgba(180,140,100,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, 128, 128);
    const smokeTexture = new THREE.CanvasTexture(smokeCanvas);

    const smokeMat = new THREE.PointsMaterial({
        size: 0.45,
        map: smokeTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xC2693F
    });

    const smoke = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smoke);

    // ====== EMBER FLOATING PARTICLES (small bright sparks) ======
    const emberCount = isMobile || isLowEnd ? 40 : 80;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
        emberPositions[i * 3] = (Math.random() - 0.5) * 3;
        emberPositions[i * 3 + 1] = Math.random() * 3;
        emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        emberVelocities[i * 3] = (Math.random() - 0.5) * 0.002;
        emberVelocities[i * 3 + 1] = 0.003 + Math.random() * 0.005;
        emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xFFAA55,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // ====== MOUSE PARALLAX ======
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth - 0.5) * 0.6;
        mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.3;
    });

    // ====== RESIZE ======
    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', resize);

    // ====== ANIMATE ======
    const clock = new THREE.Clock();
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    }, { passive: true });

    function animate() {
        const dt = clock.getDelta();
        const t = clock.getElapsedTime();

        // Rotate meat slowly with subtle wobble
        meatGroup.rotation.y += dt * 0.35;
        meatGroup.rotation.x = Math.sin(t * 0.5) * 0.05;
        meatGroup.position.y = Math.sin(t * 1.2) * 0.05 + 0.05;

        // Ember light pulse
        emberLight.intensity = 3.5 + Math.sin(t * 3) * 0.6;
        rimLight.intensity = 2 + Math.sin(t * 2.3 + 1) * 0.4;
        grillLight.intensity = 1.5 + Math.sin(t * 4) * 0.5;

        // Update smoke particles
        const sPos = smoke.geometry.attributes.position.array;
        for (let i = 0; i < smokeCount; i++) {
            sPos[i * 3] += smokeVelocities[i * 3];
            sPos[i * 3 + 1] += smokeVelocities[i * 3 + 1];
            sPos[i * 3 + 2] += smokeVelocities[i * 3 + 2];
            // reset when too high
            if (sPos[i * 3 + 1] > 4) {
                sPos[i * 3] = (Math.random() - 0.5) * 1.4;
                sPos[i * 3 + 1] = 0.5;
                sPos[i * 3 + 2] = (Math.random() - 0.5) * 1;
            }
        }
        smoke.geometry.attributes.position.needsUpdate = true;

        // Update embers
        const ePos = embers.geometry.attributes.position.array;
        for (let i = 0; i < emberCount; i++) {
            ePos[i * 3] += emberVelocities[i * 3];
            ePos[i * 3 + 1] += emberVelocities[i * 3 + 1];
            ePos[i * 3 + 2] += emberVelocities[i * 3 + 2];
            if (ePos[i * 3 + 1] > 4) {
                ePos[i * 3] = (Math.random() - 0.5) * 3;
                ePos[i * 3 + 1] = 0;
                ePos[i * 3 + 2] = (Math.random() - 0.5) * 2;
            }
        }
        embers.geometry.attributes.position.needsUpdate = true;

        // Smooth mouse parallax
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        camera.position.x = mouse.x * 0.8;
        camera.position.y = 1.6 - mouse.y * 0.5 + scrollY * 0.001;
        camera.lookAt(0, 0.5, 0);

        // Fade out when scrolled away
        const fadeOut = Math.max(0, 1 - scrollY / (window.innerHeight * 0.8));
        canvas.style.opacity = fadeOut;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();
    resize();
}
