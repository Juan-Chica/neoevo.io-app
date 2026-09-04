export default function OfficeRoom() {
  return (
    <group>
      {/* Floor */}
      <mesh
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <boxGeometry args={[14, 0.2, 12]} />

        <meshStandardMaterial
          color="#11151B"
          roughness={0.58}
          metalness={0.08}
        />
      </mesh>

      {/* Back wall */}
      <mesh
        position={[0, 3, -6]}
        receiveShadow
      >
        <boxGeometry args={[14, 6, 0.2]} />

        <meshStandardMaterial
          color="#181D25"
          roughness={0.78}
          metalness={0.03}
        />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-7, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[12, 6, 0.2]} />

        <meshStandardMaterial
          color="#14181F"
          roughness={0.8}
        />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[7, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[12, 6, 0.2]} />

        <meshStandardMaterial
          color="#14181F"
          roughness={0.8}
        />
      </mesh>

      {/* Ceiling */}
      <mesh
        position={[0, 6, 0]}
        receiveShadow
      >
        <boxGeometry args={[14, 0.15, 12]} />

        <meshStandardMaterial
          color="#080A0E"
          roughness={0.75}
        />
      </mesh>

      {/* Back wall lower LED */}
      <mesh
        position={[2.5, 0.22, -5.82]}
      >
        <boxGeometry args={[6.2, 0.035, 0.035]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={6}
        />
      </mesh>

      {/* Left wall vertical LED */}
      <mesh
        position={[-6.82, 3.25, -4.6]}
      >
        <boxGeometry args={[0.03, 4.8, 0.03]} />

        <meshStandardMaterial
          color="#0A84FF"
          emissive="#0A84FF"
          emissiveIntensity={5}
        />
      </mesh>

      {/* Ceiling lights */}

      <pointLight
        position={[-3.5, 5.5, 1]}
        intensity={9}
        distance={8}
        color="#ffffff"
      />

      <pointLight
        position={[0, 5.5, 1]}
        intensity={9}
        distance={8}
        color="#ffffff"
      />

      <pointLight
        position={[3.5, 5.5, 1]}
        intensity={9}
        distance={8}
        color="#ffffff"
      />

      {/* Subtle floor blue bounce */}
      <pointLight
        position={[2.5, 0.4, -3]}
        intensity={6}
        distance={5}
        color="#0A84FF"
      />
    </group>
  );
}