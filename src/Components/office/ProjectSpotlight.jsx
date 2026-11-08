import { useId, useState } from 'react';
import paintworkSmall from '../../assets/office-portfolio/paintwork-480.webp?no-inline';
import paintworkLarge from '../../assets/office-portfolio/paintwork-960.webp?no-inline';
import nevodriveSmall from '../../assets/office-portfolio/nevodrive-480.webp?no-inline';
import nevodriveLarge from '../../assets/office-portfolio/nevodrive-960.webp?no-inline';
import './ProjectSpotlight.css';

const projects = [
  {
    id: 'paintwork',
    title: 'Next Level Paintwork',
    type: 'Client project',
    description: 'Website for a Greenville-area residential and commercial painting company.',
    services: ['Service pages', 'Before-and-after project gallery', 'Estimate request interface'],
    small: paintworkSmall,
    large: paintworkLarge,
    alt: 'Next Level Paintwork homepage with a painting project photo and estimate and gallery options',
    url: 'https://next-level-paintwork.vercel.app/',
    linkLabel: 'Visit the Paintwork website',
  },
  {
    id: 'nevodrive',
    title: 'NevoDrive',
    type: 'Dealership demonstration',
    description: 'Automotive storefront demonstrating how shoppers browse a dealer website.',
    services: ['Inventory listings', 'Vehicle detail pages', 'Financing and contact interfaces'],
    small: nevodriveSmall,
    large: nevodriveLarge,
    alt: 'NevoDrive dealership demo homepage with a showroom and featured vehicle listings',
    url: 'https://www.nevodrive.com/',
    linkLabel: 'Open the NevoDrive demo',
  },
];

export default function ProjectSpotlight({ selected, onSelect, heading = 'h3' }) {
  const Heading = heading;
  const panelId = useId();
  const titleId = useId();
  const project = projects.find(item => item.id === selected) ?? projects[0];

  return (
    <div className="office-spotlight">
      <div className="office-spotlight-selector" role="group" aria-label="Select a portfolio project">
        {projects.map(item => (
          <button key={item.id} type="button" aria-pressed={item.id === project.id}
            aria-controls={panelId} onClick={() => onSelect(item.id)}>
            {item.title}
          </button>
        ))}
      </div>
      <article className="office-spotlight-project" id={panelId} aria-labelledby={titleId}>
        <img className="office-spotlight-image" src={project.small}
          srcSet={`${project.small} 480w, ${project.large} 960w`}
          sizes="(max-width: 700px) calc(100vw - 60px), 360px"
          width={960} height={540} loading="lazy" decoding="async" alt={project.alt} />
        <div className="office-spotlight-copy">
          <span className="office-spotlight-type">{project.type}</span>
          <Heading id={titleId}>{project.title}</Heading>
          <p>{project.description}</p>
          <ul aria-label="Project features">{project.services.map(service => <li key={service}>{service}</li>)}</ul>
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            {project.linkLabel} <span aria-hidden="true">↗</span><small>Opens in a new tab</small>
          </a>
        </div>
      </article>
    </div>
  );
}

export function AccessibleOfficeWork() {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState();
  return (
    <details className="office-spotlight-disclosure" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>Work portfolio</summary>
      {open && <ProjectSpotlight selected={project} onSelect={setProject} heading="h2" />}
    </details>
  );
}
