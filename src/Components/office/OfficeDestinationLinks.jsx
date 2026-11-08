import { DESTINATIONS } from './publicDestinations';
// Native document navigation preserves direct URLs, browser history and hash anchors.
export default function OfficeDestinationLinks(){return DESTINATIONS.map(d=>d.path
 ? <a key={d.title} href={d.path}>{d.title}</a>
 : <span key={d.title} aria-disabled="true" title="Destination pending approval">{d.title}</span>);}
