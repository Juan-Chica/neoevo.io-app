import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OfficeScene from "../Components/office/OfficeScene";

export default function Office() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 3.8, 11.5],
          fov: 42,
        }}
        gl={{
          antialias: true,
          toneMappingExposure: 1.3,
        }}
      >
        <color attach="background" args={["#05070A"]} />

        <OfficeScene />

        <OrbitControls
          target={[0, 2.4, -2.2]}
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
}
