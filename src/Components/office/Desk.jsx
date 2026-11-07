import OfficeDesk from './OfficeDesk';
import OfficeChair from './OfficeChair';
import MonitorScreen from './MonitorScreen';
import { MONITORS } from './officeNavigation';

export default function Desk({updateSession,sessions,interactionReady,position=[0,0,0],onClick,onMonitorClick,selectedMonitor,highlightedMonitor,onMonitorHover,htmlPortal}) {
 return <group position={position}>
  <OfficeDesk position={[0,1.5,-.5]} rotation={[0,0,0]} scale={2.5} />
  <OfficeChair position={[0,1.5,.5]} rotation={[0,Math.PI,0]} scale={1.45} />
  {/* Screens use measured world coordinates, offset for the original desk group. */}
  <group position={position.map(n=>-n)}>
    {MONITORS.map(m=><group key={m.id} onPointerOver={()=>onMonitorHover?.(m.id)} onPointerOut={()=>onMonitorHover?.(null)}>
      <MonitorScreen session={sessions[m.id]} updateSession={updateSession} interactionReady={interactionReady} monitor={m} active={selectedMonitor===m.id} highlighted={highlightedMonitor===m.id} onSelect={onMonitorClick} onHover={onMonitorHover} portal={htmlPortal} />
    </group>)}
  </group>
  <mesh position={[0,1.55,.5]} onClick={e=>{e.stopPropagation();onClick?.();}}>
    <boxGeometry args={[3.4,.45,.9]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
  </mesh>
 </group>;
}
