export const clampScroll=(v,max)=>Math.max(0,Math.min(max,v));
// Invert the 1D projective transform using projected start/mid/end points.
export function projectedTrackFraction(point,start,mid,end){
 const dx=end.x-start.x,dy=end.y-start.y,den=dx*dx+dy*dy;if(den<1)return null;
 const project=p=>((p.x-start.x)*dx+(p.y-start.y)*dy)/den;
 const u=project(point),m=project(mid);if(m<=.01||m>=.99)return null;
 const c=(2*m-1)/(1-m),a=c+1,d=a-c*u;
 return Math.abs(d)<1e-6?null:clampScroll(u/d,1);
}
export function scrollbarGeometry(height,visible,total){
 const max=Math.max(0,total-visible),h=Math.max(0,height-4);
 const thumb=Math.min(h,Math.max(24,h*(total?visible/total:1)));
 return {max,h,thumb,travel:Math.max(0,h-thumb)};
}
