import { officeArchitecture, DRACO_PATH } from "./officeAssets";
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

// Blender exports use glTF Y-up in world metres; no additional rotation or scale.
function ArchitecturePart({ url, glass = false }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const object = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      if (!node.isMesh) return;
      // Decorative architecture never intercepts furniture interaction rays.
      node.raycast = () => null;
      node.receiveShadow = !glass;
      node.castShadow = false;
      node.material = node.material.clone();
      node.material.envMapIntensity = glass ? 0.65 : 0.8;
      if (node.material.name.startsWith('Ice cyan')) {
        node.material.emissive.set('#228ba8');
        node.material.emissiveIntensity = 1.5;
      }
      if (glass) {
        node.material.transparent = true;
        node.material.opacity = 0.16;
        node.material.depthWrite = false;
        node.material.roughness = 0.18;
        if ('transmission' in node.material) node.material.transmission = 0;
        node.renderOrder = 2;
      }
    });
    return copy;
  }, [scene, glass]);
  return <primitive object={object} />;
}

export default function FuturisticArchitecture() {
  return <group name="Stage3Architecture">
    <ArchitecturePart url={officeArchitecture("architecture")} />
    <ArchitecturePart url={officeArchitecture("lighting-brand")} />
    <ArchitecturePart url={officeArchitecture("glass")} glass />
  </group>;
}
