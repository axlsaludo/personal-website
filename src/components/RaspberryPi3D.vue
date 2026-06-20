<template>
    <div ref="container" class="canvas-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const container = ref(null);

onMounted(() => {
    if (!container.value) return;

    // ─── SCENE SETUP ──────────────────────────────────────────────
    const scene = new THREE.Scene();

    // Clean background to match cream parchment
    scene.background = new THREE.Color("#f0ece4");

    const camera = new THREE.PerspectiveCamera(
        45,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        100,
    );
    // Top-down isometric view
    camera.position.set(0, 7, 1.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.value.appendChild(renderer.domElement);

    const group = new THREE.Group();
    // Push the model slightly up on the screen to perfectly center it within the tall canvas
    group.position.z = -0.3;
    scene.add(group);

    const explodableParts = [];

    // ─── GLTF LOADER ──────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
        "/raspberry_pi.glb",
        (gltf) => {
            // Scale and center the model
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            // Normalize size to be extremely large and fill the frame
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.8 / maxDim;
            gltf.scene.scale.set(scale, scale, scale);

            // Center it
            gltf.scene.position.x = -center.x * scale;
            gltf.scene.position.y = -center.y * scale;
            gltf.scene.position.z = -center.z * scale;

            // Solid opaque fill with thin wireframe edges
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    // Simple unlit material (no shadows or darkening)
                    child.material = new THREE.MeshBasicMaterial({
                        color: 0xf0ece4,
                    });

                    // Clean, thin outline edges instead of full triangle wireframes
                    const edges = new THREE.EdgesGeometry(child.geometry);
                    const line = new THREE.LineSegments(
                        edges,
                        new THREE.LineBasicMaterial({ color: 0x111111 }),
                    );
                    child.add(line);

                    child.userData.baseY = child.position.y;

                    // Approximate the vertical height of this mesh to calculate how far it explodes
                    child.geometry.computeBoundingBox();
                    const childBox = child.geometry.boundingBox;
                    const childCenterY = (childBox.max.y + childBox.min.y) / 2;
                    child.userData.centerY = childCenterY + child.position.y;

                    explodableParts.push(child);
                }
            });

            // Assign multipliers based on vertical stack order
            explodableParts.sort(
                (a, b) => a.userData.centerY - b.userData.centerY,
            );
            explodableParts.forEach((part, index) => {
                // The higher up the part is, the higher it flies (index 0 is the base board)
                part.userData.multiplier =
                    (index / explodableParts.length) * 6.0;
            });

            group.add(gltf.scene);
        },
        undefined,
        (error) => {
            console.error("Error loading GLTF model:", error);
        },
    );

    // ─── INTERACTION & ANIMATION LOOP ─────────────────────────────
    let animationFrameId;

    let targetExplode = 0;
    let currentExplode = 0;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e) => {
        if (!container.value) return;
        const rect = container.value.getBoundingClientRect();
        // Map mouse X across the canvas to explosion progress (0 to 1)
        const x = e.clientX - rect.left;
        targetExplode = Math.max(0, Math.min(1, x / rect.width));

        // Slight parallax rotation based on mouse position
        targetRotX = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
        targetRotY = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
    };

    const handlePointerLeave = () => {
        targetExplode = 0;
        targetRotX = 0;
        targetRotY = 0;
    };

    // Mobile Gyroscope Support
    const handleDeviceOrientation = (event) => {
        // Ensure we actually have gyroscope data
        if (event.gamma === null || event.beta === null) return;

        // Gamma is left/right tilt (-90 to 90)
        // Beta is front/back tilt (-180 to 180)
        const gamma = Math.max(-45, Math.min(45, event.gamma));
        const beta = Math.max(-45, Math.min(45, event.beta));

        // Map left/right tilt to the explosion progress (0 to 1)
        targetExplode = (gamma + 45) / 90;

        // Map tilts to parallax rotation
        targetRotX = (beta / 45) * 0.4;
        targetRotY = (gamma / 45) * 0.4;
    };

    container.value.addEventListener("mousemove", handlePointerMove);
    container.value.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("deviceorientation", handleDeviceOrientation);

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Lerp explosion and rotation for buttery smooth interaction
        currentExplode += (targetExplode - currentExplode) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.1;
        currentRotY += (targetRotY - currentRotY) * 0.1;

        // Static base orientation + interactive parallax
        group.rotation.set(0 + currentRotX, 0 + currentRotY, 0);

        // Apply explosion offsets interactively
        explodableParts.forEach((part) => {
            part.position.y =
                part.userData.baseY + currentExplode * part.userData.multiplier;
        });

        renderer.render(scene, camera);
    };

    animate();

    // ─── RESIZE HANDLER ───────────────────────────────────────────
    const handleResize = () => {
        if (!container.value) return;
        const width = container.value.clientWidth;
        const height = container.value.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        // Responsive scaling: shrink the entire scene on narrow screens (like phones)
        // 800px is the baseline width where scale = 1.0
        const responsiveScale = Math.min(1.0, width / 800);
        group.scale.set(responsiveScale, responsiveScale, responsiveScale);
    };
    window.addEventListener("resize", handleResize);
    // Call once initially to set correct scale
    setTimeout(handleResize, 50);

    // ─── CLEANUP ──────────────────────────────────────────────────
    onUnmounted(() => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener(
            "deviceorientation",
            handleDeviceOrientation,
        );
        if (container.value) {
            container.value.removeEventListener("mousemove", handlePointerMove);
            container.value.removeEventListener(
                "mouseleave",
                handlePointerLeave,
            );
        }
        renderer.dispose();
        // We cannot easily dispose gltf geometries here without tracking them all,
        // but the component unmounts rarely since it's a SPA root view.
    });
});
</script>

<style scoped>
.canvas-container {
    width: 100%;
    /* Dynamic height: 400px minimum for phones, up to 650px for desktops */
    height: clamp(400px, 60vh, 650px);
    cursor: crosshair;
    /* Mask image to blend the canvas edges smoothly into the background */
    -webkit-mask-image: radial-gradient(
        circle at center,
        black 45%,
        transparent 85%
    );
    mask-image: radial-gradient(circle at center, black 45%, transparent 85%);
    margin-bottom: 20px;
}
.canvas-container:active {
    cursor: crosshair;
}
</style>
