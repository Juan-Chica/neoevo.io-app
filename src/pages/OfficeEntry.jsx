import {lazy,Suspense,useEffect,useState} from 'react';
import {officeModel,clearOfficeProfile} from '../Components/office/officeAssets';
import {supportsWebGL} from '../Components/office/webglSupport';
import OfficeDestinationLinks from '../Components/office/OfficeDestinationLinks';
import { AccessibleOfficeWork } from '../Components/office/ProjectSpotlight';
import { AccessibleShelf } from '../Components/office/ShelfExplorer';
import './OfficeEntry.css';
const Office=lazy(()=>import('./Office'));
const storedFlat=()=>{try{return new URLSearchParams(location.search).get('mode')==='2d'||sessionStorage.getItem('neoevo-office-view')==='2d';}catch{return false;}};
export default function OfficeEntry(props){
 const [flat,setFlat]=useState(storedFlat);
 const [available]=useState(supportsWebGL);
 useEffect(()=>{
  if(flat||!available)return;
  // Discover only the largest reviewed model before renderer imports finish.
  const link=document.createElement('link');link.rel='preload';link.as='fetch';link.crossOrigin='anonymous';link.href=officeModel('office-chair.glb');
  document.head.appendChild(link);
  return()=>link.remove();
 },[flat,available]);
 useEffect(()=>()=>clearOfficeProfile(),[]);
 const toggle=()=>{const next=!flat;setFlat(next);try{sessionStorage.setItem('neoevo-office-view',next?'2d':'3d');}catch{/* Optional storage. */}};
 const fallback=<main className="office-entry" aria-label="Office loading and accessible navigation" style={{minHeight:'100dvh',padding:'32px',background:'#08121a',color:'#e7f1f6',fontFamily:'Arial,sans-serif'}}>
  <h1>NeoEvo virtual headquarters</h1>
  <p role="status">{flat?'Explore NeoEvo without the 3D view.':!available?'The 3D view is unavailable.':'Loading the office… Select accessible view to browse without 3D.'}</p>
  {(flat||!available)&&<nav aria-label="Accessible public website destinations" style={{display:'flex',gap:24,flexWrap:'wrap',color:'#9de2ef',textDecoration:'underline'}}><OfficeDestinationLinks/></nav>}
  {(flat||!available)&&<><AccessibleOfficeWork/><AccessibleShelf/></>}
  <p>Websites · Business Systems · AI Automations</p>
  {available&&<button onClick={toggle} style={{padding:'12px 16px',marginTop:16,border:'1px solid #9de2ef',borderRadius:8}}>{flat?'View 3D office':'Use accessible view'}</button>}
 </main>;
 return flat||!available?fallback:<Suspense fallback={fallback}><Office {...props} initialFlat={false}/></Suspense>;
}
