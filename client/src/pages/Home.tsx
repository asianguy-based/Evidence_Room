import { useEffect, useMemo, useState } from "react";
import { Archive, BookOpen, Check, CircleHelp, FileImage, Info, Menu, RotateCcw, ScanSearch, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { browserSupportsLocalFiles, deleteNow, moveToRecyclingBin, scanLocalFolder, type LocalPair } from "@/lib/localCleanup";

const ASSET_BASE = import.meta.env.BASE_URL;

// Evidence Room design reminder: quiet archive desk, warm paper, ink-black type, Archive Vermilion actions.

type ActionMode = "recycle" | "delete";
type ReviewPair = LocalPair & { sizeLabel: string; candidateMeta: string; retainedMeta: string };
type LogEntry = { id: number; label: string; detail: string };

const toReviewPair = (pair: LocalPair): ReviewPair => ({
  ...pair,
  sizeLabel: `${Math.round(pair.candidate.size / 1024)} KB`,
  candidateMeta: `LOCAL · ${pair.candidate.path}`,
  retainedMeta: `LOCAL · ${pair.retained.path}`,
});

export default function Home() {
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null);
  const [folderName, setFolderName] = useState("");
  const [pairs, setPairs] = useState<ReviewPair[]>([]);
  const [records, setRecords] = useState<LocalPair[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [marked, setMarked] = useState<number[]>([]);
  const [progress, setProgress] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ActionMode | null>(null);
  const [infoView, setInfoView] = useState<"about" | "license" | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logId, setLogId] = useState(1);
  const isMobile = window.matchMedia?.("(max-width: 767px)").matches ?? false;

  useEffect(() => {
    const closeDesktop = () => { if (window.innerWidth > 650) setSidebarOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setSidebarOpen(false); setConfirmMode(null); } };
    window.addEventListener("resize", closeDesktop);
    window.addEventListener("keydown", closeEscape);
    return () => { window.removeEventListener("resize", closeDesktop); window.removeEventListener("keydown", closeEscape); };
  }, []);

  const addLog = (label: string, detail: string) => {
    setLog((current) => [...current, { id: logId, label, detail }]);
    setLogId((current) => current + 1);
  };

  const clearWorkspace = () => {
    setFolder(null);
    setFolderName("");
    setPairs([]);
    setRecords([]);
    setImageCount(0);
    setMarked([]);
    setProgress("");
    setConfirmMode(null);
  };

  const chooseFolder = async () => {
    if (!browserSupportsLocalFiles()) { toast.error("This browser cannot access local folders", { description: "Use the latest Chrome or Edge over HTTPS or localhost." }); return; }
    try {
      const selected = await (window as any).showDirectoryPicker({ mode: "readwrite" });
      setFolder(selected);
      setFolderName(selected.name);
      setPairs([]);
      setRecords([]);
      setImageCount(0);
      setMarked([]);
      addLog("FOLDER CHOSEN", selected.name);
      toast.success("Folder ready", { description: "Press Scan to inspect image files." });
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("The folder could not be opened", { description: error instanceof Error ? error.message : "Try again." });
    }
  };

  const scan = async () => {
    if (!folder) { toast.info("Choose a local folder first"); return; }
    try {
      setProgress("Scanning image files…");
      const result = await scanLocalFolder(folder, (count) => setProgress(`Scanning image files · ${count}`));
      setPairs(result.pairs.map(toReviewPair));
      setRecords(result.pairs);
      setImageCount(result.images.length);
      setMarked([]);
      setProgress("");
      addLog("SCAN COMPLETE", `${result.images.length} image files · ${result.pairs.length} pairs found`);
      toast.success("Scan complete", { description: `${result.pairs.length} duplicate pairs need review.` });
    } catch (error) {
      setProgress("");
      addLog("SCAN FAILED", error instanceof Error ? error.message : "The folder could not be scanned");
      toast.error("The scan could not be completed", { description: error instanceof Error ? error.message : "Try again." });
    }
  };

  const visiblePairs = useMemo(() => pairs, [pairs]);
  const toggleMark = (id: number) => setMarked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const markVisible = () => { setMarked(visiblePairs.map((pair) => pair.id)); addLog("CANDIDATES MARKED", `${visiblePairs.length} visible pair${visiblePairs.length === 1 ? "" : "s"}`); };
  const reset = () => { addLog("RESET", "Workspace returned to the starting state"); clearWorkspace(); toast("Reset complete", { description: "No scan data was saved." }); };

  const execute = async () => {
    if (!folder || !confirmMode || marked.length === 0) return;
    const selected = records.filter((pair) => marked.includes(pair.id));
    try {
      for (const pair of selected) {
        if (confirmMode === "recycle") await moveToRecyclingBin(pair.candidate, folder);
        else await deleteNow(pair.candidate);
      }
      addLog(confirmMode === "recycle" ? "MOVED TO RECYCLING BIN" : "DELETED NOW", `${selected.length} file${selected.length === 1 ? "" : "s"} processed`);
      toast.success(confirmMode === "recycle" ? "Moved to recycling bin" : "Deleted permanently", { description: "The workspace has been cleared for a new session." });
      clearWorkspace();
    } catch (error) {
      addLog("ACTION STOPPED", error instanceof Error ? error.message : "Some files could not be processed");
      toast.error("The action stopped", { description: error instanceof Error ? error.message : "Check the folder permission." });
      setConfirmMode(null);
    }
  };

  const stats = folder ? [
    { label: "FILES SCANNED", value: imageCount, note: "this session" },
    { label: "PAIRS FOUND", value: pairs.length, note: "to review" },
    { label: "MARKED", value: marked.length, note: "ready for action" },
  ] : [
    { label: "FILES SCANNED", value: "—", note: "choose a folder" },
    { label: "PAIRS FOUND", value: "—", note: "scan not started" },
    { label: "MARKED", value: "—", note: "nothing selected" },
  ];

  return <div className="app-shell session-app">
    <aside className={`sidebar ${sidebarOpen ? "is-open" : ""}`}>
      <div className="brand-lockup"><img src={`${ASSET_BASE}assets/evidence-room-mark.png`} alt="Evidence Room mark" className="brand-mark" /><div><div className="brand-name">Evidence<br /><em>Room</em></div><div className="brand-kicker">picture cleanup desk</div></div></div>
      <div className="rail-rule" />
      <div className="session-rail-heading"><span>SESSION LOG</span><small>not saved</small></div>
      <div className="session-log" aria-live="polite">{log.length === 0 ? <div className="log-empty">Actions from this session will appear here. Closing this page clears the log.</div> : log.map((entry) => <div className="log-entry" key={entry.id}><span className="log-dot" /><div><strong>{entry.label}</strong><small>{entry.detail}</small></div></div>)}</div>
      <div className="rail-bottom"><div className="rail-rule" /><div className="privacy-note"><ShieldCheck size={14} /><span>No scan data is saved.</span></div></div>
    </aside>
    {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close session log" />}
    <main className="workspace">
      <header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Close session log" : "Open session log"} aria-expanded={sidebarOpen}><Menu size={20} /></button><div className="breadcrumb"><span>EVIDENCE ROOM</span><b> / </b><strong>LOCAL CLEANUP</strong></div><div className="top-actions"><span className="version-pill">v1.0</span><span className="no-save"><ShieldCheck size={14} /> SESSION ONLY</span><button className="info-link" onClick={() => setInfoView("about")}><Info size={14} /> About</button><button className="info-link" onClick={() => setInfoView("license")}><BookOpen size={14} /> GPL</button><button className="icon-button" onClick={() => toast.info("Choose a folder, scan, mark candidates, then recycle or delete.")} aria-label="How the cleanup works"><CircleHelp size={18} /></button></div></header>
      <section className="start-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(244,240,231,.98), rgba(244,240,231,.76)), url(${ASSET_BASE}assets/evidence-room-paper.jpg)` }}><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> NOTHING LOADED · READY WHEN YOU ARE</div><h1>Clear the clutter.<br /><i>Keep the control.</i></h1><p>Everything happens locally in this browser session. Choose a folder, scan its images, mark the candidates, then move them to a recovery bin or delete them now.</p><div className="step-row"><span className={!folder ? "current" : "done"}><b>01</b> CHOOSE A LOCAL FOLDER</span><span className={folder && pairs.length === 0 ? "current" : pairs.length > 0 ? "done" : ""}><b>02</b> SCAN</span><span className={pairs.length > 0 ? "current" : ""}><b>03</b> MARK VISIBLE CANDIDATES</span><span className={marked.length > 0 ? "current" : ""}><b>04</b> RECYCLE OR DELETE</span></div><div className="hero-actions"><button className="primary-button" onClick={chooseFolder}><Archive size={16} /> {folder ? "Choose another folder" : "Choose a local folder"}</button><button className="secondary-button" onClick={scan} disabled={!folder || Boolean(progress)}><ScanSearch size={16} /> {progress || "Scan"}</button><button className="secondary-button" onClick={markVisible} disabled={!pairs.length}><Check size={16} /> Mark visible candidates</button><button className="reset-button" onClick={reset}><RotateCcw size={16} /> Reset</button></div></div><div className="privacy-card"><ShieldCheck size={22} /><span>LOCAL-FIRST</span><strong>No data is saved.</strong><p>The log, scan results, and file handles disappear when this page is closed.</p></div></section>
      <section className="stats-strip" aria-label="Current session summary">{stats.map((stat) => <div className="stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></div>)}</section>
      <section className="review-section"><div className="section-heading"><div><div className="section-index"><FileImage size={15} /> 01 / REVIEW QUEUE</div><h2>{folder ? `${pairs.length ? "Mark what can go." : "Scan to find duplicates."}` : "Start with a folder."}</h2></div><span className="folder-chip">{folderName || "NO FOLDER SELECTED"}</span></div>{pairs.length > 0 && <div className="action-panel"><div><strong>{marked.length ? `${marked.length} candidate${marked.length === 1 ? "" : "s"} marked` : "Choose candidates to act on"}</strong><span>{marked.length ? "Select Move to recycling bin or Delete now." : "Each pair stays on your device until you decide."}</span></div><div className="action-buttons"><button className="recycle-button" disabled={!marked.length} onClick={() => setConfirmMode("recycle")}><Archive size={15} /> Move to recycling bin</button><button className="delete-now-button" disabled={!marked.length} onClick={() => setConfirmMode("delete")}><Trash2 size={15} /> Delete now</button></div></div>}{pairs.length === 0 ? <div className="blank-queue"><ScanSearch size={28} /><h3>{folder ? "Ready to scan this folder" : "Nothing has been scanned"}</h3><p>{folder ? "Use Scan above to inspect image files. No files are read until you choose that action." : "Choose a local folder to begin. The page starts empty by design."}</p></div> : <div className="pair-list">{pairs.map((pair) => { const selected = marked.includes(pair.id); return <article className={`pair-card ${selected ? "marked" : ""}`} key={pair.id}><div className="pair-card-top"><div><span className="pair-number">PAIR {String(pair.id).padStart(2, "0")}</span><h3>{pair.subject}</h3><span className={`match-badge ${pair.type === "Exact duplicate" ? "exact" : "visual"}`}>{pair.type === "Exact duplicate" ? "EXACT MATCH" : "VISUAL MATCH"}</span></div><button className={`mark-button ${selected ? "selected" : ""}`} onClick={() => toggleMark(pair.id)}>{selected ? <Check size={15} /> : <Trash2 size={15} />}{selected ? "Marked" : "Mark for review"}</button></div><div className="pair-details"><div><span>CANDIDATE TO REMOVE</span><code>{pair.candidate.name}</code><small>{pair.candidateMeta}</small></div><div><span>SUGGESTED KEEP</span><code>{pair.retained.name}</code><small>{pair.retainedMeta}</small></div><div><span>EST. SPACE</span><code>{pair.sizeLabel}</code><small>{pair.reason}</small></div></div></article>; })}</div>}</section>
      <footer className="footer"><span>Evidence Room / Local cleanup · v1.0</span><span>Session-only · no data saved · <button className="footer-link" onClick={() => setInfoView("license")}>Copyright & GPL</button></span></footer>
      {marked.length > 0 && <div className="mobile-action-dock"><span><Check size={15} /> {marked.length} selected</span><div><button className="recycle-button" onClick={() => setConfirmMode("recycle")}><Archive size={14} /> Recycle</button><button className="delete-now-button" onClick={() => setConfirmMode("delete")}><Trash2 size={14} /> Delete now</button></div></div>}
      {infoView && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoView(null); }}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><div className="modal-icon">{infoView === "about" ? <Info size={22} /> : <BookOpen size={22} />}</div><div><span className="section-index">EVIDENCE ROOM · v1.0</span><h2 id="info-title">{infoView === "about" ? "A quiet tool for a cleaner library." : "Copyright and GPL"}</h2>{infoView === "about" ? <><p>Evidence Room is a local-first browser app for reviewing duplicate and visually similar image files before taking action. It keeps the human decision in the loop and does not upload, save, or synchronize your scan data.</p><p className="info-note">Choose a folder, scan it, mark candidates, then move them to a recovery bin or delete them now. Closing the page clears the current session.</p></> : <><p>Copyright © 2026 Evidence Room contributors. This software is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published with this release.</p><p className="info-note">The GPL permits commercial use and redistribution, provided the applicable license terms and source-code obligations are preserved. Evidence Room branding and attribution requests are described separately in the project notice.</p><p className="license-label">See <code>LICENSE</code> and <code>NOTICE.md</code> in the source repository.</p></>}<div className="modal-actions"><button className="secondary-button" onClick={() => setInfoView(null)}>Close</button></div></div></section></div>}
      {confirmMode && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmMode(null); }}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="modal-icon">{confirmMode === "recycle" ? <Archive size={22} /> : <Trash2 size={22} />}</div><div><span className="section-index">FINAL REVIEW STEP</span><h2 id="confirm-title">{confirmMode === "recycle" ? "Move marked files to recycling bin?" : "Delete marked files now?"}</h2><p>{confirmMode === "recycle" ? "The selected files will be copied into an Evidence Room Recycling Bin folder inside the chosen directory, then removed from their original locations." : "The selected files will be permanently removed from their original locations. This cannot be undone."}</p><div className="modal-list">{records.filter((pair) => marked.includes(pair.id)).map((pair) => <div key={pair.id}><FileImage size={13} /><code>{pair.candidate.name}</code></div>)}</div><div className="modal-actions"><button className="secondary-button" onClick={() => setConfirmMode(null)}>Keep reviewing</button><button className={confirmMode === "recycle" ? "recycle-button" : "delete-now-button"} onClick={execute}>{confirmMode === "recycle" ? "Move to recycling bin" : "Delete now"}</button></div></div></section></div>}
    </main>
  </div>;
}
