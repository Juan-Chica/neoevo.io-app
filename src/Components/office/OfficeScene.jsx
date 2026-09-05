import OfficeRoom from "./OfficeRoom";
import Desk from "./Desk";
import BrandWall from "./BrandWall";
import LoungeArea from "./LoungeArea";
import NeoEvoShelf from "./NeoEvoShelf";
import OfficeLights from "./OfficeLights";
import LargePlant from "./LargePlant";

export default function OfficeScene() {
  return (
    <>
      <OfficeLights />

      <OfficeRoom />
      <LoungeArea />
      <NeoEvoShelf
        position={[-3.2, 2.8, -5.5]}
        rotation={[0, 0, 0]}
        scale={3}
      />
      <LargePlant 
        position={[-5.5, 1.8, -4.5]} 
        rotation={[0, 0, 0]} 
        scale={1.6} 
      />

      <group position={[2.7, 0, 0]}>
        <BrandWall />
      </group>

      <Desk position={[2.7, 0, -1.15]} />
    </>
  );
}
