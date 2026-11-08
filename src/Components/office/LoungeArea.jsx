import OfficeSofa from "./OfficeSofa";
import NeoEvoCoffeeTable from "./NeoEvoCoffeeTable";


function Cushion({ position, rotation = [0, 0, 0], size = [1, 0.18, 0.88] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#161B24" roughness={0.68} metalness={0.02} />
    </mesh>
  );
}

function SmallPlant({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.25, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>

      <mesh position={[0, 0.25, 0]} castShadow>
        <sphereGeometry args={[0.21, 24, 24]} />
        <meshStandardMaterial color="#245E3D" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function LoungeArea() {
  return (
    <group position={[-6.15, 0, -1.1]} rotation={[0, Math.PI / 2, 0]}>
      <OfficeSofa position={[0, 0.7, 0.7]} rotation={[0, 0, 0]} scale={2} />

      <NeoEvoCoffeeTable
        position={[0, 0.6, 3.5]}
        rotation={[0, 0, 0]}
        scale={1.4}
      />

    </group>
  );
}
