import {contactLinks} from '../public/publicContent';
import MonitorIcon from './MonitorIcon';
const primary = [
  {key:'call',icon:'phone',name:'Call',hint:'Opens phone app'},
  {key:'sms',icon:'message',name:'Message',hint:'Opens messages app'},
  {key:'email',icon:'email',name:'Email',hint:'Opens email app'},
];
const additional = [
  {key:'booking',name:'Book consultation'},
  {key:'whatsapp',name:'WhatsApp'},
  {key:'messenger',name:'Messenger'},
  {key:'instagram',name:'Instagram'},
];
export default function MonitorContactActions({more=false,expanded=false,onExpandedChange}) {
  if (more) return <details className="monitor-more-actions" open={expanded} onToggle={e=>onExpandedChange?.(e.currentTarget.open)}>
    <summary>More ways to connect <MonitorIcon name="chevron"/></summary>
    <div>{additional.map(item=><a key={item.key} href={contactLinks[item.key]} target="_blank" rel="noopener noreferrer" aria-label={item.name+' — opens outside office in a new tab'}>
      <span>{item.name}<small>Outside office · new tab</small></span><MonitorIcon name="external"/>
    </a>)}</div>
  </details>;
  return <div role="group" className="monitor-contact-actions" aria-label="Contact actions that open another application">
    {primary.map(item=><a key={item.key} href={contactLinks[item.key]} aria-label={item.name+' — '+item.hint+'. '+contactLinks[item.key].split(':').slice(1).join(':')}>
      <span className="monitor-action-symbol"><MonitorIcon name={item.icon}/></span>
      <span><strong>{item.name}</strong><small>{item.hint}</small></span>
      <MonitorIcon name="external" className="monitor-exit-icon"/>
    </a>)}
  </div>;
}
