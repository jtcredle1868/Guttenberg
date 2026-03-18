import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { TabPanel } from '../components/ui/TabPanel';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReadinessScore } from '../components/ui/ReadinessScore';
import { FileUploadZone } from '../components/ui/FileUploadZone';
import { PublishingWorkflow } from '../components/ui/PublishingWorkflow';
import { ChannelReadiness } from '../components/ui/ChannelReadiness';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Title } from '../api/types';
import { MOCK_TITLES } from '../mockData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  BookOpenIcon, DocumentTextIcon, PaintBrushIcon,
  TruckIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon,
  ExclamationCircleIcon, CloudArrowUpIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import { format, subDays } from 'date-fns';

/* ── Shared styles ── */
const card: React.CSSProperties = {
  background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
  border: '1px solid rgba(61,96,128,0.22)',
  boxShadow: '0 1px 3px rgba(5,13,26,0.35)',
  borderRadius: '1rem',
  padding: '1.5rem',
};

const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.625rem',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  color: '#e8f1f8',
  background: 'rgba(10, 22, 40, 0.60)',
  border: '1px solid rgba(61,96,128,0.40)',
  outline: 'none',
};

const fieldLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#8aafc8',
  marginBottom: '0.375rem',
  fontFamily: 'Inter, sans-serif',
};

const saveBtn: React.CSSProperties = {
  padding: '0.625rem 1.5rem',
  borderRadius: '0.75rem',
  background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 100%)',
  color: '#0a1628',
  fontWeight: 700,
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(201,162,39,0.30)',
};

/* ── Static data ── */
const TABS = [
  { id: 'overview',     label: 'Overview',     icon: <BookOpenIcon className="w-4 h-4" /> },
  { id: 'manuscript',   label: 'Manuscript',   icon: <DocumentTextIcon className="w-4 h-4" /> },
  { id: 'metadata',     label: 'Metadata',     icon: <DocumentTextIcon className="w-4 h-4" /> },
  { id: 'formatting',   label: 'Formatting',   icon: <PaintBrushIcon className="w-4 h-4" /> },
  { id: 'cover',        label: 'Cover',        icon: <PaintBrushIcon className="w-4 h-4" /> },
  { id: 'distribution', label: 'Distribution', icon: <TruckIcon className="w-4 h-4" /> },
  { id: 'finance',      label: 'Finance',      icon: <CurrencyDollarIcon className="w-4 h-4" /> },
];

const PREFLIGHT_CHECKS = [
  { item: 'File format supported',      status: 'pass'    as const, message: 'DOCX file accepted' },
  { item: 'No password protection',     status: 'pass'    as const, message: 'File is accessible' },
  { item: 'Word count (min 5,000)',     status: 'pass'    as const, message: '89,000 words detected' },
  { item: 'Chapter headings detected',  status: 'pass'    as const, message: '22 chapters found' },
  { item: 'Images embedded correctly',  status: 'pass'    as const, message: '3 images, all valid' },
  { item: 'No tracked changes',         status: 'pass'    as const, message: 'Clean document' },
  { item: 'Spelling language set',      status: 'pass'    as const, message: 'English (US)' },
  { item: 'No hidden text',             status: 'pass'    as const, message: 'No hidden content' },
  { item: 'Special characters',         status: 'warning' as const, message: '4 unusual characters — review recommended' },
  { item: 'Font embedding',             status: 'pass'    as const, message: 'Standard fonts used' },
  { item: 'Paragraph styles consistent',status: 'pass'    as const, message: 'Body, heading styles applied' },
  { item: 'Scene breaks detected',      status: 'pass'    as const, message: '47 scene breaks marked' },
  { item: 'Front matter present',       status: 'pass'    as const, message: 'Title page, copyright found' },
  { item: 'Back matter present',        status: 'warning' as const, message: 'About the Author section missing' },
  { item: 'Table of contents',          status: 'pass'    as const, message: 'TOC present and linked' },
];

const TRIM_SIZES = ['6" × 9"', '5.5" × 8.5"', '5" × 8"', '5.25" × 8"', '8" × 10"', '8.5" × 11"'];
const TEMPLATES  = ['Classic Serif', 'Modern Clean', 'Academic', 'Literary', 'Commercial Fiction', "Children's", 'Technical', 'Poetry'];

const CHANNELS = [
  { id: 'amazon-kdp',    name: 'Amazon KDP',    emoji: '📦', royaltyRate: 0.70, desc: 'Largest ebook & POD marketplace' },
  { id: 'ingram-spark',  name: 'IngramSpark',   emoji: '🌍', royaltyRate: 0.55, desc: 'Global print distribution network' },
  { id: 'apple-books',   name: 'Apple Books',   emoji: '🍎', royaltyRate: 0.70, desc: 'Premium ebook platform' },
  { id: 'kobo',          name: 'Kobo',          emoji: '📖', royaltyRate: 0.70, desc: 'International ebook retailer' },
  { id: 'barnes-noble',  name: 'Barnes & Noble', emoji: '🏛️', royaltyRate: 0.65, desc: 'US print & ebook market' },
  { id: 'author-store',  name: 'Author Store',  emoji: '🛒', royaltyRate: 0.95, desc: 'Direct sales, highest royalties' },
];

const mockEarnings = Array.from({ length: 60 }, (_, i) => ({
  date: format(subDays(new Date(), 59 - i), 'MMM d'),
  earnings: Math.round((Math.random() * 300 + 50) * 100) / 100,
}));

/* ══════════════════════════ Component ══════════════════════════ */
export const TitleDetailPage = () => {
  const { id }    = useParams<{ id: string }>();
  const toast     = useToast();
  const [title, setTitle]           = useState<Title | null>(null);
  const [activeTab, setActiveTab]   = useState('overview');
  const [metaSubTab, setMetaSubTab] = useState('basic');
  const [selectedTrimSize, setSelectedTrimSize] = useState('6" × 9"');
  const [selectedTemplate, setSelectedTemplate]  = useState('Classic Serif');
  const [formatType, setFormatType] = useState('both');
  const [channelPrices, setChannelPrices] = useState<Record<string, string>>({});
  const [designerModalOpen, setDesignerModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const found = MOCK_TITLES.find(t => t.id === id);
    setTitle(found || MOCK_TITLES[0]);
    const prices: Record<string, string> = {};
    CHANNELS.forEach(ch => { prices[ch.id] = '9.99'; });
    setChannelPrices(prices);
  }, [id]);

  if (!title) return <Layout title="Loading…"><div className="animate-pulse h-96 rounded-2xl skeleton" /></Layout>;

  const completedSteps = [
    ...(title.formats.length > 0 ? ['manuscript'] : []),
    ...(title.shortSynopsis ? ['metadata'] : []),
    ...(title.formats.some(f => f.status === 'complete') ? ['formatting'] : []),
    ...(title.coverUrl ? ['cover'] : []),
    ...(title.channels.some(c => c.status === 'live') ? ['distribution'] : []),
  ];

  const handleFormatNow = () => toast.success('Formatting job queued! Usually 2–3 minutes.');

  const handleChannelSubmit = (channelId: string) => {
    setIsSubmitting(channelId);
    setTimeout(() => {
      toast.success(`Successfully submitted to ${CHANNELS.find(c => c.id === channelId)?.name}!`);
      setIsSubmitting(null);
    }, 1500);
  };

  const getChannelStatus = (channelId: string) => title.channels.find(c => c.name === channelId)?.status || 'not-submitted';

  const StatusIcon = ({ s }: { s: 'pass' | 'warning' | 'error' }) =>
    s === 'pass'    ? <CheckCircleIcon    className="w-4 h-4 flex-shrink-0" style={{ color: '#34d399' }} /> :
    s === 'warning' ? <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: '#d4af37' }} /> :
                      <XCircleIcon        className="w-4 h-4 flex-shrink-0" style={{ color: '#f87171' }} />;

  return (
    <Layout title={title.title} breadcrumbs={[{ label: 'My Titles', href: '/titles' }, { label: title.title }]}>
      <TabPanel tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>

        {/* ══ OVERVIEW ══ */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Title header card */}
            <div style={card}>
              <div className="flex gap-5 items-start flex-wrap">
                <div
                  className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #1a2d4e 0%, #0f2040 100%)',
                    border: '1px solid rgba(212,175,55,0.20)',
                    boxShadow: '0 8px 24px rgba(5,13,26,0.40)',
                  }}
                >
                  <BookOpenIcon className="w-10 h-10" style={{ color: 'rgba(212,175,55,0.45)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3 flex-wrap">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                        {title.title}
                      </h2>
                      {title.subtitle && (
                        <p className="text-sm mt-0.5" style={{ color: 'rgba(138,175,200,0.65)' }}>{title.subtitle}</p>
                      )}
                      <p className="text-sm mt-1" style={{ color: 'rgba(90,127,160,0.70)' }}>by {title.authorName}</p>
                    </div>
                    <StatusBadge status={title.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: 'Word Count', value: (title.wordCount || 0).toLocaleString() },
                      { label: 'Pages',      value: title.pageCount || '—' },
                      { label: 'Live Channels', value: `${title.channels.filter(c => c.status === 'live').length}` },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="text-center p-3 rounded-xl"
                        style={{ background: 'rgba(10,22,40,0.50)', border: '1px solid rgba(61,96,128,0.20)' }}
                      >
                        <p className="text-xs" style={{ color: 'rgba(90,127,160,0.60)' }}>{s.label}</p>
                        <p className="font-bold mt-0.5" style={{ color: '#c5d8e8', fontFamily: '"Playfair Display", Georgia, serif' }}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ReadinessScore score={title.readinessScore} size="lg" />
                </div>
              </div>
            </div>

            {/* Workflow stepper */}
            <div style={card}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'rgba(90,127,160,0.65)' }}>
                Publishing Workflow
              </h3>
              <PublishingWorkflow
                completed={completedSteps}
                current={completedSteps.length < 5 ? TABS[completedSteps.length + 1]?.id : undefined}
              />
            </div>
          </div>
        )}

        {/* ══ MANUSCRIPT ══ */}
        {activeTab === 'manuscript' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Upload */}
              <div style={card}>
                <h3
                  className="text-base font-bold text-white mb-4 flex items-center gap-2"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  <CloudArrowUpIcon className="w-5 h-5" style={{ color: '#d4af37' }} />
                  Upload Manuscript
                </h3>
                <FileUploadZone
                  onDrop={files => { if (files[0]) toast.success(`Uploaded: ${files[0].name}`); }}
                  accept={{
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'text/plain': ['.txt'],
                    'application/pdf': ['.pdf'],
                    'application/rtf': ['.rtf'],
                  }}
                  maxSize={50 * 1024 * 1024}
                  label="Drop your manuscript here or click to browse"
                  hint="Accepts .docx, .doc, .rtf, .odt, .txt, .pdf — max 50MB"
                />
              </div>

              {/* Pre-flight */}
              <div style={card}>
                <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                  Pre-flight Validation
                </h3>
                <div
                  className="flex items-center gap-3 mb-4 p-3 rounded-xl"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.20)' }}
                >
                  <CheckCircleIcon className="w-5 h-5 flex-shrink-0" style={{ color: '#34d399' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#34d399' }}>13 Passed · 2 Warnings · 0 Errors</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(52,211,153,0.65)' }}>Manuscript is ready for formatting</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {PREFLIGHT_CHECKS.map((check, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2 rounded-lg transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(61,96,128,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="mt-0.5"><StatusIcon s={check.status} /></div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#c5d8e8' }}>{check.item}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(90,127,160,0.60)' }}>{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Version history */}
            <div style={card}>
              <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Version History
              </h3>
              <div className="space-y-4">
                {[
                  { version: 'v3.0', date: '2024-05-20', notes: 'Final copy edit applied', size: '892 KB' },
                  { version: 'v2.1', date: '2024-05-10', notes: 'Beta reader revisions', size: '887 KB' },
                  { version: 'v2.0', date: '2024-04-28', notes: 'Second draft complete', size: '901 KB' },
                  { version: 'v1.0', date: '2024-03-15', notes: 'First draft uploaded', size: '823 KB' },
                ].map(v => (
                  <div
                    key={v.version}
                    className="pl-3"
                    style={{ borderLeft: '2px solid rgba(212,175,55,0.35)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: '#d4af37' }}>{v.version}</span>
                      <span className="text-xs" style={{ color: 'rgba(90,127,160,0.55)', fontFamily: '"Source Code Pro", monospace' }}>{v.size}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(138,175,200,0.70)' }}>{v.notes}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(90,127,160,0.45)', fontFamily: '"Source Code Pro", monospace' }}>{v.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ METADATA ══ */}
        {activeTab === 'metadata' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <div style={card}>
                {/* Sub-tabs */}
                <div
                  className="flex gap-0.5 mb-6 p-1 rounded-xl w-fit overflow-x-auto"
                  style={{ background: 'rgba(10,22,40,0.50)', border: '1px solid rgba(61,96,128,0.20)' }}
                >
                  {[
                    { id: 'basic', label: 'Basic Info' },
                    { id: 'contributors', label: 'Contributors' },
                    { id: 'classification', label: 'Classification' },
                    { id: 'description', label: 'Description' },
                    { id: 'advanced', label: 'Advanced' },
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setMetaSubTab(sub.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150"
                      style={{
                        background: metaSubTab === sub.id ? 'linear-gradient(135deg, #1a2d4e 0%, #243b55 100%)' : 'transparent',
                        border: metaSubTab === sub.id ? '1px solid rgba(212,175,55,0.22)' : '1px solid transparent',
                        color: metaSubTab === sub.id ? '#d4af37' : 'rgba(138,175,200,0.65)',
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {metaSubTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label style={fieldLabel}>Title</label><input defaultValue={title.title} style={fieldInput} /></div>
                      <div><label style={fieldLabel}>Subtitle</label><input defaultValue={title.subtitle || ''} style={fieldInput} placeholder="Optional" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label style={fieldLabel}>Language</label>
                        <select defaultValue="en" style={{ ...fieldInput, cursor: 'pointer' }}>
                          <option value="en" style={{ background: '#0f2040' }}>English</option>
                          <option value="es" style={{ background: '#0f2040' }}>Spanish</option>
                          <option value="fr" style={{ background: '#0f2040' }}>French</option>
                        </select>
                      </div>
                      <div><label style={fieldLabel}>Publication Date</label><input type="date" defaultValue={title.publicationDate} style={fieldInput} /></div>
                      <div><label style={fieldLabel}>Page Count</label><input type="number" defaultValue={title.pageCount} style={fieldInput} /></div>
                    </div>
                    <button onClick={() => toast.success('Metadata saved!')} style={saveBtn}>Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'contributors' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label style={fieldLabel}>Author Name</label><input defaultValue={title.authorName} style={fieldInput} /></div>
                      <div><label style={fieldLabel}>Pen Name</label><input placeholder="Optional pen name" style={fieldInput} /></div>
                    </div>
                    <div>
                      <label style={fieldLabel}>Author Bio</label>
                      <textarea rows={4} placeholder="Brief author bio for reader-facing descriptions…"
                        style={{ ...fieldInput, resize: 'none', lineHeight: 1.6 }} />
                    </div>
                    <button onClick={() => toast.success('Contributors saved!')} style={saveBtn}>Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'classification' && (
                  <div className="space-y-4">
                    <div>
                      <label style={fieldLabel}>Genre</label>
                      <select defaultValue={title.genre} style={{ ...fieldInput, cursor: 'pointer' }}>
                        <option style={{ background: '#0f2040' }}>Business & Technology</option>
                        <option style={{ background: '#0f2040' }}>Science Fiction</option>
                        <option style={{ background: '#0f2040' }}>Fiction</option>
                        <option style={{ background: '#0f2040' }}>Non-Fiction</option>
                      </select>
                    </div>
                    <div>
                      <label style={fieldLabel}>BISAC Codes</label>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[48px]"
                        style={{ background: 'rgba(10,22,40,0.60)', border: '1px solid rgba(61,96,128,0.40)' }}>
                        {(title.bisacCodes || ['BUS000000']).map(code => (
                          <span key={code}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                            style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.22)', fontFamily: '"Source Code Pro", monospace' }}>
                            {code}
                            <button style={{ color: 'rgba(212,175,55,0.55)' }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={fieldLabel}>Keywords</label>
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl min-h-[48px]"
                        style={{ background: 'rgba(10,22,40,0.60)', border: '1px solid rgba(61,96,128,0.40)' }}>
                        {(title.keywords || ['entrepreneurship', 'tech startup', 'silicon valley']).map(kw => (
                          <span key={kw}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                            style={{ background: 'rgba(61,96,128,0.20)', color: '#8aafc8', border: '1px solid rgba(61,96,128,0.30)' }}>
                            {kw} <button style={{ color: 'rgba(90,127,160,0.55)' }}>×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => toast.success('Classification saved!')} style={saveBtn}>Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'description' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label style={fieldLabel}>Short Synopsis</label>
                        <button
                          onClick={() => toast.info('AI is generating your synopsis…')}
                          className="flex items-center gap-1 text-xs font-semibold"
                          style={{ color: '#d4af37' }}
                        >
                          <SparklesIcon className="w-3.5 h-3.5" /> Generate with AI
                        </button>
                      </div>
                      <textarea rows={3} defaultValue={title.shortSynopsis} maxLength={500}
                        style={{ ...fieldInput, resize: 'none', lineHeight: 1.6 }} />
                      <p className="text-xs text-right mt-1" style={{ color: 'rgba(90,127,160,0.45)' }}>0 / 500</p>
                    </div>
                    <div>
                      <label style={fieldLabel}>Long Description</label>
                      <textarea rows={8} placeholder="Full marketing description for retailer product pages…" maxLength={4000}
                        style={{ ...fieldInput, resize: 'none', lineHeight: 1.6 }} />
                      <p className="text-xs text-right mt-1" style={{ color: 'rgba(90,127,160,0.45)' }}>0 / 4000</p>
                    </div>
                    <button onClick={() => toast.success('Description saved!')} style={saveBtn}>Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'advanced' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label style={fieldLabel}>Series Name</label><input defaultValue={title.seriesName || ''} placeholder="Optional" style={fieldInput} /></div>
                      <div><label style={fieldLabel}>Series Number</label><input type="number" defaultValue={title.seriesNumber || ''} placeholder="e.g. 1" style={fieldInput} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label style={fieldLabel}>Publisher / Imprint</label><input defaultValue={title.publisherName || ''} placeholder="Your publisher name" style={fieldInput} /></div>
                      <div><label style={fieldLabel}>Copyright Year</label><input type="number" defaultValue={title.copyrightYear || new Date().getFullYear()} style={fieldInput} /></div>
                    </div>
                    <button onClick={() => toast.success('Advanced settings saved!')} style={saveBtn}>Save Changes</button>
                  </div>
                )}
              </div>
            </div>

            {/* Channel readiness sidebar */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'rgba(90,127,160,0.60)' }}>
                Channel Readiness
              </h3>
              {[
                { channel: 'amazon-kdp', displayName: 'Amazon KDP', requirements: [
                  { key: 'title',  label: 'Title',       met: !!title.title },
                  { key: 'author', label: 'Author name',  met: !!title.authorName },
                  { key: 'desc',   label: 'Description',  met: !!(title.shortSynopsis || title.longDescription) },
                  { key: 'bisac',  label: 'BISAC codes',  met: !!(title.bisacCodes?.length) },
                  { key: 'cover',  label: 'Cover image',  met: !!title.coverUrl, optional: true },
                ]},
                { channel: 'ingram-spark', displayName: 'IngramSpark', requirements: [
                  { key: 'title',   label: 'Title',           met: !!title.title },
                  { key: 'author',  label: 'Author',          met: !!title.authorName },
                  { key: 'pub-date',label: 'Publication date',met: !!title.publicationDate },
                  { key: 'cover',   label: 'Cover (hi-res)',  met: !!title.coverUrl },
                  { key: 'isbn',    label: 'ISBN',            met: false, optional: true },
                ]},
                { channel: 'apple-books', displayName: 'Apple Books', requirements: [
                  { key: 'title',  label: 'Title',       met: !!title.title },
                  { key: 'author', label: 'Author',      met: !!title.authorName },
                  { key: 'desc',   label: 'Description', met: !!title.shortSynopsis },
                  { key: 'cover',  label: 'Cover',       met: !!title.coverUrl },
                ]},
              ].map(ch => <ChannelReadiness key={ch.channel} {...ch} />)}
            </div>
          </div>
        )}

        {/* ══ FORMATTING ══ */}
        {activeTab === 'formatting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div style={card}>
                {/* Format type */}
                <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Format Type</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {['print', 'ebook', 'both'].map(ft => (
                    <button
                      key={ft}
                      onClick={() => setFormatType(ft)}
                      className="py-3 rounded-xl text-sm font-medium transition-all duration-150 capitalize"
                      style={{
                        background: formatType === ft ? 'rgba(212,175,55,0.12)' : 'rgba(10,22,40,0.50)',
                        border: formatType === ft ? '2px solid rgba(212,175,55,0.45)' : '2px solid rgba(61,96,128,0.30)',
                        color: formatType === ft ? '#d4af37' : 'rgba(138,175,200,0.65)',
                      }}
                    >
                      {ft === 'print' ? '📚 Print' : ft === 'ebook' ? '📱 E-book' : '📚📱 Both'}
                    </button>
                  ))}
                </div>

                {/* Trim size */}
                <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Trim Size</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {TRIM_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedTrimSize(size)}
                      className="py-2.5 px-3 rounded-xl text-sm transition-all duration-150"
                      style={{
                        background: selectedTrimSize === size ? 'rgba(212,175,55,0.10)' : 'transparent',
                        border: selectedTrimSize === size ? '2px solid rgba(212,175,55,0.40)' : '2px solid rgba(61,96,128,0.22)',
                        color: selectedTrimSize === size ? '#d4af37' : 'rgba(138,175,200,0.65)',
                        fontFamily: '"Source Code Pro", monospace',
                        fontSize: '0.8rem',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Templates */}
                <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Interior Template</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {TEMPLATES.map(tmpl => (
                    <button
                      key={tmpl}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className="p-3 rounded-xl text-xs font-medium transition-all duration-150 text-center"
                      style={{
                        background: selectedTemplate === tmpl ? 'rgba(212,175,55,0.10)' : 'rgba(10,22,40,0.50)',
                        border: selectedTemplate === tmpl ? '2px solid rgba(212,175,55,0.40)' : '2px solid rgba(61,96,128,0.22)',
                        color: selectedTemplate === tmpl ? '#d4af37' : 'rgba(138,175,200,0.65)',
                      }}
                    >
                      <div
                        className="w-full h-10 rounded mb-2 flex items-center justify-center text-lg"
                        style={{
                          background: 'rgba(26,45,78,0.60)',
                          border: '1px solid rgba(61,96,128,0.20)',
                          color: selectedTemplate === tmpl ? '#d4af37' : 'rgba(90,127,160,0.50)',
                        }}
                      >
                        {tmpl === 'Classic Serif' ? 'A' : tmpl === 'Modern Clean' ? 'Aa' : tmpl === 'Academic' ? '§' : '¶'}
                      </div>
                      {tmpl}
                    </button>
                  ))}
                </div>

                <button onClick={handleFormatNow} className="w-full py-3 rounded-xl font-bold text-sm" style={saveBtn}>
                  Format Now →
                </button>
              </div>
            </div>

            {/* Format jobs */}
            <div style={card}>
              <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Format Jobs</h3>
              <div className="space-y-3">
                {[
                  { id: 'j1', type: 'Print + E-book', template: 'Classic Serif', date: '2024-05-20' },
                  { id: 'j2', type: 'E-book',         template: 'Modern Clean',  date: '2024-05-10' },
                  { id: 'j3', type: 'Print',           template: 'Academic',     date: '2024-04-28' },
                ].map(job => (
                  <div
                    key={job.id}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(10,22,40,0.40)', border: '1px solid rgba(61,96,128,0.20)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold" style={{ color: '#c5d8e8' }}>{job.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }}>
                        ✓ Complete
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(90,127,160,0.60)' }}>{job.template} · {job.date}</p>
                    <div className="flex gap-3 mt-2">
                      <button className="text-xs font-semibold" style={{ color: '#d4af37' }}>Download PDF</button>
                      <button className="text-xs font-semibold" style={{ color: '#d4af37' }}>Download EPUB</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ COVER ══ */}
        {activeTab === 'cover' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div style={card}>
                <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Cover Image</h3>
                <FileUploadZone
                  onDrop={files => { if (files[0]) toast.success(`Cover uploaded: ${files[0].name}`); }}
                  accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/tiff': ['.tiff', '.tif'] }}
                  maxSize={30 * 1024 * 1024}
                  label="Drop your cover image here"
                  hint="Minimum 1600×2400px · JPEG, PNG, TIFF · Max 30MB"
                />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setDesignerModalOpen(true)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #8b5a00 0%, #c9a227 100%)',
                      color: '#fdf8ee',
                      border: 'none',
                      boxShadow: '0 2px 12px rgba(201,162,39,0.30)',
                    }}
                  >
                    ✨ Open Cover Designer
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input type="checkbox" id="barcode" className="rounded" />
                  <label htmlFor="barcode" className="text-sm" style={{ color: 'rgba(138,175,200,0.70)' }}>
                    Inject barcode & pricing on cover (print only)
                  </label>
                </div>
              </div>

              <div style={card}>
                <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Cover Validation</h3>
                <div className="space-y-2">
                  {[
                    { item: 'Resolution (min 1600×2400)', status: 'pass'    as const, msg: '2560×3840px ✓' },
                    { item: 'File size',                  status: 'pass'    as const, msg: '4.2 MB (within limit)' },
                    { item: 'Color profile',              status: 'warning' as const, msg: 'RGB detected — CMYK recommended for print' },
                    { item: 'Bleed margins',              status: 'pass'    as const, msg: '0.125" bleed present' },
                    { item: 'Text safe zones',            status: 'pass'    as const, msg: 'All text within safe margins' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <StatusIcon s={c.status} />
                      <span className="font-medium" style={{ color: '#c5d8e8' }}>{c.item}</span>
                      <span className="ml-auto text-xs" style={{ color: 'rgba(90,127,160,0.60)' }}>{c.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="text-base font-bold text-white mb-4 self-start" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Preview</h3>
              <div
                className="w-40 h-56 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: 'linear-gradient(135deg, #1a2d4e 0%, #0f2040 100%)',
                  border: '1px solid rgba(212,175,55,0.20)',
                  boxShadow: '0 12px 32px rgba(5,13,26,0.50)',
                }}
              >
                <BookOpenIcon className="w-12 h-12" style={{ color: 'rgba(212,175,55,0.35)' }} />
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(90,127,160,0.55)' }}>
                Cover preview will appear here after upload
              </p>
            </div>
          </div>
        )}

        {/* ══ DISTRIBUTION ══ */}
        {activeTab === 'distribution' && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl text-sm"
              style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.20)', color: '#d4af37' }}
            >
              💡 Set your list price for each channel. Royalties are calculated automatically.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {CHANNELS.map(ch => {
                const status  = getChannelStatus(ch.id);
                const price   = parseFloat(channelPrices[ch.id] || '9.99');
                const royalty = (price * ch.royaltyRate).toFixed(2);
                return (
                  <div key={ch.id} style={card}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#c5d8e8' }}>{ch.emoji} {ch.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(90,127,160,0.60)' }}>{ch.desc}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={
                          status === 'live'
                            ? { background: 'rgba(52,211,153,0.10)', color: '#34d399', border: '1px solid rgba(52,211,153,0.22)' }
                            : status === 'pending'
                            ? { background: 'rgba(212,175,55,0.10)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.22)' }
                            : { background: 'rgba(26,45,78,0.60)', color: 'rgba(90,127,160,0.60)', border: '1px solid rgba(61,96,128,0.22)' }
                        }
                      >
                        {status === 'live' ? '● Live' : status === 'pending' ? '● Pending' : '○ Not Listed'}
                      </span>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: 'rgba(90,127,160,0.65)', letterSpacing: '0.06em' }}>
                        List Price (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#d4af37' }}>$</span>
                        <input
                          type="number" step="0.01"
                          value={channelPrices[ch.id] || '9.99'}
                          onChange={e => setChannelPrices(p => ({ ...p, [ch.id]: e.target.value }))}
                          style={{ ...fieldInput, paddingLeft: '1.75rem', width: '100%' }}
                        />
                      </div>
                    </div>
                    <div
                      className="text-xs p-2.5 rounded-lg mb-4"
                      style={{ background: 'rgba(10,22,40,0.50)', border: '1px solid rgba(61,96,128,0.18)' }}
                    >
                      <div className="flex justify-between" style={{ color: 'rgba(138,175,200,0.65)' }}>
                        <span>Royalty rate:</span>
                        <span className="font-bold" style={{ color: '#8aafc8', fontFamily: '"Source Code Pro", monospace' }}>
                          {(ch.royaltyRate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between mt-1" style={{ color: 'rgba(138,175,200,0.65)' }}>
                        <span>Your royalty:</span>
                        <span className="font-bold" style={{ color: '#34d399', fontFamily: '"Source Code Pro", monospace' }}>
                          ${royalty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleChannelSubmit(ch.id)}
                      disabled={isSubmitting === ch.id}
                      className="w-full py-2.5 text-sm font-bold rounded-xl transition-all duration-150 disabled:opacity-60"
                      style={
                        status === 'live'
                          ? { background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }
                          : saveBtn
                      }
                    >
                      {isSubmitting === ch.id ? 'Submitting…' : status === 'live' ? 'Withdraw' : 'Submit for Distribution'}
                    </button>
                    {ch.id === 'amazon-kdp' && (
                      <p className="text-xs text-center mt-2" style={{ color: 'rgba(212,175,55,0.60)' }}>
                        ⚠️ KDP Select requires 90-day exclusivity
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ FINANCE ══ */}
        {activeTab === 'finance' && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'This Month',       value: '$2,847', trend: '+14%' },
                { label: 'All-Time Revenue', value: '$17,430', trend: '' },
                { label: 'Total Royalties',  value: '$11,490', trend: '' },
              ].map(s => (
                <div key={s.label} style={card}>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(90,127,160,0.65)', letterSpacing: '0.06em' }}>
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e8f1f8' }}>
                    {s.value}
                  </p>
                  {s.trend && <p className="text-xs font-semibold mt-1" style={{ color: '#34d399' }}>{s.trend} vs last month</p>}
                </div>
              ))}
            </div>
            <div style={card}>
              <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Earnings (Last 60 Days)
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockEarnings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,96,128,0.15)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif' }}
                    interval={9} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(90,127,160,0.55)', fontFamily: 'Inter, sans-serif' }}
                    tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    formatter={(v: number | undefined) => [`$${(v || 0).toFixed(2)}`, 'Earnings']}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      background: '#1a2d4e',
                      border: '1px solid rgba(212,175,55,0.22)',
                      boxShadow: '0 8px 32px rgba(5,13,26,0.55)',
                    }}
                  />
                  <Line type="monotone" dataKey="earnings" stroke="#d4af37" strokeWidth={2} dot={false}
                    activeDot={{ r: 4, fill: '#d4af37', stroke: '#0f2040', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </TabPanel>

      {/* Cover Designer Modal */}
      <Modal isOpen={designerModalOpen} onClose={() => setDesignerModalOpen(false)} title="Cover Designer">
        <div className="text-center py-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #8b5a00 0%, #c9a227 100%)', boxShadow: '0 4px 16px rgba(201,162,39,0.35)' }}
          >
            <PaintBrushIcon className="w-8 h-8" style={{ color: '#0a1628' }} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Integrated Cover Designer
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(138,175,200,0.65)' }}>
            Our AI-powered cover designer with 500+ professionally designed templates is launching Q3 2024.
            Choose from genre-specific layouts, customize typography, and generate unique artwork.
          </p>
          <button
            onClick={() => { setDesignerModalOpen(false); toast.info("You'll be notified when Cover Designer launches!"); }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={saveBtn}
          >
            Notify Me at Launch
          </button>
        </div>
      </Modal>
    </Layout>
  );
};
