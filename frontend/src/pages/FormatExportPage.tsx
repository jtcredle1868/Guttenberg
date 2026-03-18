import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import {
  DocumentTextIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  QueueListIcon,
  PrinterIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { ExportJob, TrimSize as TrimSizeType } from '../api/types';
import { MOCK_TITLES } from '../mockData';

/* ── Static data ───────────────────────────────────────────────────────────── */
const TRIM_SIZES: TrimSizeType[] = [
  { id: 'ts-1', label: '5" × 8"',      dimensions: '5×8',      costPerPage: 0.012, setupCost: 1.50, popular: false },
  { id: 'ts-2', label: '5.5" × 8.5"',  dimensions: '5.5×8.5',  costPerPage: 0.013, setupCost: 1.50, popular: true  },
  { id: 'ts-3', label: '6" × 9"',       dimensions: '6×9',      costPerPage: 0.014, setupCost: 1.75, popular: true  },
  { id: 'ts-4', label: '7" × 10"',      dimensions: '7×10',     costPerPage: 0.017, setupCost: 2.00, popular: false },
  { id: 'ts-5', label: '8.5" × 11"',    dimensions: '8.5×11',   costPerPage: 0.020, setupCost: 2.25, popular: false },
  { id: 'ts-6', label: '4.25" × 6.87"', dimensions: '4.25×6.87',costPerPage: 0.011, setupCost: 1.25, popular: false },
  { id: 'ts-7', label: '8" × 10"',      dimensions: '8×10',     costPerPage: 0.019, setupCost: 2.00, popular: false },
];

const INTERIOR_TEMPLATES = [
  { id: 'it-1', name: 'Classic Novel',    desc: 'Traditional serif layout', preview: 'serif body, centred chapter headings' },
  { id: 'it-2', name: 'Modern Clean',     desc: 'Contemporary sans-serif',   preview: 'clean margins, bold headings' },
  { id: 'it-3', name: 'Academic Press',   desc: 'Formal academic style',     preview: 'justified text, footnotes' },
  { id: 'it-4', name: 'Business Book',    desc: 'Non-fiction professional',  preview: 'callout boxes, sidebars' },
  { id: 'it-5', name: 'Large Print',      desc: '14pt accessible edition',   preview: 'wide margins, 14pt body' },
  { id: 'it-6', name: 'Poetry Collection',desc: 'Open layout for verse',     preview: 'generous leading, ragged right' },
];

const FORMAT_TYPES = [
  { id: 'pdf-print', label: 'PDF (Print)', icon: PrinterIcon, color: '#d4af37' },
  { id: 'epub3',     label: 'ePub 3.0',   icon: BookOpenIcon, color: '#60a5fa' },
  { id: 'mobi',      label: 'MOBI/Kindle',icon: DocumentTextIcon, color: '#f97316' },
  { id: 'docx',      label: 'DOCX',       icon: DocumentTextIcon, color: '#6366f1' },
  { id: 'html5',     label: 'HTML5',      icon: DocumentTextIcon, color: '#4ade80' },
] as const;

const BODY_FONTS  = ['Garamond', 'Palatino', 'Times New Roman', 'Georgia', 'Baskerville', 'Caslon'];
const HEAD_FONTS  = ['Playfair Display', 'Trajan Pro', 'Caslon', 'Helvetica Neue', 'Futura'];
const MARGIN_OPTS = ['Standard (0.875")', 'Wide (1")', 'Narrow (0.75")', 'Custom'];
const CH_STYLES   = ['Classic', 'Modern', 'Minimal', 'Decorative'];
const PRINT_RUNS  = [100, 250, 500, 1000, 2500];

/* ── Mock export jobs ─────────────────────────────────────────────────────── */
const INITIAL_JOBS: ExportJob[] = [
  {
    id: 'ej-001', titleId: '1', format: 'epub3', status: 'complete', progress: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    fileUrl: '#', trimSize: '6×9',
  },
  {
    id: 'ej-002', titleId: '5', format: 'pdf-print', status: 'processing', progress: 62,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    trimSize: '6×9', estimatedCost: 4.87,
  },
  {
    id: 'ej-003', titleId: '2', format: 'mobi', status: 'failed', progress: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

/* ── Inline styles ─────────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(26,45,78,0.80) 0%, rgba(15,32,64,0.80) 100%)',
  border: '1px solid rgba(61,96,128,0.25)',
  borderRadius: '1rem',
  backdropFilter: 'blur(8px)',
};

/* ── Status helpers ────────────────────────────────────────────────────────── */
const StatusIcon: React.FC<{ status: ExportJob['status'] }> = ({ status }) => {
  if (status === 'complete')    return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
  if (status === 'failed')      return <ExclamationCircleIcon className="w-4 h-4 text-red-400" />;
  if (status === 'processing')  return <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gold-400 animate-spin" />;
  return <ClockIcon className="w-4 h-4 text-navy-300" />;
};

const statusLabel: Record<ExportJob['status'], string> = {
  queued: 'Queued', processing: 'Processing', complete: 'Complete', failed: 'Failed',
};
const statusColor: Record<ExportJob['status'], string> = {
  queued: 'text-navy-300', processing: 'text-gold-400', complete: 'text-emerald-400', failed: 'text-red-400',
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
export const FormatExportPage = () => {
  const [selectedTitle, setSelectedTitle] = useState(MOCK_TITLES[0]);
  const [selectedInterior, setSelectedInterior] = useState(INTERIOR_TEMPLATES[0].id);
  const [selectedTrimSize, setSelectedTrimSize] = useState<TrimSizeType>(TRIM_SIZES[2]);
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set(['pdf-print', 'epub3']));
  const [bodyFont, setBodyFont]       = useState(BODY_FONTS[0]);
  const [headFont, setHeadFont]       = useState(HEAD_FONTS[0]);
  const [fontSize, setFontSize]       = useState(11);
  const [margin, setMargin]           = useState(MARGIN_OPTS[0]);
  const [chStyle, setChStyle]         = useState(CH_STYLES[0]);
  const [printRun, setPrintRun]       = useState(500);
  const [jobs, setJobs]               = useState<ExportJob[]>(INITIAL_JOBS);
  const [isQueuing, setIsQueuing]     = useState(false);

  /* Simulate processing progress */
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(j =>
        j.status === 'processing' && j.progress < 100
          ? { ...j, progress: Math.min(j.progress + 3, 100) }
          : j.status === 'processing' && j.progress >= 100
          ? { ...j, status: 'complete', completedAt: new Date().toISOString(), fileUrl: '#' }
          : j
      ));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const estimatePrintCost = () => {
    const pageCount = selectedTitle.pageCount ?? 300;
    return (selectedTrimSize.setupCost + pageCount * selectedTrimSize.costPerPage).toFixed(2);
  };

  const handleQueueExport = () => {
    if (selectedFormats.size === 0) return;
    setIsQueuing(true);
    setTimeout(() => {
      const newJobs: ExportJob[] = Array.from(selectedFormats).map((fmt, i) => ({
        id: `ej-${Date.now()}-${i}`,
        titleId: selectedTitle.id,
        format: fmt as ExportJob['format'],
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        trimSize: selectedTrimSize.dimensions,
        templateId: selectedInterior,
      }));
      setJobs(prev => [...newJobs, ...prev]);
      setIsQueuing(false);

      /* Simulate them starting after a moment */
      setTimeout(() => {
        setJobs(prev => prev.map(j =>
          newJobs.find(nj => nj.id === j.id) ? { ...j, status: 'processing', progress: 5 } : j
        ));
      }, 1500);
    }, 600);
  };

  const handleDownload = (job: ExportJob) => {
    alert(`Downloading ${job.format.toUpperCase()} for job ${job.id}…`);
  };

  const titleName = (id: string) => MOCK_TITLES.find(t => t.id === id)?.title ?? id;

  return (
    <Layout title="Format & Export" breadcrumbs={[{ label: 'Creative Tools' }, { label: 'Format & Export' }]}>
      <div className="space-y-5">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-gold-400 font-playfair">Format &amp; Export</h1>
          <p className="text-navy-200 text-sm mt-1">Create professional print and digital editions</p>
        </div>

        {/* ── Book selector ────────────────────────────────────────────── */}
        <div style={cardStyle} className="p-4 flex flex-wrap items-center gap-4">
          <BookOpenIcon className="w-5 h-5 text-gold-400 shrink-0" />
          <label className="text-navy-200 text-sm font-medium shrink-0">Select Title:</label>
          <select
            value={selectedTitle.id}
            onChange={e => setSelectedTitle(MOCK_TITLES.find(t => t.id === e.target.value) ?? MOCK_TITLES[0])}
            className="bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-4 py-2 text-sm outline-none flex-1 max-w-sm"
          >
            {MOCK_TITLES.filter(t => t.status !== 'draft').map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-navy-300 text-xs">{selectedTitle.pageCount ?? '—'} pages</span>
            <span className="text-navy-300 text-xs capitalize px-2 py-0.5 rounded-lg bg-navy-700/60 border border-navy-600">
              {selectedTitle.status}
            </span>
          </div>
        </div>

        {/* ── Two-panel layout ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

          {/* ── Left: Format Configuration ──────────────────────────── */}
          <div className="space-y-5">

            {/* Interior templates */}
            <div style={cardStyle} className="p-5">
              <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4" /> Interior Template
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERIOR_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedInterior(t.id)}
                    className={clsx(
                      'p-3 rounded-xl text-left transition-all border',
                      selectedInterior === t.id
                        ? 'border-gold-500 bg-gold-600/10'
                        : 'border-navy-600 bg-navy-800/40 hover:border-navy-500'
                    )}
                  >
                    {/* Mini layout preview */}
                    <div className="w-full aspect-[3/4] bg-white/5 rounded-lg mb-2 p-1.5 flex flex-col gap-0.5">
                      <div className="h-1.5 rounded-full w-3/4" style={{ background: selectedInterior === t.id ? '#c9a227' : '#3d6080' }} />
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-0.5 rounded-full bg-navy-500/60" style={{ width: i % 3 === 2 ? '60%' : '100%' }} />
                      ))}
                    </div>
                    <p className={clsx('text-xs font-medium', selectedInterior === t.id ? 'text-gold-400' : 'text-navy-200')}>{t.name}</p>
                    <p className="text-navy-400 text-xs">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Trim size */}
            <div style={cardStyle} className="p-5">
              <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <PrinterIcon className="w-4 h-4" /> Trim Size
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {TRIM_SIZES.map(ts => (
                  <button
                    key={ts.id}
                    onClick={() => setSelectedTrimSize(ts)}
                    className={clsx(
                      'p-3 rounded-xl text-center transition-all border relative',
                      selectedTrimSize.id === ts.id
                        ? 'border-gold-500 bg-gold-600/10'
                        : 'border-navy-600 bg-navy-800/40 hover:border-navy-500'
                    )}
                  >
                    {ts.popular && (
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-full bg-gold-600 text-navy-900 font-bold" style={{ fontSize: '0.55rem' }}>
                        POPULAR
                      </span>
                    )}
                    <p className={clsx('text-sm font-semibold mt-1', selectedTrimSize.id === ts.id ? 'text-gold-400' : 'text-navy-200')}>{ts.label}</p>
                    <p className="text-navy-400 text-xs">${ts.costPerPage}/pg</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Format selector */}
            <div style={cardStyle} className="p-5">
              <h2 className="text-gold-400 font-semibold text-sm mb-4">Output Formats</h2>
              <div className="flex flex-wrap gap-2">
                {FORMAT_TYPES.map(ft => {
                  const Icon = ft.icon;
                  const active = selectedFormats.has(ft.id);
                  return (
                    <button
                      key={ft.id}
                      onClick={() => toggleFormat(ft.id)}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                        active
                          ? 'border-opacity-60 bg-opacity-10'
                          : 'border-navy-600 bg-navy-800/40 text-navy-300 hover:border-navy-500'
                      )}
                      style={active ? { borderColor: ft.color + '99', background: ft.color + '18', color: ft.color } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      {ft.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography settings */}
            <div style={cardStyle} className="p-5">
              <h2 className="text-gold-400 font-semibold text-sm mb-4">Typography &amp; Layout</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-navy-200 text-xs font-medium">Body Font</label>
                  <select value={bodyFont} onChange={e => setBodyFont(e.target.value)}
                    className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none">
                    {BODY_FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-navy-200 text-xs font-medium">Heading Font</label>
                  <select value={headFont} onChange={e => setHeadFont(e.target.value)}
                    className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none">
                    {HEAD_FONTS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-navy-200 text-xs font-medium">Font Size: {fontSize}pt</label>
                  <input type="range" min={10} max={14} step={0.5} value={fontSize}
                    onChange={e => setFontSize(Number(e.target.value))}
                    className="w-full accent-yellow-400" />
                  <div className="flex justify-between text-navy-400 text-xs"><span>10pt</span><span>14pt</span></div>
                </div>
                <div className="space-y-1">
                  <label className="text-navy-200 text-xs font-medium">Page Margins</label>
                  <select value={margin} onChange={e => setMargin(e.target.value)}
                    className="w-full bg-navy-800/60 border border-navy-500 text-white focus:border-gold-500 rounded-xl px-3 py-2 text-sm outline-none">
                    {MARGIN_OPTS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-navy-200 text-xs font-medium">Chapter Heading Style</label>
                  <div className="flex gap-2">
                    {CH_STYLES.map(s => (
                      <button key={s} onClick={() => setChStyle(s)}
                        className={clsx(
                          'flex-1 py-1.5 rounded-xl text-xs font-medium transition-all border',
                          chStyle === s
                            ? 'border-gold-500 bg-gold-600/10 text-gold-400'
                            : 'border-navy-600 bg-navy-800/40 text-navy-300 hover:border-navy-500'
                        )}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Print run (for print formats) */}
            {selectedFormats.has('pdf-print') && (
              <div style={cardStyle} className="p-5">
                <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4" /> Print Run Size (Offset)
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PRINT_RUNS.map(pr => (
                    <button key={pr} onClick={() => setPrintRun(pr)}
                      className={clsx(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
                        printRun === pr
                          ? 'border-gold-500 bg-gold-600/10 text-gold-400'
                          : 'border-navy-600 bg-navy-800/40 text-navy-300 hover:border-navy-500'
                      )}
                    >
                      {pr.toLocaleString()} copies
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Export Queue ──────────────────────────────────── */}
          <div className="space-y-4">

            {/* Queue Export button */}
            <button
              onClick={handleQueueExport}
              disabled={isQueuing || selectedFormats.size === 0}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-navy-900 font-bold hover:from-gold-500 hover:to-gold-400 rounded-xl px-6 py-3 text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isQueuing ? (
                <><div className="w-4 h-4 rounded-full border-2 border-navy-900/30 border-t-navy-900 animate-spin" /> Queuing…</>
              ) : (
                <><QueueListIcon className="w-4 h-4" /> Queue Export ({selectedFormats.size} format{selectedFormats.size !== 1 ? 's' : ''})</>
              )}
            </button>

            {/* Export jobs list */}
            <div style={cardStyle} className="p-4">
              <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <QueueListIcon className="w-4 h-4" /> Export Queue
              </h2>
              {jobs.length === 0 ? (
                <p className="text-navy-400 text-sm text-center py-6">No export jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map(job => {
                    const fmt = FORMAT_TYPES.find(f => f.id === job.format);
                    const Icon = fmt?.icon ?? DocumentTextIcon;
                    return (
                      <div key={job.id} className="bg-navy-800/40 border border-navy-600/60 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: fmt?.color ?? '#8aafc8' }} />
                            <div>
                              <p className="text-navy-100 text-xs font-medium">{fmt?.label ?? job.format}</p>
                              <p className="text-navy-400 text-xs">{titleName(job.titleId)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon status={job.status} />
                            <span className={clsx('text-xs font-medium', statusColor[job.status])}>{statusLabel[job.status]}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        {(job.status === 'processing' || job.status === 'queued') && (
                          <div className="w-full bg-navy-700/60 rounded-full h-1.5 mb-2">
                            <div
                              className="bg-gradient-to-r from-gold-600 to-gold-400 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-navy-400 text-xs">
                            {new Date(job.createdAt).toLocaleTimeString()}
                            {job.trimSize ? ` · ${job.trimSize}` : ''}
                          </span>
                          {job.status === 'complete' && job.fileUrl && (
                            <button
                              onClick={() => handleDownload(job)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-600/20 border border-gold-500/40 text-gold-400 text-xs hover:bg-gold-600/30 transition-all"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Print cost estimator */}
            {selectedFormats.has('pdf-print') && (
              <div style={cardStyle} className="p-4">
                <h2 className="text-gold-400 font-semibold text-sm mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4" /> Print Cost Estimate
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Trim Size</span>
                    <span className="text-navy-100 font-medium">{selectedTrimSize.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Page Count</span>
                    <span className="text-navy-100 font-medium">{selectedTitle.pageCount ?? '—'} pp</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Setup Cost</span>
                    <span className="text-navy-100 font-medium">${selectedTrimSize.setupCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-300">Per-Page Rate</span>
                    <span className="text-navy-100 font-medium">${selectedTrimSize.costPerPage.toFixed(3)}</span>
                  </div>
                  <div className="border-t border-navy-600 my-2" />
                  <div className="flex justify-between">
                    <span className="text-navy-200 font-semibold text-sm">Estimated print cost</span>
                    <span className="text-gold-400 font-bold text-lg">${estimatePrintCost()}</span>
                  </div>
                  <p className="text-navy-400 text-xs">per copy at {selectedTrimSize.label} · {printRun.toLocaleString()} run</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
