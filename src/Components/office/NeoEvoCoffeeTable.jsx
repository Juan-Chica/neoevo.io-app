import { useGLTF } from "@react-three/drei";

export default function NeoEvoCoffeeTable({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF("/models/neoevo-coffee-table.glb");

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

useGLTF.preload("/models/neoevo-coffee-table.glb");