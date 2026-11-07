import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { VIEWS, resolveView, cameraPath, smootherStep } from './officeNavigation';

export default function CinematicCamera({view,reducedMotion,onRest,onStart}) {
 const {camera,invalidate}=useThree();
 const {width,height,top}=useThree(state=>state.size);
 const canvasTop=view==='center'?top:0;
 const look=useRef(new Vector3(...VIEWS.overview.target));
 const motion=useRef(null);
 useEffect(()=>{
  const destination=resolveView(view,width/height,{height,top:canvasTop});
  const path=cameraPath(camera.position,destination.position);
  motion.current={path,elapsed:0,duration:(reducedMotion||camera.position.distanceTo(new Vector3(...destination.position))<1e-5)?0:MathUtils.clamp(path.getLength()/5,1.25,2.8),from:look.current.clone(),to:new Vector3(...destination.target),fov:camera.fov,destination};
  if(motion.current.duration>0)onStart?.();
  invalidate();
 },[camera,view,reducedMotion,width,height,canvasTop,onStart,invalidate]);
 useFrame((_,delta)=>{
  const m=motion.current;if(!m)return;
  m.elapsed+=m.started?Math.min(delta,.1):0;m.started=true;
  const t=m.duration===0?1:Math.min(1,m.elapsed/m.duration),ease=smootherStep(t);
  camera.position.copy(t===1?new Vector3(...m.destination.position):m.path.getPointAt(ease));
  look.current.lerpVectors(m.from,m.to,ease);camera.lookAt(look.current);
  const fov=MathUtils.lerp(m.fov,m.destination.fov,ease);
  camera.setFocalLength(.5*camera.getFilmHeight()/Math.tan(MathUtils.degToRad(fov)*.5));
  camera.updateMatrixWorld();
  if(t===1){motion.current=null;onRest();}else invalidate();
 });
 return null;
}
