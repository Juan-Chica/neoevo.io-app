import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import OfficeDestinationLinks from '../Components/office/OfficeDestinationLinks';
import { AccessibleOfficeWork } from '../Components/office/ProjectSpotlight';
import ShelfExplorer, { AccessibleShelf } from '../Components/office/ShelfExplorer';
import { SHELF_ITEMS } from '../Components/office/shelfItems';
import CinematicCamera from '../Components/office/CinematicCamera';
import { officeProfile, clearOfficeProfile, officeAssetUrls, DRACO_PATH } from '../Components/office/officeAssets';
import OfficeContextLifetime from '../Components/office/OfficeContextLifetime';
import AdaptiveQuality from '../Components/office/AdaptiveQuality';
import { dprForDevice } from '../Components/office/renderQuality';
import { supportsWebGL } from '../Components/office/webglSupport';
import OfficeBoundary from '../Components/office/OfficeBoundary';
import OfficeDiagnostics from '../Components/office/OfficeDiagnostics';
import { MONITORS, VIEWS } from '../Components/office/officeNavigation';
import '../Components/office/OfficeExperience.css';
const OfficeScene=lazy(()=>import('../Components/office/OfficeScene'));

function useReducedMotion(){
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=e=>setReduced(e.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update);},[]);
 return reduced;
}
export default function Office({diagnostics=false,benchmark=false,initialFlat}){
 const [sceneReady,setSceneReady]=useState(false);const sceneLoaded=useCallback(()=>setSceneReady(true),[]);
 const [sessions,setSessions]=useState(()=>Object.fromEntries(['left','center','right'].map(id=>[id,{section:'Home',scroll:{},draft:{}}])));
 const updateSession=useCallback((id,patch)=>setSessions(all=>({...all,[id]:{...all[id],...patch}})),[]);
 const [view,setView]=useState('overview');const [moving,setMoving]=useState(false);
 const [shelfVisited,setShelfVisited]=useState(false);
 const [shelfItem,setShelfItem]=useState(null);
 const [shelfDestination,setShelfDestination]=useState(null);
 const shelfControls=useRef(null),pendingShelfFocus=useRef(null);
 const [available,setAvailable]=useState(supportsWebGL);
 const [flat,setFlat]=useState(()=>{if(initialFlat!==undefined)return initialFlat;try{return new URLSearchParams(location.search).get('mode')==='2d'||sessionStorage.getItem('neoevo-office-view')==='2d';}catch{return false;}});
 const [narrow,setNarrow]=useState(()=>window.innerWidth<700||window.matchMedia('(pointer: coarse)').matches);
 const [dprBudget,setDprBudget]=useState(2);
 const requestedQuality=new URLSearchParams(location.search).get('quality');
 const qualityMode=['high','low'].includes(requestedQuality)?requestedQuality:'auto';
 const dpr=dprForDevice({deviceDpr:window.devicePixelRatio||1,narrow,budget:dprBudget,mode:qualityMode});
 const reduceQuality=useCallback(()=>setDprBudget(b=>Math.max(1,b-.25)),[]);
 useEffect(()=>{const media=window.matchMedia('(pointer: coarse)');const update=()=>setNarrow(window.innerWidth<700||media.matches);window.addEventListener('resize',update);media.addEventListener('change',update);return()=>{window.removeEventListener('resize',update);media.removeEventListener('change',update);};},[]);
 const [hover,setHover]=useState(null);const [focus,setFocus]=useState(null);
 const systemReduced=useReducedMotion();const [manualReduced,setManualReduced]=useState(false);const reduced=systemReduced||manualReduced;const overviewButton=useRef(null);const htmlLayer=useRef(null);const nav=useRef(null);
 const selected=MONITORS.find(m=>m.id===view);const use3D=available&&!flat;
 const shelfReady=use3D&&sceneReady&&view==='shelf'&&!moving;
 const activeDestination=shelfDestination?.monitor===view?shelfDestination:null;
 const sceneSessions=activeDestination
  ? {...sessions,[view]:{...sessions[view],shelfDestination:activeDestination}} : sessions;
 useEffect(()=>{
  if(!shelfReady||!pendingShelfFocus.current)return;
  shelfControls.current?.querySelector(`[data-shelf-item="${pendingShelfFocus.current}"]`)?.focus({preventScroll:true});
  pendingShelfFocus.current=null;
 },[shelfReady]);
 const unavailable=useCallback(()=>{
  const urls=officeAssetUrls();setAvailable(false);setMoving(false);setSceneReady(false);
  import('@react-three/drei').then(({useGLTF})=>{urls.forEach(url=>useGLTF.clear(url));}).catch(()=>{});
 },[]);
 useEffect(()=>()=>clearOfficeProfile(),[]);
 useEffect(()=>{
  // A frozen document may resume with an invalid WebGL context after browser Back.
  const resume=e=>{if(e.persisted)window.location.reload();};
  window.addEventListener('pageshow',resume);
  return()=>window.removeEventListener('pageshow',resume);
 },[]);
 useEffect(()=>{
  if(!use3D)return;
  let cancelled=false;
  import('@react-three/drei').then(({useGLTF})=>{if(!cancelled)officeAssetUrls().forEach(url=>useGLTF.preload(url,DRACO_PATH));}).catch(()=>{if(!cancelled)unavailable();});
  return()=>{cancelled=true;};
 },[use3D,unavailable]);
 const select=useCallback(id=>{if(!VIEWS[id]||view===id)return;setView(id);setMoving(true);},[view]);
 const motionStarted=useCallback(()=>setMoving(true),[]);
 const rest=useCallback(()=>setMoving(false),[]);

 const go=useCallback(id=>{
  if(id===view)return;
  setShelfDestination(null);
  pendingShelfFocus.current=null;
  select(id);
 },[select,view]);
 const openShelf=()=>{
  setShelfVisited(true);
  go('shelf');
 };
 const openShelfFromControls=()=>{
  openShelf();
  pendingShelfFocus.current=SHELF_ITEMS[0].id;
 };
 const launchFromShelf=action=>{
  if(!shelfReady)return;
  setShelfDestination(action);
  select(action.monitor);
 };
 const backToShelf=()=>{
  pendingShelfFocus.current=shelfItem;
  setShelfDestination(null);
  select('shelf');
 };
 const reset=useCallback(()=>{
  go('overview');
  setShelfItem(null);
  overviewButton.current?.focus({preventScroll:true});
 },[go]);
 const handleShelfEscape=event=>{
  if(event.key!=='Escape'||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
  if(!use3D||(!activeDestination&&view!=='shelf'))return;
  event.preventDefault();
  event.stopPropagation();
  if(activeDestination)backToShelf();
  else if(shelfItem){
   shelfControls.current?.querySelector(`[data-shelf-item="${shelfItem}"]`)?.focus({preventScroll:true});
   setShelfItem(null);
  }else reset();
 };
 useEffect(()=>{
  const key=e=>{
   if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('.monitor-content,input,textarea,select,[contenteditable="true"]'))return;
   if(e.key==='Escape'||e.key==='Home'){e.preventDefault();reset();}
   if(['1','2','3'].includes(e.key)){e.preventDefault();go(MONITORS[Number(e.key)-1].id);}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[go,reset]);
 const navKey=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const buttons=[...nav.current.querySelectorAll('button')];const i=buttons.indexOf(e.target);buttons[(i+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length].focus({preventScroll:true});};
 return <div className="office-experience" onKeyDownCapture={handleShelfEscape} data-asset-profile={officeProfile()} data-quality={qualityMode} data-frameloop={benchmark||moving?"always":"demand"} data-scene-ready={sceneReady} data-office-view={view} data-camera-state={moving&&use3D?'moving':'settled'} data-motion={reduced?'reduced':'full'} data-render-mode={use3D?'3d':'2d'}>
  {use3D&&<OfficeBoundary onUnavailable={unavailable}>
   <div className="office-canvas">
    <Canvas shadows frameloop={benchmark||moving?"always":"demand"} dpr={dpr} camera={{position:VIEWS.overview.position,fov:VIEWS.overview.fov,near:.05,far:60}} gl={{antialias:true,toneMappingExposure:1.3}}
      onCreated={({gl})=>{gl.domElement.tabIndex=-1;gl.domElement.setAttribute('aria-label','NeoEvo 3D office. Use the monitor navigation and Explore shelf buttons for keyboard access.');}}>
     <OfficeContextLifetime onUnavailable={unavailable} />
     <color attach="background" args={['#05070A']} />
     <Suspense fallback={null}><OfficeScene sessions={sceneSessions} updateSession={updateSession} interactionReady={!moving} onDeskClick={()=>go('center')} onMonitorClick={go} onShelfClick={openShelf} shelfObjects={shelfVisited?{active:shelfReady,selected:shelfItem,onSelect:setShelfItem}:null} selectedMonitor={selected?.id} highlightedMonitor={focus||hover} onMonitorHover={setHover} htmlPortal={htmlLayer} onReady={sceneLoaded} /></Suspense>
     <AdaptiveQuality moving={moving} enabled={qualityMode==='auto'} onReduce={reduceQuality} />
     <CinematicCamera view={view} reducedMotion={reduced} onRest={rest} onStart={motionStarted} />
     {diagnostics&&<OfficeDiagnostics sceneReady={sceneReady} />}
    </Canvas>
   </div>
  </OfficeBoundary>}
  {use3D&&!sceneReady&&<div className="office-loading" role="status">Loading the office…<span>You can use the navigation below while it loads.</span></div>}
  <div ref={htmlLayer} className="office-html-layer" />
  <header className="office-header"><div><span className="office-eyebrow">NEOEVO</span><h1>Virtual headquarters</h1></div><div className="office-options"><label className="office-motion"><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e=>setManualReduced(e.target.checked)} /> Reduce motion</label><button className="office-mode" disabled={!available} onClick={()=>{setSceneReady(false);setFlat(!flat);setMoving(flat&&available);try{sessionStorage.setItem('neoevo-office-view',flat?'3d':'2d');}catch{/* Storage is optional. */}}}>{!available?'3D unavailable':use3D?'Use accessible view':'View 3D office'}</button></div></header>
  <main className={use3D?'office-access-panel':'office-flat-panel'}>
   {!use3D&&<><p className="office-eyebrow">EXPLORE NEOEVO</p><h2>Digital systems for growing businesses</h2><p>{available?'Explore our services without the 3D view.':'The 3D view is unavailable. All services and links remain accessible here.'}</p>{!available&&<button className="office-mode" onClick={()=>window.location.reload()}>Retry 3D view</button>}</>}
   <nav ref={nav} className="office-monitor-nav" aria-label="Office monitor navigation" onKeyDown={navKey}>
    {MONITORS.map((m,i)=><button key={m.id} aria-label={m.title+" monitor"} aria-keyshortcuts={String(i+1)} aria-pressed={view===m.id} onClick={()=>go(m.id)} onFocus={()=>setFocus(m.id)} onBlur={()=>setFocus(null)} onPointerEnter={()=>setHover(m.id)} onPointerLeave={()=>setHover(null)}><span className="office-key">{i+1}</span>{m.title}</button>)}
   </nav>
   <div className="office-selection" aria-live="polite" aria-atomic="true"><strong>{selected?.title||(view==='shelf'?'Interactive shelf':'Office overview')}</strong><p>{selected?.description||(view==='shelf'?'Choose a shelf object to learn more.':'Choose a monitor to explore. Use 1–3, Tab and Enter; Escape returns to overview.')}</p></div>
   {!use3D&&<nav className="office-destinations" aria-label="NeoEvo destinations"><OfficeDestinationLinks /></nav>}
   {!use3D&&<><AccessibleOfficeWork/><AccessibleShelf/></>}
   {shelfReady&&<ShelfExplorer selected={shelfItem} onSelect={setShelfItem} onOpen={launchFromShelf} controlsRef={shelfControls}/>}
   <div className="office-shelf-navigation">
    {use3D&&activeDestination&&<button type="button" onClick={backToShelf}>Back to shelf</button>}
    {use3D&&!activeDestination&&view!=='shelf'&&<button type="button" onClick={openShelfFromControls}>Explore shelf</button>}
    <button type="button" ref={overviewButton} className="office-overview" aria-keyshortcuts="Escape Home" onClick={reset}>Return to overview</button>
   </div>
  </main>
  {!use3D&&<div className="office-flat-categories">{MONITORS.map(m=><article key={m.id}><h2>{m.title}</h2><p>{m.description}</p><a href="/#services">Explore services</a></article>)}</div>}
 </div>;
}
