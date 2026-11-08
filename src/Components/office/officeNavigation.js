import { Vector3, CurvePath, LineCurve3, QuadraticBezierCurve3 } from 'three';

export const MONITORS = [
  { id:'left', title:'Websites', description:'Distinctive websites designed to turn visitors into customers.', position:[1.073,2.5,-1.72], angle:0.322 },
  { id:'center', title:'Business Systems', description:'Connected tools that make everyday operations simpler.', position:[2.697,2.5,-1.98], angle:0 },
  { id:'right', title:'AI Automations', description:'Practical automation that gives your team more time.', position:[4.316,2.5,-1.72], angle:-0.322 },
];
export { DESTINATIONS } from './publicDestinations.js';
export const VIEWS = {
  overview:{ position:[0,4.55,5.65], target:[0,2.25,-2.4], fov:65 },
  left:{ position:[0.96,2.67,-0.35], target:[1.073,2.5,-1.72], fov:44 },
  center:{ position:[2.697,2.70,-0.35], target:[2.697,2.5,-1.98], fov:44 },
  right:{ position:[4.316,2.67,-0.35], target:[4.316,2.5,-1.72], fov:44 },
  shelf:{ position:[-2.5,3.2,2.5], target:[-3.2,2.8,-5.5], fov:48 },
};
export const CAMERA_BOUNDS = {min:[-3,2.4,-0.6],max:[4.6,4.8,5.8]};
export const smootherStep = t => t*t*t*(t*(t*6-15)+10);

// Rounded, arc-length parameterized rails: rise clear of furniture, travel, descend.
export function cameraPath(start, destination) {
 const end=new Vector3(...destination);
 const points=[start.clone(),new Vector3(start.x,4.1,start.z),new Vector3(.2,4.1,2.8),new Vector3(end.x,4.1,end.z),end];
 const unique=points.filter((p,i)=>i===0||p.distanceTo(points[i-1])>1e-5);
 const path=new CurvePath();let last=unique[0];
 for(let i=1;i<unique.length-1;i++) {
  const corner=unique[i],prev=unique[i-1],next=unique[i+1];
  const r=Math.min(.22,corner.distanceTo(prev)*.25,corner.distanceTo(next)*.25);
  const enter=corner.clone().add(prev.clone().sub(corner).normalize().multiplyScalar(r));
  const exit=corner.clone().add(next.clone().sub(corner).normalize().multiplyScalar(r));
  if(last.distanceTo(enter)>1e-6)path.add(new LineCurve3(last,enter));
  path.add(new QuadraticBezierCurve3(enter,corner,exit));last=exit;
 }
 if(last.distanceTo(end)>1e-6)path.add(new LineCurve3(last,end));
 if(!path.curves.length)path.add(new LineCurve3(end,end));
 return path;
}

export function resolveView(id,aspect,viewport){
 const base=VIEWS[id]||VIEWS.overview;
 if(id==='overview')return aspect<.9?{...base,fov:85}:base;
 if(id==='shelf')return aspect<.9?{...base,fov:65}:base;
 // Keep the center camera in front of the chair. Fit narrow screens by widening the lens.
 const position=aspect<.9&&id!=='center'?[base.position[0],2.9,.7]:base.position;
 const distance=new Vector3(...position).distanceTo(new Vector3(...base.target));
 const maxFov=id==='center'?105:85;
 const fov=Math.max(base.fov,Math.min(maxFov,2*Math.atan(1.95/(2*distance*aspect))*180/Math.PI),2*Math.atan(1.3/(2*distance))*180/Math.PI);
 if(id!=='center'||!viewport?.height)return {...base,position,fov};

 // The desktop header sits over the canvas. Reserve room for it on short windows.
 const headerInset=Math.max(0,80-viewport.top);
 const usableHalfHeight=Math.max(viewport.height*.225,viewport.height/2-headerInset);
 // Allow for the bezel and its slightly nearer top edge.
 const screenTopSlope=.48/(distance-.1);
 const headerFov=2*Math.atan(screenTopSlope*viewport.height/(2*usableHalfHeight))*180/Math.PI;
 return {...base,position,fov:Math.max(fov,headerFov)};
}
