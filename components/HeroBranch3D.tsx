"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const BASE_ROTATION: [number, number, number] = [0, -Math.PI / 2, 0];
const MAX_SWAY = (15 * Math.PI) / 180;

export default function HeroBranch3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = typeof window !== "undefined" && (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Exact Camera: position [0, 0, 6.1], fov 34
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      precision: isMobile ? "mediump" : "highp",
      depth: true,
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    let isVisible = true;
    let renderCount = 0;
    const requestRender = () => {
      renderCount = 0;
    };

    // Environment Lighting with HDR
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader().load(
      "/3d/Light_512.hdr",
      (hdrTexture) => {
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;
        scene.environment = envMap;
        hdrTexture.dispose();
        pmremGenerator.dispose();
        requestRender();
      },
      undefined,
      () => {
        // Fallback lighting if HDR fails
        const ambient = new THREE.AmbientLight(0xfff5ea, 1.8);
        scene.add(ambient);
        const dir1 = new THREE.DirectionalLight(0xffeedd, 2.5);
        dir1.position.set(4, 5, 4);
        scene.add(dir1);
        const dir2 = new THREE.DirectionalLight(0xb0c4de, 1.2);
        dir2.position.set(-4, -2, 2);
        scene.add(dir2);
        requestRender();
      }
    );

    // Complementary key & fill lights to bring out rich moss and bark texture
    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xecdcd0, 0.9);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    // Group for positioning and sway
    const branchGroup = new THREE.Group();
    branchGroup.rotation.set(BASE_ROTATION[0], BASE_ROTATION[1], BASE_ROTATION[2]);
    scene.add(branchGroup);

    let sourceHeight = 0.9738;

    const updateTransform = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      // Exact viewport height at camera distance 6.1
      const vh = 2 * camera.position.z * Math.tan(((camera.fov * Math.PI) / 180) / 2);

      // Klimt responsive scale formula
      const scaleFactor = w < 768 ? 1.2 : w < 1024 ? 1.35 : 1.5;
      const scale = (vh * scaleFactor) / sourceHeight;
      branchGroup.scale.set(scale, scale, scale);

      // Klimt bottle bounds alignment
      const ref =
        w < 768
          ? { width: 1920, height: 1080, bottleBounds: { x: 867.33, y: 159.2, width: 185.33, height: 805.33 } }
          : w < 1024
          ? { width: 1920, height: 1080, bottleBounds: { x: 867.33, y: 159.2, width: 185.33, height: 805.33 } }
          : { width: 1920, height: 1080, bottleBounds: { x: 867.33, y: 159.2, width: 185.33, height: 805.33 } };

      const i = Math.max(w / ref.width, h / ref.height);
      const a = ref.width * i;
      const l = ref.height * i;
      const c = vh / Math.max(1, h);

      // Bottle visual center
      const bottleCenterX = ((w - a) / 2 + (ref.bottleBounds.x + ref.bottleBounds.width / 2) * i - w / 2) * c;
      const bottleCenterY = -(((h - l) / 2 + (ref.bottleBounds.y + ref.bottleBounds.height / 2) * i - h / 2) * c);

      // Calibrated offsets for continuous organic curve behind bottle
      const xOffset = w < 768 ? 0.35 : 0.45;
      const yOffset = w < 768 ? -0.1 : -0.15;

      branchGroup.position.set(bottleCenterX + xOffset, bottleCenterY + yOffset, 0);
      requestRender();
    };

    updateTransform();

    // Draco + GLTF loader with Draco WASM decoder
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "/branch_v1.glb",
      (gltf) => {
        const root = gltf.scene;

        // Measure source height without shifting model origin
        const box = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        box.getSize(size);
        sourceHeight = Math.max(size.y, 0.001);

        // Configure materials with Klimt's exact shader tweak
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = false;
            mesh.castShadow = false;
            mesh.receiveShadow = false;

            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.onBeforeCompile = (shader) => {
                shader.fragmentShader = shader.fragmentShader.replace(
                  "#include <opaque_fragment>",
                  `outgoingLight *= 0.85;\n#include <opaque_fragment>`
                );
              };
              mat.transparent = true;
              mat.depthWrite = true;
              mat.depthTest = true;
              mat.needsUpdate = true;
            }
          }
        });

        branchGroup.add(root);
        updateTransform();
      },
      undefined,
      (err) => console.error("Error loading branch_v1.glb:", err)
    );

    // Mouse sway tracking on desktop only
    let targetRotY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const normX = e.clientX / window.innerWidth;
      targetRotY = (normX * 2 - 1) * MAX_SWAY;
      requestRender();
    };
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Scroll listener to PAUSE rendering when scrolled past Hero
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroMax = window.innerHeight * 1.1;
      const nowVisible = scrollY < heroMax;
      if (nowVisible !== isVisible) {
        isVisible = nowVisible;
        if (isVisible) requestRender();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Animation loop: renders bursts on interaction/asset load then idles at 0% GPU
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const diff = Math.abs(BASE_ROTATION[1] + targetRotY - branchGroup.rotation.y);
      if (diff > 0.0005) {
        branchGroup.rotation.y += (BASE_ROTATION[1] + targetRotY - branchGroup.rotation.y) * 0.05;
        renderCount = 0;
      }

      if (renderCount < 30) {
        renderer.render(scene, camera);
        renderCount++;
      }
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateTransform();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      if (!isMobile) window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
