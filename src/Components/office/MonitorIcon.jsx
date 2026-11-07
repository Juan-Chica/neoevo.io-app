// A small, consistent UI set. Icons decorate visible text; controls keep their names.
const shapes = {
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  web: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18m-13 5-2 2 2 2m8-4 2 2-2 2m-3-5-2 6"/></>,
  systems: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12m4-8h4m-4 4h4"/></>,
  automation: <><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4m-11-4 2 2 3-3"/></>,
  services: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  work: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12l9 3 9-3m-9 1v4"/></>,
  about: <><path d="M4 21V3h12v18m0-12h4v12M2 21h20M8 7h4m-4 4h4m-4 4h4m-4 6v-3h4v3"/></>,
  contact: <><path d="M4 4h16v12H9l-5 4Z"/><path d="M8 8h8m-8 4h5"/></>,
  phone: <path d="m7 3 3 5-3 2a14 14 0 0 0 7 7l2-3 5 3-1 4C10 22 2 14 3 4Z"/>,
  message: <><path d="M3 4h18v13H9l-6 4Z"/><path d="M7 8h10m-10 5h6"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  external: <><path d="M14 3h7v7m0-7L10 14"/><path d="M10 3H3v18h18v-7"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>,
};
export default function MonitorIcon({name,className=''}) {
  return <svg className={'monitor-ui-icon '+className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{shapes[name] || shapes.arrow}</svg>;
}
