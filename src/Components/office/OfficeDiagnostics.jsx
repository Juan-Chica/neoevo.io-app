import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function OfficeDiagnostics({sceneReady=false}) {
  const {invalidate}=useThree();const force=useRef(false);
  useEffect(()=>{force.current=true;invalidate();},[sceneReady,invalidate]);
  const stats = useRef({started:0,last:0,frames:[],lastPublish:0,renderedFrames:0});
  useFrame(({gl,camera,scene},delta) => {
    const s = stats.current;s.renderedFrames++;
    const now = performance.now();
    if (!s.started) s.started = now;
    if (now - s.started > 2000) s.frames.push(delta * 1000);
    if (s.frames.length > 600) s.frames.shift();
    if (!force.current && s.lastPublish && now - s.lastPublish < 500) return;
    force.current=false;
    s.lastPublish = now;
    const sorted = [...s.frames].sort((a,b)=>a-b);
    const mean = s.frames.reduce((a,b)=>a+b,0) / (s.frames.length || 1);
    const architecture = scene.getObjectByName('Stage3Architecture');
    if (architecture && !s.readyMs) s.readyMs = now;
    const resources = performance.getEntriesByType('resource').filter(r=>r.name.includes('.glb')).map(r=>({url:new URL(r.name).pathname,bytes:r.encodedBodySize,transfer:r.transferSize,durationMs:r.duration,endMs:r.responseEnd}));
    document.documentElement.dataset.officeMetrics = JSON.stringify({
      renderedFrames:s.renderedFrames,elapsedMs:now-s.started,sceneReadyMs:s.readyMs||0,frames:s.frames.length,fps:mean?1000/mean:0,
      frameP50Ms:sorted[Math.floor(sorted.length*.5)]||0,frameP95Ms:sorted[Math.floor(sorted.length*.95)]||0,
      rendererCalls:gl.info.render.calls,rendererTriangles:gl.info.render.triangles,
      geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,
      camera:camera.position.toArray(),architectureLoaded:!!architecture,
      viewport:[gl.domElement.width,gl.domElement.height],dpr:gl.getPixelRatio(),resources
    });
  });
  return null;
}
