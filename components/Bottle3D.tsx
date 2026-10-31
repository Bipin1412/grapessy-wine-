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
  yOffset?: MotionValue<number> | number;
}

export default function Bottle3D({ rotation, tilt = 0, yOffset = 0 }: Bottle3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottleGroupRef = useRef<THREE.Group | null>(null);
  const rootMeshRef = useRef<THREE.Group | null>(null);

  const materialsRef = useRef<{
    cover: THREE.MeshStandardMaterial[];
    glass: THREE.MeshPhysicalMaterial[];
    wine: THREE.MeshPhysicalMaterial[];
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
  }>({});

  const activeVariantRef = useRef<"gruner" | "white" | "red">("gruner");

  const applyVariant = (variant: "gruner" | "white" | "red") => {
    if (activeVariantRef.current === variant) return;
    activeVariantRef.current = variant;

    const { cover, glass, wine, frontLabel } = materialsRef.current;
    const textures = texturesRef.current;

    if (variant === "gruner") {
      cover.forEach((m) => m.color.setHex(0x8fa876)); // mint green capsule
      glass.forEach((m) => m.color.setHex(0x241d08));
      wine.forEach((m) => m.color.setHex(0x846e22));
      if (textures.grunerFront) {
        frontLabel.forEach((m) => {
          m.map = textures.grunerFront!;
          m.needsUpdate = true;
        });
      }
    } else if (variant === "white") {
      cover.forEach((m) => m.color.setHex(0xcca31e)); // gold yellow capsule
      glass.forEach((m) => m.color.setHex(0x28200b));
      wine.forEach((m) => m.color.setHex(0xa2842c));
      if (textures.whiteFront) {
        frontLabel.forEach((m) => {
          m.map = textures.whiteFront!;
          m.needsUpdate = true;
        });
      }
    } else if (variant === "red") {
      cover.forEach((m) => m.color.setHex(0x181818)); // matte black capsule
      glass.forEach((m) => m.color.setHex(0x0c0406)); // deep dark ruby glass
      wine.forEach((m) => m.color.setHex(0x32030a)); // deep ruby wine
      if (textures.redFront) {
        frontLabel.forEach((m) => {
          m.map = textures.redFront!;
          m.needsUpdate = true;
        });
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    // Match official Klimt perspective camera: FOV 34 at [0, 0, 6.1]
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    // Load label textures
    const textureLoader = new THREE.TextureLoader();
    const grunerTex = textureLoader.load("/label-gruner.png");
    grunerTex.colorSpace = THREE.SRGBColorSpace;
    grunerTex.flipY = false;
    texturesRef.current.grunerFront = grunerTex;

    const whiteTex = textureLoader.load("/label-white.png");
    whiteTex.colorSpace = THREE.SRGBColorSpace;
    whiteTex.flipY = false;
    texturesRef.current.whiteFront = whiteTex;

    const redTex = textureLoader.load("/label-red.png");
    redTex.colorSpace = THREE.SRGBColorSpace;
    redTex.flipY = false;
    texturesRef.current.redFront = redTex;

    // Load Draco GLB
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load("/3d/new_bottle-draco.glb", (gltf) => {
      const root = gltf.scene;
      rootMeshRef.current = root;

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.frustumCulled = false;

          if (mesh.name === "BOTTLE") {
            const mat = new THREE.MeshPhysicalMaterial({
              color: 0x241d08,
              roughness: 0.14,
              transmission: 0.88,
              transparent: true,
              opacity: 0.94,
              reflectivity: 0.65,
              clearcoat: 0.95,
              clearcoatRoughness: 0.08,
              ior: 1.5,
            });
            mesh.material = mat;
            materialsRef.current.glass.push(mat);
          } else if (mesh.name === "WINE") {
            const mat = new THREE.MeshPhysicalMaterial({
              color: 0x846e22,
              roughness: 0.22,
              transmission: 0.72,
              transparent: true,
              opacity: 0.92,
              ior: 1.34,
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
              color: 0x141210,
              roughness: 0.55,
              metalness: 0.2,
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
      root.position.y = -center.y + 0.32;
      root.position.z = -center.z;

      // Scale bottle so height is exactly 70% of viewport height
      // Leaves ~15% padding above and ~15% padding below so the full bottle and bottom punt are 100% visible!
      const vh = 2 * camera.position.z * Math.tan(((camera.fov * Math.PI) / 180) / 2);
      const scale = (vh * 0.70) / size.y;
      root.scale.set(scale, scale, scale);

      bottleGroup.add(root);

      // Set initial rotation and variant
      const initialDeg = typeof rotation === "number" ? rotation : rotation.get();
      bottleGroup.rotation.y = (initialDeg * Math.PI) / 180;

      const initialTilt = typeof tilt === "number" ? tilt : tilt.get ? tilt.get() : 0;
      bottleGroup.rotation.z = (-initialTilt * Math.PI) / 180;

      const initialY = typeof yOffset === "number" ? yOffset : yOffset.get ? yOffset.get() : 0;
      bottleGroup.position.y = initialY;

      if (initialDeg < 180) {
        applyVariant("gruner");
      } else if (initialDeg < 540) {
        applyVariant("white");
      } else {
        applyVariant("red");
      }
    });

    // Real-time 60fps rotation binding & seamless back-of-spin variant swap
    let unsubscribeRotation: (() => void) | undefined;
    if (typeof rotation !== "number" && typeof rotation.on === "function") {
      unsubscribeRotation = rotation.on("change", (latestDeg) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.rotation.y = (latestDeg * Math.PI) / 180;
        }

        if (latestDeg < 180) {
          applyVariant("gruner");
        } else if (latestDeg < 540) {
          applyVariant("white");
        } else {
          applyVariant("red");
        }
      });
    }

    // Real-time tilt binding (e.g. statement tilt)
    let unsubscribeTilt: (() => void) | undefined;
    if (typeof tilt !== "number" && typeof tilt.on === "function") {
      unsubscribeTilt = tilt.on("change", (latestTilt) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.rotation.z = (-latestTilt * Math.PI) / 180;
        }
      });
    }

    // Real-time vertical Y offset binding
    let unsubscribeY: (() => void) | undefined;
    if (typeof yOffset !== "number" && typeof yOffset.on === "function") {
      unsubscribeY = yOffset.on("change", (latestY) => {
        if (bottleGroupRef.current) {
          bottleGroupRef.current.position.y = latestY;
        }
      });
    }

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (unsubscribeRotation) unsubscribeRotation();
      if (unsubscribeTilt) unsubscribeTilt();
      if (unsubscribeY) unsubscribeY();
      renderer.dispose();
      dracoLoader.dispose();
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
