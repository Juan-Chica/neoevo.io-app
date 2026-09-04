import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import OfficeScene from "../Components/office/OfficeScene";

export default function Office() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        shadows
        camera={{
          position: [0, 3.8, 11.5],
          fov: 42,
        }}
      >
        <color attach="background" args={["#05070A"]} />

        <OfficeScene />

        <OrbitControls
          target={[0, 2.4, -2.2]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
