import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { officeAssetUrls } from './officeAssets';
let cleanupTimer;
export default function OfficeResourceLifetime(){
 const {scene}=useThree();
 useLayoutEffect(()=>{
  clearTimeout(cleanupTimer);
  document.documentElement.dataset.officeResourcesReleased="false";
  const geometries=new Set(),materials=new Set(),textures=new Set();
  const urls=officeAssetUrls();
  scene.traverse(o=>{if(!o.isMesh)return;geometries.add(o.geometry);for(const material of (Array.isArray(o.material)?o.material:[o.material])){if(!material)continue;materials.add(material);for(const value of Object.values(material))if(value?.isTexture)textures.add(value);}});
  return()=>{cleanupTimer=setTimeout(()=>{
   urls.forEach(url=>useGLTF.clear(url));
   geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
   textures.forEach(t=>{t.dispose();t.source?.data?.close?.();});
   document.documentElement.dataset.officeResourcesReleased='true';
  },0);};
 },[scene]);
 return null;
}
