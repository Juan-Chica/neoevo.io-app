export default function OfficeLights() {
  return (
    <>
      {/* General room visibility */}
      <ambientLight intensity={0.7} />

      {/* Main white light */}
      <directionalLight
        position={[0, 7, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Lounge fill */}
      <pointLight
        position={[-4, 3.5, 1]}
        intensity={12}
        distance={9}
        decay={2}
        color="#dbeafe"
      />

      {/* Workstation fill */}
      <pointLight
        position={[2.5, 3, 1]}
        intensity={10}
        distance={8}
        decay={2}
        color="#dbeafe"
      />

      {/* Blue workstation accent */}
      <pointLight
        position={[2.5, 2.3, -2]}
        intensity={4}
        distance={5}
        decay={2}
        color="#0A84FF"
      />

      {/* Back wall blue wash */}
      <pointLight
        position={[1.5, 3.5, -4]}
        intensity={5}
        distance={6}
        decay={2}
        color="#0A84FF"
      />
    </>
  );
}