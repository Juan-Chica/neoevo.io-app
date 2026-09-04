import OfficeChair from "./OfficeChair";

function Monitor({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Monitor body */}
      <mesh castShadow>
        <boxGeometry args={[1.55, 0.92, 0.08]} />
        <meshStandardMaterial
          color="#05070A"
          roughness={0.22}
          metalness={0.45}
        />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.4, 0.78]} />

        <meshStandardMaterial
          color="#07111D"
          emissive="#0A84FF"
          emissiveIntensity={0.55}
          roughness={0.2}
        />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -0.61, 0]} castShadow>
        <boxGeometry args={[0.1, 0.34, 0.1]} />
        <meshStandardMaterial color="#0A0D11" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, -0.8, 0.08]} castShadow>
        <boxGeometry args={[0.56, 0.05, 0.38]} />
        <meshStandardMaterial color="#0A0D11" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function Desk({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Desktop */}
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.14, 1.75]} />

        <meshStandardMaterial
          color="#080A0D"
          roughness={0.3}
          metalness={0.18}
        />
      </mesh>

      {/* Desk legs */}
      <mesh position={[-2, 0.68, 0]} castShadow>
        <boxGeometry args={[0.16, 1.36, 1.35]} />
        <meshStandardMaterial color="#07090D" />
      </mesh>

      <mesh position={[2, 0.68, 0]} castShadow>
        <boxGeometry args={[0.16, 1.36, 1.35]} />
        <meshStandardMaterial color="#07090D" />
      </mesh>

      {/* Monitors */}
      <Monitor position={[-1.45, 2.12, -0.2]} rotation={[0, 0.18, 0]} />

      <Monitor position={[0, 2.18, -0.28]} />

      <Monitor position={[1.45, 2.12, -0.2]} rotation={[0, -0.18, 0]} />

      {/* Keyboard */}
      <mesh position={[0, 1.46, 0.4]} rotation={[-0.05, 0, 0]} castShadow>
        <boxGeometry args={[1.25, 0.06, 0.4]} />

        <meshStandardMaterial color="#11151B" roughness={0.45} />
      </mesh>

      {/* Mouse pad */}
      <mesh position={[1.05, 1.43, 0.42]}>
        <boxGeometry args={[0.8, 0.02, 0.55]} />

        <meshStandardMaterial color="#0B0F15" roughness={0.7} />
      </mesh>

      {/* Mouse */}
      <mesh position={[1.05, 1.52, 0.42]} castShadow>
        <sphereGeometry args={[0.13, 24, 24]} />

        <meshStandardMaterial color="#11151A" roughness={0.4} />
      </mesh>

      {/* Blue desk accent */}
      <mesh position={[0, 1.2, -0.84]}>
        <boxGeometry args={[4.2, 0.03, 0.03]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={5}
        />
      </mesh>

      <pointLight
        position={[0, 1.35, -0.6]}
        intensity={4}
        distance={3.5}
        color="#0A84FF"
      />

      <OfficeChair
        position={[0, 1.46, 1.40]}
        rotation={[0, Math.PI, 0]}
        scale={1.45}
      />
    </group>
  );
}
