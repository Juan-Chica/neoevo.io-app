import { Text } from "@react-three/drei";

export default function BrandWall() {
  return (
    <group position={[0, 0, -5.72]}>
      {/* Main branding panel */}
      <mesh position={[0, 3.25, 0]} receiveShadow>
        <boxGeometry args={[5.2, 2.7, 0.1]} />

        <meshStandardMaterial
          color="#0B0F15"
          roughness={0.38}
          metalness={0.18}
        />
      </mesh>

      {/* Subtle blue glow behind the logo */}
      <pointLight
        position={[0, 3.45, 0.8]}
        intensity={12}
        distance={4.5}
        color="#0A84FF"
      />

      {/* Main NeoEvo branding */}
      <Text
        position={[0, 3.65, 0.08]}
        fontSize={0.72}
        color="#0A84FF"
        anchorX="center"
        anchorY="middle"
      >
        NEOEVO

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={2.2}
          metalness={0.5}
          roughness={0.2}
        />
      </Text>

      {/* Company tagline */}
      <Text
        position={[0, 3.02, 0.08]}
        fontSize={0.19}
        color="#E5E7EB"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        DIGITAL SYSTEMS FOR GROWING BUSINESSES
      </Text>

      {/* Small blue line */}
      <mesh position={[0, 2.67, 0.09]}>
        <boxGeometry args={[2.4, 0.025, 0.025]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={5}
        />
      </mesh>

      {/* Left decorative vertical line */}
      <mesh position={[-2.35, 3.25, 0.09]}>
        <boxGeometry args={[0.025, 2.25, 0.025]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={4}
        />
      </mesh>

      {/* Right decorative vertical line */}
      <mesh position={[2.35, 3.25, 0.09]}>
        <boxGeometry args={[0.025, 2.25, 0.025]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={4}
        />
      </mesh>
    </group>
  );
}