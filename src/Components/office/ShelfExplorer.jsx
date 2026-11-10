import { useId, useLayoutEffect, useRef, useState } from 'react';
import ProjectSpotlight from './ProjectSpotlight';
import { corporateAbout, services } from '../public/publicContent';
import { SHELF_ITEMS } from './shelfItems';
import './ShelfExplorer.css';

export default function ShelfExplorer({ selected, onSelect, onOpen, controlsRef, flat = false }) {
  const item = SHELF_ITEMS.find(entry => entry.id === selected);
  const panel = useId();
  return (
    <section className="office-shelf-explorer" aria-label="Explore shelf objects" ref={controlsRef}>
      <div className="office-shelf-objects" role="group" aria-label="Shelf objects">
        {SHELF_ITEMS.map(entry => (
          <button type="button" key={entry.id} data-shelf-item={entry.id} aria-pressed={selected === entry.id}
            aria-controls={panel} onClick={() => onSelect(entry.id)}>{entry.title}</button>
        ))}
      </div>
      <div id={panel} className="office-shelf-detail" hidden={!item}>
        <div aria-live="polite">
          {item && <><h2>{item.title}</h2><p>{item.description}</p></>}
        </div>
        {item && <div className="office-shelf-actions">
          {item.actions.map((action, index) => (
            <button type="button" key={action.section} onClick={() => onOpen(action)}>
              {index === 0 ? (flat ? 'Open related content' : 'Open on monitor') : action.section}
            </button>
          ))}
        </div>}
      </div>
    </section>
  );
}

export function AccessibleShelf() {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [destination, setDestination] = useState(null);
  const [project, setProject] = useState();
  const controls = useRef(null);
  const heading = useRef(null);
  const disclosure = useRef(null);
  const pending = useRef(null);

  useLayoutEffect(() => {
    if (destination) heading.current?.focus();
    else if (pending.current) {
      controls.current?.querySelector(`[data-shelf-item="${pending.current}"]`)?.focus();
      pending.current = null;
    }
  }, [destination]);

  const open = action => {
    setProject(action.project);
    setDestination(action.section);
  };
  const back = () => {
    pending.current = selected;
    setDestination(null);
  };

  const overview = () => {
    disclosure.current.open = false;
    disclosure.current.querySelector('summary').focus();
    pending.current = null;
    setDestination(null);
    setSelected(null);
  };
  const escape = event => {
    if (event.key !== 'Escape' || !expanded) return;
    event.preventDefault();
    event.stopPropagation();
    if (destination) back();
    else if (selected) {
      controls.current?.querySelector(`[data-shelf-item="${selected}"]`)?.focus();
      setSelected(null);
    } else overview();
  };

  return (
    <details ref={disclosure} className="office-shelf-disclosure" onKeyDown={escape}
      onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>Explore shelf</summary>
      {expanded && (!destination
        ? <ShelfExplorer flat selected={selected} onSelect={setSelected} onOpen={open} controlsRef={controls} />
        : <section className="office-shelf-flat-destination" aria-label="Shelf destination">
            <button type="button" onClick={back}>Back to shelf</button>
            <h2 ref={heading} tabIndex={-1}>{destination}</h2>
            {destination === 'Work' && <ProjectSpotlight selected={project} onSelect={setProject} />}
            {destination === 'About' && <p>{corporateAbout}</p>}
            {destination === 'Services' && <ul>{services.map(service => (
              <li key={service.title}><strong>{service.title}</strong><p>{service.description}</p></li>
            ))}</ul>}
            {destination === 'Contact' && <a href="/#contact">Contact NeoEvo</a>}
          </section>)}
      {expanded && <div className="office-shelf-navigation"><button type="button" onClick={overview}>Return to overview</button></div>}
    </details>
  );
}
