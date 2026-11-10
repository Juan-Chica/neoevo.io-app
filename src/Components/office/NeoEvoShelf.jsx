import { lazy, Suspense } from "react";
import { officeModel, DRACO_PATH } from "./officeAssets";
import { useGLTF } from "@react-three/drei";

const ShelfProps = lazy(() => import("./ShelfProps"));

export default function NeoEvoShelf({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  objects,
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
      {objects && <Suspense fallback={null}><ShelfProps {...objects} /></Suspense>}
    </group>
  );
}
