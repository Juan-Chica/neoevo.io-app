import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
export default function OfficeContextLifetime({onUnavailable}){
 const {gl}=useThree();
 useLayoutEffect(()=>{
  const element=gl.domElement;
  element.addEventListener('webglcontextlost',onUnavailable);
  return()=>element.removeEventListener('webglcontextlost',onUnavailable);
 },[gl,onUnavailable]);
 return null;
}
