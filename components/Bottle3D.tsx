"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { MotionValue } from "framer-motion";

interface Bottle3DProps {
  rotation: MotionValue<number> | number;
  tilt?: MotionValue<number> | number;
  xOffset?: MotionValue<number> | number;
  yOffset?: MotionValue<number> | number;
  zoom?: MotionValue<number> | number;
}

export default function Bottle3D({
  rotation,
  tilt = 0,
  xOffset = 0,
  yOffset = 0,
  zoom = 1,
}: Bottle3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const rootMeshRef = useRef<THREE.Group | null>(null);
  const baseScaleRef = useRef<number>(1);

  const materialsRef = useRef<{
    cover: THREE.MeshStandardMaterial[];
    glass: THREE.MeshPhysicalMaterial[];
    wine: THREE.MeshStandardMaterial[];
    frontLabel: THREE.MeshStandardMaterial[];
    backLabel: THREE.MeshStandardMaterial[];
  }>({
    cover: [],
    glass: [],
    wine: [],
    frontLabel: [],
    backLabel: [],
  });

  const texturesRef = useRef<{
    grunerFront?: THREE.Texture;
    whiteFront?: THREE.Texture;
    redFront?: THREE.Texture;
    grunerBack?: THREE.Texture;
    whiteBack?: THREE.Texture;
    redBack?: THREE.Texture;
  }>({});

  const activeVariantRef = useRef<"gruner" | "white" | "red">("gruner");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    (window as any).THREE_DRACOLoader = DRACOLoader;
    (window as any).THREE_GLTFLoader = GLTFLoader;

    let renderCount = 0;
    const requestRender = () => {
      renderCount = 0;
    };

    const scene = new THREE.Scene();
    // Official Klimt perspective camera: FOV 34 at [0, 0, 6.1]
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
      precision: isMobile ? "mediump" : "highp",
      depth: true,
      stencil: false,
    });

    // Mobile DPR capping eliminates GPU fill-rate throttling
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Environment Lighting
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    new RGBELoader().load("/3d/Light_512.hdr", (hdr) => {
      scene.environment = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
      pmrem.dispose();
      requestRender();
    },
    undefined,
    (err) => {
      console.error("--- HDR LOAD ERROR ---", err);
    });

    // Studio Lights
    const ambient = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffeedd, 2.4);
    dir1.position.set(3, 4, 3);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xb0c4de, 1.1);
    dir2.position.set(-3, -1, 2);
    scene.add(dir2);

    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);
    bottleGroupRef.current = bottleGroup;

    // Load authentic front and back label textures
    const textureLoader = new THREE.TextureLoader();
    const grunerTex = textureLoader.load("/textures/gruner_front.webp", requestRender);
    grunerTex.colorSpace = THREE.SRGBColorSpace;
    grunerTex.flipY = false;
    texturesRef.current.grunerFront = grunerTex;

    const whiteTex = textureLoader.load("/textures/white_front.webp", requestRender);
    whiteTex.colorSpace = THREE.SRGBColorSpace;
    whiteTex.flipY = false;
    texturesRef.current.whiteFront = whiteTex;

    const redTex = textureLoader.load("/textures/red_front.webp", requestRender);
    redTex.colorSpace = THREE.SRGBColorSpace;
    redTex.flipY = false;
    texturesRef.current.redFront = redTex;

    const grunerBackTex = textureLoader.load("/textures/gruner_back.webp", requestRender);
    grunerBackTex.colorSpace = THREE.SRGBColorSpace;
    grunerBackTex.flipY = false;
    texturesRef.current.grunerBack = grunerBackTex;

    const whiteBackTex = textureLoader.load("/textures/white_back.webp", requestRender);
    whiteBackTex.colorSpace = THREE.SRGBColorSpace;
    whiteBackTex.flipY = false;
    texturesRef.current.whiteBack = whiteBackTex;

    const redBackTex = textureLoader.load("/textures/red_back.webp", requestRender);
    redBackTex.colorSpace = THREE.SRGBColorSpace;
    redBackTex.flipY = false;
    texturesRef.current.redBack = redBackTex;

    const applyVariant = (variant: "gruner" | "white" | "red") => {
      if (activeVariantRef.current === variant && materialsRef.current.cover.length > 0) return;
      activeVariantRef.current = variant;

      const { cover, glass, wine, frontLabel, backLabel } = materialsRef.current;
      const textures = texturesRef.current;

      if (variant === "gruner") {
        cover.forEach((m) => m.color.setHex(0x8fa876));
        glass.forEach((m) => m.color.setHex(0x28200c));
        wine.forEach((m) => m.color.setHex(0x846e22));
        if (textures.grunerFront) {
          frontLabel.forEach((m) => {
            m.map = textures.grunerFront!;
            m.needsUpdate = true;
          });
        }
        if (textures.grunerBack) {
          backLabel.forEach((m) => {
            m.map = textures.grunerBack!;
            m.needsUpdate = true;
          });
        }
      } else if (variant === "white") {
        cover.forEach((m) => m.color.setHex(0xd4a017));
        glass.forEach((m) => m.color.setHex(0x2a220e));
        wine.forEach((m) => m.color.setHex(0xa2842c));
        if (textures.whiteFront) {
          frontLabel.forEach((m) => {
            m.map = textures.whiteFront!;
            m.needsUpdate = true;
          });
        }
        if (textures.whiteBack) {
          backLabel.forEach((m) => {
            m.map = textures.whiteBack!;
            m.needsUpdate = true;
          });
        }
      } else if (variant === "red") {
        cover.forEach((m) => m.color.setHex(0x181818));
        glass.forEach((m) => m.color.setHex(0x12080a));
        wine.forEach((m) => m.color.setHex(0x38060f));
        if (textures.redFront) {
          frontLabel.forEach((m) => {
            m.map = textures.redFront!;
            m.needsUpdate = true;
          });
        }
        if (textures.redBack) {
          backLabel.forEach((m) => {
            m.map = textures.redBack!;
            m.needsUpdate = true;
          });
        }
      }
      requestRender();
    };

    // Load Draco GLB
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/3d/new_bottle-draco.glb", (gltf) => {
      console.log("--- BOTTLE GLB LOADED SUCCESSFULLY ---");
      const root = gltf.scene;
      rootMeshRef.current = root;

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.frustumCulled = false;

          if (mesh.name === "BOTTLE") {
            // Klimt official high-speed glass (transmission: 0 stops GPU readPixels stalls!)
            const mat = new THREE.MeshPhysicalMaterial({
              color: 0x28200c,
              roughness: 0.16,
              metalness: 0.05,
              transmission: 0,
              transparent: false,
              clearcoat: 0.95,
              clearcoatRoughness: 0.08,
              reflectivity: 0.65,
              envMapIntensity: 1.25,
            });
            mesh.material = mat;
            materialsRef.current.glass.push(mat);
          } else if (mesh.name === "WINE") {
            // High-speed wine material
            const mat = new THREE.MeshStandardMaterial({
              color: 0x846e22,
              roughness: 0.25,
              metalness: 0.1,
              envMapIntensity: 0.8,
            });
            mesh.material = mat;
            materialsRef.current.wine.push(mat);
          } else if (mesh.name.includes("COVER")) {
            const mat = new THREE.MeshStandardMaterial({
              color: 0x8fa876,
              roughness: 0.35,
              metalness: 0.28,
            });
            mesh.material = mat;
            materialsRef.current.cover.push(mat);
          } else if (mesh.name === "LABEL_VELTLINER") {
            const mat = new THREE.MeshStandardMaterial({
              map: grunerTex,
              roughness: 0.7,
              metalness: 0.15,
              transparent: true,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: -1,
            });
            mesh.material = mat;
            materialsRef.current.frontLabel.push(mat);
          } else if (mesh.name === "LABEL_VELTLINER_BACK") {
            const mat = new THREE.MeshStandardMaterial({
              map: grunerBackTex,
              roughness: 0.7,
              metalness: 0.15,
              transparent: true,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: -1,
            });
            mesh.material = mat;
            materialsRef.current.backLabel.push(mat);
          }
        }
      });

      // Compute exact bounding box
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // Center model horizontally and vertically with generous breathing room above pill
      root.position.x = -center.x;
      root.position.y = -center.y + (isMobile ? 0.22 : 0.32);
      root.position.z = -center.z;

      // Scale bottle to fit comfortably in viewport (70% on desktop, 65% on mobile)
      const vh = 2 * camera.position.z * Math.tan(((camera.fov * Math.PI) / 180) / 2);
      const baseScale = (vh * (isMobile ? 0.65 : 0.70)) / size.y;
      baseScaleRef.current = baseScale;
      const initialZoom = typeof zoom === "number" ? zoom : zoom.get ? zoom.get() : 1;
      const finalScale = baseScale * initialZoom;
      root.scale.set(finalScale, finalScale, finalScale);

      bottleGroup.add(root);

      // Set initial rotation, position, and variant
      const initialDeg = typeof rotation === "number" ? rotation : rotation.get();
      bottleGroup.rotation.y = (initialDeg * Math.PI) / 180;

      const initialTilt = typeof tilt === "number" ? tilt : tilt.get ? tilt.get() : 0;
      bottleGroup.rotation.z = (-initialTilt * Math.PI) / 180;

      const initialX = typeof xOffset === "number" ? xOffset : xOffset.get ? xOffset.get() : 0;
      bottleGroup.position.x = initialX;

      const initialY = typeof yOffset === "number" ? yOffset : yOffset.get ? yOffset.get() : 0;
      bottleGroup.position.y = initialY;

      if (initialDeg < 540) {
        applyVariant("gruner");
      } else if (initialDeg < 900) {
        applyVariant("white");
      } else {
        applyVariant("red");
      }
      requestRender();
    },
    undefined,
    (err) => {
      console.error("--- BOTTLE GLB LOAD ERROR ---", err);
    });

    // Real-time 60fps rotation binding & seamless back-of-spin variant swap
    let unsubscribeRotation: (() => void) | undefined;
    if (typeof rotation !== "number" && typeof rotation.on === "function") {
      unsubscribeRotation = rotation.on("change", (latestDeg) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.rotation.y = (latestDeg * Math.PI) / 180;
        }

        if (latestDeg < 540) {
          applyVariant("gruner");
        } else if (latestDeg < 900) {
          applyVariant("white");
        } else {
          applyVariant("red");
        }
        requestRender();
      });
    }

    // Real-time tilt binding (e.g. statement tilt)
    let unsubscribeTilt: (() => void) | undefined;
    if (typeof tilt !== "number" && typeof tilt.on === "function") {
      unsubscribeTilt = tilt.on("change", (latestTilt) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.rotation.z = (-latestTilt * Math.PI) / 180;
          requestRender();
        }
      });
    }

    // Real-time horizontal X offset binding
    let unsubscribeX: (() => void) | undefined;
    if (typeof xOffset !== "number" && typeof xOffset.on === "function") {
      unsubscribeX = xOffset.on("change", (latestX) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.position.x = latestX;
          requestRender();
        }
      });
    }

    // Real-time vertical Y offset binding
    let unsubscribeY: (() => void) | undefined;
    if (typeof yOffset !== "number" && typeof yOffset.on === "function") {
      unsubscribeY = yOffset.on("change", (latestY) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.position.y = latestY;
          requestRender();
        }
      });
    }

    // Real-time zoom / scale binding
    let unsubscribeZoom: (() => void) | undefined;
    if (typeof zoom !== "number" && typeof zoom.on === "function") {
      unsubscribeZoom = zoom.on("change", (latestZoom) => {
        if (rootMeshRef.current) {
          const s = baseScaleRef.current * latestZoom;
          rootMeshRef.current.scale.set(s, s, s);
          requestRender();
        }
      });
    }

    // Render-on-demand loop: executes short 30-frame bursts on change then idles at 0% GPU
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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
      requestRender();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (unsubscribeRotation) unsubscribeRotation();
      if (unsubscribeTilt) unsubscribeTilt();
      if (unsubscribeX) unsubscribeX();
      if (unsubscribeY) unsubscribeY();
      if (unsubscribeZoom) unsubscribeZoom();
      renderer.dispose();
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
        overflow: "visible",
      }}
    />
  );
}
