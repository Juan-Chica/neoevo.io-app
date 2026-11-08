export function dprForDevice({deviceDpr=1,narrow=false,budget=2,mode='auto'}) {
 const ceiling=mode==='high'?2:mode==='low'?1:narrow?1.25:1.75;
 return Math.max(.75,Math.min(deviceDpr,ceiling,budget));
}
export function needsQualityReduction(frames){
 const elapsed=frames.reduce((a,b)=>a+b,0);
 if(frames.length<12||elapsed<1200)return false;
 const sorted=[...frames].sort((a,b)=>a-b),mean=elapsed/frames.length,p90=sorted[Math.floor(sorted.length*.9)];
 return (mean>65&&p90>80)||(frames.length>=24&&mean>42&&p90>48);
}
