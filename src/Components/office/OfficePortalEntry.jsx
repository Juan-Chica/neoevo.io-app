import MonitorIcon from './MonitorIcon';
import './OfficePortalEntry.css';

export default function OfficePortalEntry({ inMonitor = false }) {
  return (
    <section className="office-portal-entry">
      {inMonitor ? <h3>Client Portal</h3> : <h2>Client Portal</h2>}
      <p>Have a NeoEvo account? Continue to the sign-in page.</p>
      <a href="/login">
        Open Client Portal <MonitorIcon name="arrow" />
      </a>
    </section>
  );
}
