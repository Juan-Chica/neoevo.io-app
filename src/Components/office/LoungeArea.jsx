import { Text } from "@react-three/drei";
import OfficeSofa from "./OfficeSofa";

function Cushion({
  position,
  rotation = [0, 0, 0],
  size = [1, 0.18, 0.88],
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#161B24"
        roughness={0.68}
        metalness={0.02}
      />
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
        <meshStandardMaterial
          color="#245E3D"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

export default function LoungeArea() {
  return (
    <group
      position={[-6.15, 0, -1.1]}
      rotation={[0, Math.PI / 2, 0]}
    >

      <OfficeSofa
        position={[0, 0.7, 0.7]}
        rotation={[0, 0, 0]}
        scale={2}
      />

      {/* Coffee table */}
      <mesh
        position={[0.4, 0.35, 2.5]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.15, 0.1, 1.05]} />

        <meshStandardMaterial
          color="#080A0E"
          roughness={0.28}
          metalness={0.22}
        />
      </mesh>

      {/* Table legs */}
      <mesh
        position={[-0.3, 0.17, 2.5]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.34, 0.8]} />
        <meshStandardMaterial color="#05070A" />
      </mesh>

      <mesh
        position={[1.1, 0.17, 2.5]}
        castShadow
      >
        <boxGeometry args={[0.08, 0.34, 0.8]} />
        <meshStandardMaterial color="#05070A" />
      </mesh>

      {/* Plant */}
      <SmallPlant
        position={[0.4, 0.58, 2.5]}
      />

      {/* Wall poster */}
      <group>
        <mesh
          position={[0, 3.15, -0.58]}
          castShadow
        >
          <boxGeometry args={[2.75, 2.45, 0.08]} />

          <meshStandardMaterial
            color="#080B10"
            roughness={0.38}
            metalness={0.12}
          />
        </mesh>

        <mesh
          position={[0, 3.15, -0.53]}
        >
          <planeGeometry args={[2.5, 2.2]} />

          <meshStandardMaterial
            color="#0E131B"
            roughness={0.4}
          />
        </mesh>

        <Text
          position={[0, 3.7, -0.49]}
          fontSize={0.27}
          color="#F8FAFC"
          anchorX="center"
          anchorY="middle"
        >
          WE BUILD
        </Text>

        <Text
          position={[0, 3.3, -0.49]}
          fontSize={0.3}
          color="#0A84FF"
          anchorX="center"
          anchorY="middle"
        >
          DIGITAL SYSTEMS
        </Text>

        <Text
          position={[0, 2.87, -0.49]}
          fontSize={0.23}
          color="#E5E7EB"
          anchorX="center"
          anchorY="middle"
        >
          THAT HELP BUSINESSES
        </Text>

        <Text
          position={[0, 2.5, -0.49]}
          fontSize={0.31}
          color="#0A84FF"
          anchorX="center"
          anchorY="middle"
        >
          GROW.
        </Text>

        <mesh
          position={[0, 2.18, -0.48]}
        >
          <boxGeometry args={[1.55, 0.02, 0.02]} />

          <meshStandardMaterial
            color="#0A84FF"
            emissive="#0A84FF"
            emissiveIntensity={4}
          />
        </mesh>
      </group>

      {/* Lounge accent light */}
      <pointLight
        position={[0.4, 2.2, 1.1]}
        intensity={3.5}
        distance={3.4}
        color="#0A84FF"
      />
    </group>
  );
}