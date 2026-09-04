function Trophy({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.2, 24]} />
        <meshStandardMaterial
          color="#0B0F15"
          metalness={0.55}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.28, 16]} />
        <meshStandardMaterial
          color="#A7B0BF"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0.56, 0]} castShadow>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial
          color="#E5E7EB"
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

function NeoBox({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.52, 0.38, 0.34]} />
        <meshStandardMaterial
          color="#070A0F"
          roughness={0.28}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0.175]}>
        <planeGeometry args={[0.3, 0.08]} />
        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={3}
        />
      </mesh>
    </group>
  );
}

function ShelfLight({ y }) {
  return (
    <>
      <mesh position={[0, y, 0.54]}>
        <boxGeometry args={[2.1, 0.024, 0.024]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={6}
        />
      </mesh>

      <pointLight
        position={[0, y - 0.05, 0.75]}
        intensity={1.6}
        distance={1.8}
        color="#0A84FF"
      />
    </>
  );
}

export default function DisplayShelf() {
  return (
    <group position={[-3.15, 0, -5.55]}>
      {/* Back panel */}
      <mesh position={[0, 2.9, 0]} receiveShadow>
        <boxGeometry args={[2.55, 5.6, 0.18]} />

        <meshStandardMaterial
          color="#090C11"
          roughness={0.5}
          metalness={0.15}
        />
      </mesh>

      {/* Side rails */}
      <mesh position={[-1.22, 2.9, 0.24]} castShadow>
        <boxGeometry args={[0.1, 5.6, 0.52]} />

        <meshStandardMaterial
          color="#05070A"
          roughness={0.3}
          metalness={0.22}
        />
      </mesh>

      <mesh position={[1.22, 2.9, 0.24]} castShadow>
        <boxGeometry args={[0.1, 5.6, 0.52]} />

        <meshStandardMaterial
          color="#05070A"
          roughness={0.3}
          metalness={0.22}
        />
      </mesh>

      {/* Top frame */}
      <mesh position={[0, 5.65, 0.24]} castShadow>
        <boxGeometry args={[2.55, 0.1, 0.52]} />

        <meshStandardMaterial
          color="#05070A"
          roughness={0.3}
          metalness={0.22}
        />
      </mesh>

      {/* Bottom frame */}
      <mesh position={[0, 0.15, 0.24]} castShadow>
        <boxGeometry args={[2.55, 0.12, 0.52]} />

        <meshStandardMaterial
          color="#05070A"
          roughness={0.3}
          metalness={0.22}
        />
      </mesh>

      {/* Shelves */}
      {[1.2, 2.25, 3.3, 4.35].map((y) => (
        <mesh
          key={y}
          position={[0, y, 0.28]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.3, 0.075, 0.68]} />

          <meshStandardMaterial
            color="#090C11"
            roughness={0.32}
            metalness={0.18}
          />
        </mesh>
      ))}

      {/* Blue LEDs */}
      {[1.25, 2.3, 3.35, 4.4].map((y) => (
        <ShelfLight key={y} y={y} />
      ))}

      {/* Objects */}
      <Trophy position={[-0.58, 1.55, 0.72]} />
      <NeoBox position={[0.56, 1.5, 0.72]} />

      <NeoBox position={[-0.56, 2.55, 0.72]} />
      <Trophy position={[0.58, 2.58, 0.72]} />

      <Trophy position={[-0.58, 3.62, 0.72]} />
      <NeoBox position={[0.56, 3.58, 0.72]} />

      <NeoBox position={[-0.56, 4.65, 0.72]} />
      <Trophy position={[0.58, 4.68, 0.72]} />
    </group>
  );
}