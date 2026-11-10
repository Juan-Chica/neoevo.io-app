import { useEffect } from "react";
import OfficeResourceLifetime from "./OfficeResourceLifetime";
import FuturisticArchitecture from "./FuturisticArchitecture";
import Desk from "./Desk";
import LoungeArea from "./LoungeArea";
import NeoEvoShelf from "./NeoEvoShelf";
import FuturisticLights from "./FuturisticLights";
import LargePlant from "./LargePlant";

export default function OfficeScene({ updateSession, sessions, interactionReady, onDeskClick, onMonitorClick, onShelfClick, shelfObjects, selectedMonitor, highlightedMonitor, onMonitorHover, htmlPortal, onReady }) {
  useEffect(()=>{onReady?.();},[onReady]);
  return (
    <>
      <OfficeResourceLifetime />
      <FuturisticLights />

      <FuturisticArchitecture />
      <LoungeArea />
      <NeoEvoShelf
        position={[-3.2, 2.8, -5.5]}
        rotation={[0, 0, 0]}
        scale={3}
        onClick={onShelfClick}
        objects={shelfObjects}
      />
      <LargePlant 
        position={[-5.5, 1.8, -4.5]} 
        rotation={[0, 0, 0]} 
        scale={1.6} 
      />


      <Desk sessions={sessions} updateSession={updateSession} interactionReady={interactionReady}
        position={[2.7, 0, -1.15]}
        onClick={onDeskClick}
        onMonitorClick={onMonitorClick}
        selectedMonitor={selectedMonitor}
        highlightedMonitor={highlightedMonitor}
        onMonitorHover={onMonitorHover}
        htmlPortal={htmlPortal}
      />
    </>
  );
}
