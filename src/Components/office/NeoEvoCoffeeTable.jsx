import { officeModel, DRACO_PATH } from "./officeAssets";
import { useGLTF } from "@react-three/drei";

export default function NeoEvoCoffeeTable({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const { scene } = useGLTF(officeModel("neoevo-coffee-table.glb"), DRACO_PATH);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}
