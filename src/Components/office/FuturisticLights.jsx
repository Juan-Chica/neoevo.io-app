import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

export default function FuturisticLights() {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.traverse((node) => {
      if (!node.isMesh || !node.material?.isMeshStandardMaterial) return;
      let ancestor = node.parent;
      while (ancestor) {
        if (ancestor.name === 'Stage3Architecture') return;
        ancestor = ancestor.parent;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    });
  }, [scene]);
  return <>
    <hemisphereLight args={["#d8e7f0", "#151b22", 0.7]} />
    <ambientLight intensity={0.3} />
    <directionalLight position={[1, 5.4, 4]} intensity={2.5} color="#e3edfa"
      castShadow shadow-autoUpdate={false} shadow-needsUpdate
      shadow-mapSize={[1024,1024]} shadow-camera-left={-8}
      shadow-camera-right={8} shadow-camera-top={7} shadow-camera-bottom={-7}
      shadow-camera-near={0.5} shadow-camera-far={25} shadow-normalBias={0.03} shadow-radius={3} />
    <pointLight position={[-4.8, 4.6, 0.8]} intensity={32} distance={11} color="#ffe8c9" />
    <pointLight position={[2.6, 4.8, -1.7]} intensity={24} distance={10} color="#dceeff" />
    {/* One static studio capture supplies metal/stone reflections. No external HDR. */}
    <Environment frames={1} resolution={128}>
      <Lightformer form="rect" intensity={2} color="#e8f1ff" position={[0,5,0]}
        rotation={[Math.PI / 2,0,0]} scale={[8,5,1]} />
      <Lightformer form="rect" intensity={1.5} color="#fff0d7" position={[-6,3,1]}
        rotation={[0,Math.PI / 2,0]} scale={[5,3,1]} />
      <Lightformer form="rect" intensity={1} color="#8fc0d6" position={[6,3,-2]}
        rotation={[0,-Math.PI / 2,0]} scale={[5,3,1]} />
    </Environment>
  </>;
}
