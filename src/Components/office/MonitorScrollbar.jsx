import {useCallback,useEffect,useRef,useState} from 'react';
import {clampScroll,projectedTrackFraction,scrollbarGeometry} from './scrollbarMath';
export default function MonitorScrollbar({scrollRef,contentRef,section,monitor}){
 const rail=useRef(null),start=useRef(null),middle=useRef(null),end=useRef(null),drag=useRef(null),frame=useRef(0);
 const [state,setState]=useState({max:0,h:0,thumb:0,travel:0,top:0});
 const snapshot=()=>{const el=scrollRef.current;return el&&rail.current?{...scrollbarGeometry(rail.current.clientHeight,el.clientHeight,el.scrollHeight),top:el.scrollTop}:null;};
 const refresh=()=>{if(!frame.current)frame.current=requestAnimationFrame(()=>{frame.current=0;const next=snapshot();if(next)setState(old=>Object.keys(next).every(k=>Math.abs(next[k]-old[k])<.1)?old:next);});};
 const release=useCallback(()=>{const active=drag.current;drag.current=null;if(active&&rail.current?.hasPointerCapture(active.id))rail.current.releasePointerCapture(active.id);},[]);
 useEffect(()=>{
  const el=scrollRef.current,track=rail.current;if(!el||!track)return;
  let pending=0;
  const update=()=>{if(pending)return;pending=requestAnimationFrame(()=>{pending=0;const next={...scrollbarGeometry(track.clientHeight,el.clientHeight,el.scrollHeight),top:el.scrollTop};setState(old=>Object.keys(next).every(k=>Math.abs(next[k]-old[k])<.1)?old:next);if(next.max<=1&&document.activeElement===track)el.focus({preventScroll:true});});};
  update();const observer=new ResizeObserver(update);observer.observe(el);observer.observe(track);if(contentRef.current)observer.observe(contentRef.current);
  el.addEventListener('scroll',update,{passive:true});window.addEventListener('blur',release);document.addEventListener('visibilitychange',release);
  return()=>{observer.disconnect();el.removeEventListener('scroll',update);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',release);cancelAnimationFrame(pending);cancelAnimationFrame(frame.current);frame.current=0;release();};
 },[scrollRef,contentRef,section,release]);
 const position=e=>{const center=ref=>{const r=ref.current.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};};const t=projectedTrackFraction({x:e.clientX,y:e.clientY},center(start),center(middle),center(end));return t===null?null:t*Math.max(0,rail.current.clientHeight-4);};
 const apply=(value,max)=>{scrollRef.current.scrollTop=clampScroll(value,max);refresh();};
 const down=e=>{e.stopPropagation();if(e.button!==0||!e.isPrimary){release();return;}const g=snapshot(),y=position(e);if(!g||g.max<=1||g.travel<=0||y===null)return;e.preventDefault();rail.current.focus({preventScroll:true});if(!e.target.closest('[data-scroll-thumb]'))apply((y-g.thumb/2)/g.travel*g.max,g.max);drag.current={id:e.pointerId,y,top:scrollRef.current.scrollTop};rail.current.setPointerCapture(e.pointerId);};
 const move=e=>{e.stopPropagation();if(!drag.current||drag.current.id!==e.pointerId)return;e.preventDefault();const g=snapshot(),y=position(e);if(!g||!g.travel||y===null){release();return;}apply(drag.current.top+(y-drag.current.y)*g.max/g.travel,g.max);};
 const key=e=>{const el=scrollRef.current,g=snapshot();if(!el||!g)return;let next=el.scrollTop;switch(e.key){case 'ArrowDown':next+=40;break;case 'ArrowUp':next-=40;break;case 'PageDown':next+=el.clientHeight*.85;break;case 'PageUp':next-=el.clientHeight*.85;break;case 'Home':next=0;break;case 'End':next=g.max;break;default:return;}e.preventDefault();e.stopPropagation();apply(next,g.max);};
 const thumbTop=state.max?clampScroll(state.top/state.max,1)*state.travel:0,hitHeight=Math.min(state.h,Math.max(64,state.thumb));
 const hitTop=clampScroll(thumbTop-(hitHeight-state.thumb)/2,Math.max(0,state.h-hitHeight));
 return <div ref={rail} className="monitor-scrollbar" role="scrollbar" aria-label={monitor.title+' '+section+' scroll'} aria-controls={'monitor-'+monitor.id+'-scroll'} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={Math.round(state.max)} aria-valuenow={Math.round(clampScroll(state.top,state.max))} aria-valuetext={state.max?Math.round(state.top/state.max*100)+'%':'No scrolling needed'} aria-disabled={state.max<=1} aria-hidden={state.max<=1} tabIndex={state.max>1?0:-1} style={{visibility:state.max>1?'visible':'hidden'}} onPointerDown={down} onPointerMove={move} onPointerUp={e=>{e.stopPropagation();release();}} onPointerCancel={release} onLostPointerCapture={release} onKeyDown={key} onClick={e=>{e.preventDefault();e.stopPropagation();}}>
  <span ref={start} className="scrollbar-marker" style={{top:2}}/><span ref={middle} className="scrollbar-marker" style={{top:'50%'}}/><span ref={end} className="scrollbar-marker" style={{bottom:2}}/>
  <span className="scrollbar-track" aria-hidden="true"/>
  <span data-scroll-thumb="true" className="scrollbar-hit" style={{top:hitTop+2,height:hitHeight}} aria-hidden="true"><span className="scrollbar-thumb" style={{top:thumbTop-hitTop,height:state.thumb}}/></span>
 </div>;
}
