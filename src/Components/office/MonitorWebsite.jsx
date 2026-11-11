import {useLayoutEffect,useRef,useState} from 'react';
import MonitorScrollbar from './MonitorScrollbar';
import MonitorIcon from './MonitorIcon';
import MonitorContactActions from './MonitorContactActions';
import ContactForm from '../public/ContactForm';
import ProjectSpotlight from './ProjectSpotlight';
import {services,corporateAbout} from '../public/publicContent';
import './MonitorWebsite.css';
function revealSectionButton(button){
 const nav=button?.closest('nav');if(!nav)return;
 const left=button.offsetLeft,right=left+button.offsetWidth;
 if(left<nav.scrollLeft+3)nav.scrollTo({left:Math.max(0,left-3),behavior:'instant'});
 else if(right>nav.scrollLeft+nav.clientWidth-3)nav.scrollTo({left:right-nav.clientWidth+3,behavior:'instant'});
}
function revealLabeledField(event){
 const field=event.target;if(!field.matches('input,textarea'))return;
 const group=field.closest('.contact-field'),body=event.currentTarget;
 if(group&&body.offsetWidth<450&&field.offsetTop+field.offsetHeight-group.offsetTop<=body.clientHeight-8){
  body.scrollTop=Math.max(0,group.offsetTop-4);
 }
}
const sections=[{name:'Home',icon:'home'},{name:'Services',icon:'services'},{name:'Work',icon:'work'},{name:'About',icon:'about'},{name:'Contact',icon:'contact'}];
const categoryIcons=['web','systems','automation'];
export default function MonitorWebsite({updateSession,monitor,session,width}){
 const shortcut=session.shelfDestination;
 const [section,setSection]=useState(shortcut?.section??session.section);
 const [shortcutProject,setShortcutProject]=useState(shortcut?.project??session.project);
 const scroll=useRef(null),heading=useRef(null),positions=useRef(shortcut?{}:session.scroll),navigation=useRef(null),content=useRef(null);
 useLayoutEffect(()=>{scroll.current.scrollTop=positions.current[section]||0;heading.current?.focus({preventScroll:true});},[section]);
 useLayoutEffect(()=>{revealSectionButton(navigation.current?.querySelector('[aria-current="page"]'));},[section,width]);
 const select=name=>{if(!shortcut)updateSession({section:name});setSection(name);};
 const categoryIndex=monitor.id==='left'?0:monitor.id==='center'?1:2;
 const category=services[categoryIndex];
 return <section className="monitor-content monitor-website monitor-polished" aria-label={monitor.title+' monitor'} style={{width,height:width*.92/1.5}} onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>
  <header>
   <div className="monitor-brand-row"><span className="monitor-brand"><img src="/favicon.png" alt="" width="24" height="24"/><span>NeoEvo</span></span><span className="monitor-category"><MonitorIcon name={categoryIcons[categoryIndex]}/>{monitor.title}</span></div>
   <nav ref={navigation} className="monitor-site-nav" aria-label={monitor.title+' website sections'}>{sections.map(item=><button key={item.name} aria-current={item.name===section?'page':undefined} onFocus={e=>revealSectionButton(e.currentTarget)} onClick={()=>select(item.name)}><MonitorIcon name={item.icon}/><span>{item.name}</span></button>)}</nav>
  </header>
  <div className="monitor-reading-area">
   <div id={'monitor-'+monitor.id+'-scroll'} className="monitor-scroll" onFocusCapture={revealLabeledField} ref={scroll} onScroll={e=>{positions.current={...positions.current,[section]:e.currentTarget.scrollTop};if(!shortcut)updateSession({scroll:positions.current});}} tabIndex={0} aria-label={section+' content'}>
    <div ref={content} className="monitor-scroll-inner">
     <div className="monitor-section-heading"><span className="monitor-section-symbol"><MonitorIcon name={section==='Home'?categoryIcons[categoryIndex]:sections.find(s=>s.name===section).icon}/></span><h2 ref={heading} tabIndex={-1}>{section==='Home'?monitor.title:section}</h2></div>
     {section==='Home'&&<>
      <p className="monitor-lead">{monitor.description}</p>
      <article className="monitor-premium-card monitor-feature-card"><span className="monitor-card-kicker">Digital systems for growing businesses</span><h3>{category.title}</h3><p>{category.description}</p><button className="monitor-primary-button" onClick={()=>select('Services')}>Explore services <MonitorIcon name="arrow"/></button></article>
      <div className="monitor-quick-actions"><button onClick={()=>select('Work')}><MonitorIcon name="work"/><span>Explore our work</span><MonitorIcon name="arrow"/></button><button onClick={()=>select('Contact')}><MonitorIcon name="contact"/><span>Start a conversation</span><MonitorIcon name="arrow"/></button></div>
     </>}
     {section==='Services'&&<div className="monitor-card-list">{services.map((item,i)=><article className="monitor-premium-card" key={item.title}><div className="monitor-card-title"><span className="monitor-card-symbol"><MonitorIcon name={categoryIcons[i]}/></span><h3>{item.title}</h3></div><p>{item.description}</p><button className="monitor-text-button" onClick={()=>select('Contact')}>Contact NeoEvo <MonitorIcon name="arrow"/></button></article>)}</div>}
     {section==='Work'&&<ProjectSpotlight selected={shortcut?shortcutProject:session.project} onSelect={shortcut?setShortcutProject:project=>updateSession({project})}/>}
     {section==='About'&&<article className="monitor-premium-card monitor-about-card"><span className="monitor-card-kicker">NeoEvo</span><h3>Digital Systems for Growing Businesses</h3><p>{corporateAbout}</p><button className="monitor-primary-button" onClick={()=>select('Contact')}><MonitorIcon name="contact"/>Contact NeoEvo<MonitorIcon name="arrow"/></button></article>}
     {section==='Contact'&&<>
      <MonitorContactActions/>
      <div className="monitor-form-heading"><MonitorIcon name="contact"/><h3>Send a request</h3></div>
      <ContactForm idPrefix={'monitor-'+monitor.id} embedded showActions={false} draft={session.draft} onDraftChange={patch=>{updateSession({draft:{...session.draft,...patch}});}} onDraftReset={()=>{updateSession({draft:{}});}}/>
      <MonitorContactActions more expanded={session.contactLinksOpen || false} onExpandedChange={open=>updateSession({contactLinksOpen:open})}/>
     </>}
    </div>
   </div>
   <MonitorScrollbar scrollRef={scroll} contentRef={content} section={section} monitor={monitor}/>
  </div>
 </section>;
}
