"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Decal,
  OrbitControls,
  Center,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * Removes white/near-white background from an image using canvas.
 * Converts white-ish pixels to transparent.
 */
function removeWhiteBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Threshold: pixels with R, G, B all above this value are considered "white"
      const threshold = 235;
      // Edge softness: pixels between softMin and threshold get partial transparency
      const softMin = 210;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > threshold && g > threshold && b > threshold) {
          // Fully white -> fully transparent
          data[i + 3] = 0;
        } else if (r > softMin && g > softMin && b > softMin) {
          // Near-white -> partial transparency for smooth edges
          const avg = (r + g + b) / 3;
          const alpha = Math.round(((threshold - avg) / (threshold - softMin)) * 255);
          data[i + 3] = Math.max(0, Math.min(255, alpha));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

interface TshirtProps {
  processedImageUrl: string;
  color: string;
}

function Tshirt({ processedImageUrl, color }: TshirtProps) {
  const { nodes } = useGLTF("/shirt_baked.glb") as any;
  const meshRef = useRef<THREE.Mesh>(null);
  const decalMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Load texture manually to ensure transparency works
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(processedImageUrl);
    tex.anisotropy = 16;
    return tex;
  }, [processedImageUrl]);

  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.lerp(targetColor, 0.1);
    }
  });

  return (
    <group dispose={null}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          metalness={0}
          side={THREE.DoubleSide}
        />
        <Decal
          position={[0, 0.04, 0.15]}
          rotation={[0, 0, 0]}
          scale={0.38}
          depthTest={false}
        >
          <meshStandardMaterial
            ref={decalMaterialRef}
            map={texture}
            transparent={true}
            alphaTest={0.05}
            roughness={0.6}
            metalness={0}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </Decal>
      </mesh>
    </group>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-xl">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      <p className="text-sm text-slate-500 mt-4 font-medium">
        Cargando vista 3D...
      </p>
    </div>
  );
}

interface TshirtPreview3DProps {
  artImageBase64: string;
  artMimeType: string;
  color: string;
}

export default function TshirtPreview3D({
  artImageBase64,
  artMimeType,
  color,
}: TshirtPreview3DProps) {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  useEffect(() => {
    const originalUrl = `data:${artMimeType || "image/png"};base64,${artImageBase64}`;
    removeWhiteBackground(originalUrl).then(setProcessedUrl);
  }, [artImageBase64, artMimeType]);

  if (!processedUrl) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 2.5], fov: 25 }}
          gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 5]} intensity={0.8} />
          <Environment preset="city" />

          <Center>
            <Tshirt processedImageUrl={processedUrl} color={color} />
          </Center>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 1.8}
            autoRotate
            autoRotateSpeed={2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

useGLTF.preload("/shirt_baked.glb");
