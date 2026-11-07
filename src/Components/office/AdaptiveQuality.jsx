import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { needsQualityReduction } from './renderQuality';
export default function AdaptiveQuality({moving,enabled,onReduce}) {
 const sample=useRef({start:0,frames:[]});
 useFrame((_,delta)=>{
  const s=sample.current;const now=performance.now();if(!s.start)s.start=now;
  if(!enabled||!moving||now-s.start<2000||delta>.5){s.frames=[];return;}
  s.frames.push(delta*1000);
  if(s.frames.length>=12&&s.frames.reduce((a,b)=>a+b,0)>=1200){if(needsQualityReduction(s.frames))onReduce();s.frames=[];}
 });
 return null;
}
