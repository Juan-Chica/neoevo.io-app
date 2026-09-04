import OfficeRoom from "./OfficeRoom";
import Desk from "./Desk";
import BrandWall from "./BrandWall";
import LoungeArea from "./LoungeArea";
import DisplayShelf from "./DisplayShelf";

export default function OfficeScene() {
  return (
    <>
      {/* Base ambient light so the room is visible without losing the dark look */}
      <ambientLight intensity={1.45} />

      {/* Main white key light */}
      <directionalLight
        position={[4.5, 8, 7]}
        intensity={2.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Soft fill light from the front */}
      <pointLight
        position={[0, 4.5, 4.5]}
        intensity={16}
        distance={18}
        color="#ffffff"
      />

      {/* NeoEvo blue accent light for the back wall */}
      <pointLight
        position={[2.6, 3, -4.6]}
        intensity={28}
        distance={8}
        color="#0A84FF"
      />

      <OfficeRoom />

      {/* Left side lounge */}
      <LoungeArea />

      {/* Shelf placed between lounge and workstation */}
      <group position={[-0.9, 0, 0]}>
        <DisplayShelf />
      </group>

      {/* Main branding shifted right so it stays visible */}
      <group position={[2.7, 0, 0]}>
        <BrandWall />
      </group>

      {/* Workstation becomes the main focal point on the right */}
      <Desk position={[2.7, 0, -1.15]} />
    </>
  );
}
