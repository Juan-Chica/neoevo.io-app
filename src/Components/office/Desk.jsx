import OfficeDesk from "./OfficeDesk";
import OfficeChair from "./OfficeChair";

export default function Desk({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <OfficeDesk
        position={[0, 1.5, -0.5]}
        rotation={[0, 0, 0]}
        scale={2.5}
      />

      <OfficeChair
        position={[0, 1.5, 0.5]}
        rotation={[0, Math.PI, 0]}
        scale={1.45}
      />
    </group>
  );
}