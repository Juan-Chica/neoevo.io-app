import { officeModel, DRACO_PATH } from "./officeAssets";
import { useGLTF } from "@react-three/drei";

export default function NeoEvoShelf({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
}) {
  const { scene } = useGLTF(officeModel("neoevo-shelf.glb"), DRACO_PATH);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <primitive object={scene} />
    </group>
  );
}
