import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface EditorialBridgeProps {
  projectCount: number;
  onOpenProjects: () => void;
}

export const EditorialBridge: React.FC<EditorialBridgeProps> = ({ projectCount, onOpenProjects }) => (
  <section className="tm-bridge" aria-labelledby="tm-bridge-title">
    <div className="tm-bridge-inner">
      <div className="tm-bridge-running"><span>INTERLUDE / II</span></div>
      <div className="tm-bridge-layout">
        <div className="tm-bridge-issue" aria-hidden="true">II<span>.</span></div>
        <div className="tm-bridge-statement">
          <span className="tm-bridge-kicker">SELECTED WORK</span>
          <h2 id="tm-bridge-title">Some ideas<br />need more <em>room.</em></h2>
          <div className="tm-bridge-urdu" lang="ur" dir="rtl">خیال سے تخلیق تک</div>
        </div>
        <div className="tm-bridge-notes">
          <div className="tm-bridge-notes-top"><span>A SMALL NOTE</span></div>
          <p>Some ideas grow beyond the page, into identities made to be held and lived with.</p>
          <button type="button" onClick={onOpenProjects}>
            VIEW PROJECTS <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span className="tm-bridge-small">{String(projectCount).padStart(2, '0')} CASE STUDIES</span>
        </div>
      </div>
      <div className="tm-bridge-footer">
        <span>TUMANEEN / VOL. I</span>
        <span>02 / THE WORK ↓</span>
      </div>
    </div>
  </section>
);
