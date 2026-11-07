export function supportsWebGL(createCanvas=()=>document.createElement('canvas')){
 try{const gl=createCanvas().getContext('webgl2');if(!gl)return false;gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}catch{return false;}
}
