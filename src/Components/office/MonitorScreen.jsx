import { useMemo, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { CanvasTexture, SRGBColorSpace } from 'three';
import MonitorWebsite from './MonitorWebsite';
import {useThree} from '@react-three/fiber';
import './MonitorScreen.css';

export default function MonitorScreen({updateSession,session,interactionReady,monitor,active,highlighted,onSelect,onHover,portal}) {
 const {size,scene}=useThree();
 const logicalWidth=Math.min(760,Math.max(300,size.width<700?size.width-40:600));
 // Fixed focus positions are validated clear of furniture. During camera travel HTML is absent.
 // Ray-test architecture only; high-poly furniture raycasts would tax every benchmark frame.
 const architecture=scene.getObjectByName('Stage3Architecture');
 const occluders=architecture?[{current:architecture}]:[];
 const texture=useMemo(()=>{
  const c=document.createElement('canvas');c.width=1024;c.height=600;
  const ctx=c.getContext('2d');ctx.fillStyle='#07121c';ctx.fillRect(0,0,1024,600);
  ctx.fillStyle='#85cfe1';ctx.font='500 25px Arial';ctx.fillText('N E O E V O',70,90);
  ctx.fillStyle='#edf6fa';ctx.font='600 60px Arial';
  const words=monitor.title.split(' ');if(monitor.id==='center'){ctx.fillText(words[0],70,220);ctx.fillText(words[1],70,295);}else ctx.fillText(monitor.title,70,240);
  ctx.fillStyle='#54bfd6';ctx.fillRect(70,380,880,3);ctx.fillStyle='#afc7d1';ctx.font='26px Arial';ctx.fillText('Select to explore',70,480);
  const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;return t;
 },[monitor]);
 useEffect(()=>()=>texture.dispose(),[texture]);

 return <group position={monitor.position} rotation={[0,monitor.angle,0]}>
  <mesh name={'MonitorTarget-'+monitor.id}
    onClick={e=>{e.stopPropagation();onSelect(monitor.id);}}
    onPointerOver={e=>{e.stopPropagation();onHover?.(monitor.id);document.body.style.cursor='pointer';}}
    onPointerOut={()=>{onHover?.(null);document.body.style.cursor='default';}}>
    <planeGeometry args={[1.5,.92]} />
    <meshBasicMaterial map={texture} toneMapped={false} />
  </mesh>
  {[[0,.475,1.54,.012],[0,-.475,1.54,.012],[-.765,0,.012,.96],[.765,0,.012,.96]].map(([x,y,w,h],i)=><mesh key={i} position={[x,y,.006]} raycast={()=>null}>
    <planeGeometry args={[w,h]} /><meshBasicMaterial color={active?'#c4f4ff':highlighted?'#77d9ef':'#273d4a'} toneMapped={false} />
  </mesh>)}
  {active&&interactionReady&&<Html portal={portal} transform wrapperClass="neoevo-monitor-portal" distanceFactor={600/logicalWidth} occlude={occluders} position={[0,0,.025]} style={{width:logicalWidth,height:logicalWidth*.92/1.5,pointerEvents:'auto'}}>
    <MonitorWebsite updateSession={patch=>updateSession(monitor.id,patch)} monitor={monitor} session={session} width={logicalWidth}/>
  </Html>}
 </group>;
}
