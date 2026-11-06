import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface EditorialBridgeProps {
  projectCount: number;
  onOpenProjects: () => void;
}

export const EditorialBridge: React.FC<EditorialBridgeProps> = ({ projectCount, onOpenProjects }) => (
  <section className="tm-bridge" aria-labelledby="tm-bridge-title">
    <div className="tm-bridge-inner">
      <div className="tm-bridge-running"><span>BETWEEN THE PAGES</span><span>INTERLUDE 01 / 02</span></div>
      <div className="tm-bridge-layout">
        <div className="tm-bridge-issue" aria-hidden="true">II<span>.</span></div>
        <div className="tm-bridge-statement">
          <span className="tm-bridge-kicker">FROM PRINT STUDY TO BRAND WORLD</span>
          <h2 id="tm-bridge-title">Some ideas<br />need more <em>room.</em></h2>
          <div className="tm-bridge-urdu" lang="ur" dir="rtl">خیال سے تخلیق تک</div>
        </div>
        <div className="tm-bridge-notes">
          <div className="tm-bridge-notes-top"><span>EDITOR'S LETTER</span><span>— FG.</span></div>
          <p>Not every thought belongs on a single page. Some grow into identities you can hold, use, unfold, and live with.</p>
          <p>Here are a few of those longer stories: work that moves from a mood or a sketch into a complete visual world.</p>
          <button type="button" onClick={onOpenProjects}>
            EXPLORE THE COMPLETE INDEX <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <span className="tm-bridge-small">{String(projectCount).padStart(2, '0')} FEATURED CASE STUDIES / SELECTED WORK</span>
        </div>
      </div>
      <div className="tm-bridge-footer">
        <span>TUMANEEN — A VISUAL NOTEBOOK</span>
        <span>THE STORIES CONTINUE ↓</span>
      </div>
    </div>
  </section>
);
