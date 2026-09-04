import { useGLTF } from "@react-three/drei";

export default function OfficeChair({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF("/models/office-chair.glb");

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

useGLTF.preload("/models/office-chair.glb");