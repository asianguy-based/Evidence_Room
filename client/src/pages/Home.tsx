import { useMemo, useState } from "react";
import {
  Archive,
  ArrowDownToLine,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileImage,
  Filter,
  Info,
  Layers3,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

// Evidence Room design reminder: show the image comparison as the primary artifact.
// Warm bone paper, ink-black type, monospaced filenames, Archive Vermilion review stamps.

type MatchType = "Exact duplicate" | "Visual near-duplicate";
type ReviewPair = {
  id: number;
  candidate: string;
  retained: string;
  type: MatchType;
  subject: string;
  reason: string;
  size: string;
  candidateMeta: string;
  retainedMeta: string;
  preview: string;
};

const pairs: ReviewPair[] = [
  { id: 1, candidate: "1000015909.jpg", retained: "1000016739.jpg", type: "Exact duplicate", subject: "Cybersecurity GitHub projects", reason: "Identical SHA-256 hash. Same screenshot content and dimensions.", size: "1.8 MB", candidateMeta: "JPG · 1170 × 2532", retainedMeta: "JPG · 1170 × 2532", preview: "/manus-storage/cluster-01_e601e252.jpg" },
  { id: 2, candidate: "1000016733.jpg", retained: "1000017610.jpg", type: "Visual near-duplicate", subject: "How To Build Your Own AI Agent In 10 Minutes", reason: "Same capture with matching composition; retained copy is the higher-resolution evidence.", size: "1.2 MB", candidateMeta: "JPG · 1080 × 2340", retainedMeta: "JPG · 1170 × 2532", preview: "/manus-storage/cluster-02_8a3a1976.jpg" },
  { id: 3, candidate: "1000017607.jpg", retained: "31dc430b-4066-45f4-a44c-3917502f72f3-1_all_13897.png", type: "Visual near-duplicate", subject: "8 Steps to Set Up Your Entire Course", reason: "Same course graphic; PNG preserves the clearest retained version.", size: "2.4 MB", candidateMeta: "JPG · 1080 × 2340", retainedMeta: "PNG · 1200 × 2667", preview: "/manus-storage/cluster-03_6fefa601.jpg" },
  { id: 4, candidate: "1000022070.jpg", retained: "1000022232.jpg", type: "Visual near-duplicate", subject: "13 Free Claude Courses & Certification", reason: "Same educational list graphic with a near-identical crop.", size: "980 KB", candidateMeta: "JPG · 1080 × 2340", retainedMeta: "JPG · 1170 × 2532", preview: "/manus-storage/cluster-04_4c0214e8.jpg" },
  { id: 5, candidate: "31dc430b-4066-45f4-a44c-3917502f72f3-1_all_15660.jpg", retained: "1000022298.jpg", type: "Visual near-duplicate", subject: "9 Free University Courses", reason: "Same course roundup; retained copy has the cleaner source dimensions.", size: "1.1 MB", candidateMeta: "JPG · 1080 × 2340", retainedMeta: "JPG · 1170 × 2532", preview: "/manus-storage/cluster-05_3ff07f10.jpg" },
];

function Stamp({ children = "REVIEW ONLY" }: { children?: string }) {
  return <span className="review-stamp">{children}</span>;
}

function EvidenceFrame({ file, retained, meta, index, preview }: { file: string; retained?: boolean; meta: string; index: number; preview: string }) {
  return (
    <div className={`evidence-frame ${retained ? "retained" : "candidate"}`}>
      <div className="frame-topline"><span>{retained ? "RETAIN" : "CANDIDATE"}</span><span>{String(index).padStart(2, "0")}</span></div>
      <div className="frame-art real-preview" aria-label={`Validated image comparison for ${file}`}>
        <img src={preview} alt="Validated side-by-side image comparison" />
        <div className="preview-tag">{retained ? "CURATED / ORIGINAL" : "CAPTURE / COPY"}</div>
        <div className="art-footer">EVIDENCE ROOM · IMAGE REVIEW</div>
      </div>
      <div className="frame-label"><FileImage size={14} /><span>{file}</span></div>
      <div className="frame-meta">{meta}</div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All pairs" | MatchType>("All pairs");
  const [marked, setMarked] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visiblePairs = useMemo(() => pairs.filter((pair) => {
    const haystack = `${pair.candidate} ${pair.retained} ${pair.subject}`.toLowerCase();
    return (filter === "All pairs" || pair.type === filter) && haystack.includes(query.toLowerCase());
  }), [filter, query]);

  const toggleMark = (id: number) => {
    setMarked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const markAll = () => {
    setMarked(visiblePairs.map((pair) => pair.id));
    toast.success("All visible candidates marked for review", { description: "No files have been deleted." });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <img src="/manus-storage/evidence-room-mark_16396f01.png" alt="Evidence Room mark" className="brand-mark" />
          <div><div className="brand-name">Evidence<br /><em>Room</em></div><div className="brand-kicker">picture review desk</div></div>
        </div>
        <div className="rail-rule" />
        <nav className="rail-nav" aria-label="Primary navigation">
          <a className="rail-link active" href="#review"><Layers3 size={17} /><span>Review queue</span><b>05</b></a>
          <a className="rail-link" href="#overview"><Archive size={17} /><span>Scan overview</span></a>
          <a className="rail-link" href="#method"><ShieldCheck size={17} /><span>How this works</span></a>
        </nav>
        <div className="rail-note"><div className="tiny-label">CURRENT SCAN</div><p>Project picture inventory</p><span>121 image files · read-only</span></div>
        <div className="rail-bottom"><div className="rail-rule" /><button className="text-button" onClick={() => toast.info("The report is ready to download from your project files.")}><ArrowDownToLine size={15} /> Export report</button></div>
      </aside>

      <main className="workspace">
        <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu"><Menu size={20} /></button><div className="breadcrumb"><span>PROJECT FILES</span><ChevronRight size={14} /><strong>PICTURE DELETION REVIEW</strong></div><div className="top-actions"><span className="read-only"><ShieldCheck size={15} /> READ-ONLY MODE</span><button className="icon-button" onClick={() => toast.info("This dashboard marks files for review only; it never deletes them.")} aria-label="Help"><CircleHelp size={18} /></button></div></header>

        <section className="hero" id="overview">
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> SCAN COMPLETE · 25 AUG 2026</div><h1>Five pairs<br /><i>need your eyes.</i></h1><p>We found one exact duplicate and four visually similar pairs across your picture files. Mark what can go; keep the final call human.</p><div className="hero-actions"><button className="primary-button" onClick={markAll}><ClipboardCheck size={16} /> Mark visible candidates</button><button className="secondary-button" onClick={() => { setMarked([]); toast("Review marks cleared"); }}><RotateCcw size={16} /> Reset marks</button></div></div>
          <div className="hero-art"><img src="/manus-storage/evidence-room-contact-sheet_22be963b.jpg" alt="Archival contact sheet on a desk" /><div className="hero-art-overlay" /><div className="hero-caption"><span>FIELD NOTE 01</span><strong>Visual redundancy is a human decision.</strong></div></div>
        </section>

        <section className="stats-strip" aria-label="Scan summary"><div className="stat"><span>FILES SCANNED</span><strong>121</strong><small>picture files</small></div><div className="stat"><span>EXACT DUPLICATES</span><strong>01</strong><small>pair found</small></div><div className="stat"><span>NEAR-DUPLICATES</span><strong>04</strong><small>pairs to review</small></div><div className="stat stat-accent"><span>MARKED TO REVIEW</span><strong>{String(marked.length).padStart(2, "0")}</strong><small>of 05 candidates</small></div></section>

        <section className="queue-section" id="review">
          <div className="section-heading"><div><div className="section-index"><img src="/manus-storage/evidence-room-mark_16396f01.png" alt="" className="section-mark" /> 01 / EVIDENCE QUEUE</div><h2>Compare before you clear.</h2></div><div className="queue-count">{visiblePairs.length} {visiblePairs.length === 1 ? "pair" : "pairs"} shown</div></div>
          <div className="toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search filenames or subjects" aria-label="Search filenames or subjects" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</div><div className="filter-group"><Filter size={15} /><button className={filter === "All pairs" ? "selected" : ""} onClick={() => setFilter("All pairs")}>All pairs</button><button className={filter === "Exact duplicate" ? "selected" : ""} onClick={() => setFilter("Exact duplicate")}>Exact</button><button className={filter === "Visual near-duplicate" ? "selected" : ""} onClick={() => setFilter("Visual near-duplicate")}>Visual</button></div></div>

          <div className="pair-list">{visiblePairs.map((pair) => { const isMarked = marked.includes(pair.id); return <article className={`pair-card ${isMarked ? "marked" : ""}`} key={pair.id}><div className="pair-top"><div className="pair-title"><span className="pair-number">PAIR {String(pair.id).padStart(2, "0")}</span><h3>{pair.subject}</h3><span className={`match-badge ${pair.type === "Exact duplicate" ? "exact" : "visual"}`}>{pair.type === "Exact duplicate" ? "EXACT MATCH" : "VISUAL MATCH"}</span></div><div className="pair-actions"><button className={`mark-button ${isMarked ? "is-marked" : ""}`} onClick={() => toggleMark(pair.id)}>{isMarked ? <Check size={15} /> : <Trash2 size={15} />}{isMarked ? "Marked" : "Mark for review"}</button><button className="expand-button" onClick={() => setExpanded(expanded === pair.id ? null : pair.id)} aria-expanded={expanded === pair.id}>{expanded === pair.id ? "Close detail" : "View detail"}<ChevronRight size={15} className={expanded === pair.id ? "rotate-90" : ""} /></button></div></div><div className="evidence-line"><EvidenceFrame file={pair.candidate} meta={pair.candidateMeta} index={pair.id} preview={pair.preview} /><div className="comparison-connector"><span className="connector-label">{pair.type === "Exact duplicate" ? "100%" : "SIMILAR"}</span><div className="connector-line" /><ChevronRight size={16} /></div><EvidenceFrame file={pair.retained} retained meta={pair.retainedMeta} index={pair.id} preview={pair.preview} /></div><div className="pair-footer"><div><span className="footer-label">REASON FOR REVIEW</span><p>{pair.reason}</p></div><div className="retained-note"><Check size={14} /><span>Suggested keep: <b>{pair.retained}</b></span></div></div>{expanded === pair.id && <div className="detail-drawer"><div><span className="footer-label">CANDIDATE</span><code>{pair.candidate}</code><small>{pair.candidateMeta}</small></div><div><span className="footer-label">SUGGESTED KEEP</span><code>{pair.retained}</code><small>{pair.retainedMeta}</small></div><div><span className="footer-label">EST. SPACE</span><code>{pair.size}</code><small>candidate file size</small></div></div>}</article>; })}</div>
          {visiblePairs.length === 0 && <div className="empty-state"><Sparkles size={24} /><h3>No pairs match that search.</h3><p>Try a different filename, subject, or filter.</p></div>}
        </section>

        <section className="method-section" id="method"><div className="method-mark"><img src="/manus-storage/evidence-room-mark_16396f01.png" alt="" /></div><div><div className="section-index">02 / METHOD NOTE</div><h2>Marked is not deleted.</h2><p>This workspace is a review layer over your project files. A mark only records your intention to remove a redundant copy; the original files stay untouched until you choose to act elsewhere.</p></div><Stamp /></section>
        <footer className="footer"><span>Evidence Room / Picture review desk</span><span>121 files · 05 flagged pairs · read-only</span></footer>
      </main>
    </div>
  );
}
