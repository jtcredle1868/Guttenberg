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
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BookOpenIcon, DocumentTextIcon, PaintBrushIcon,
  TruckIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon,
  CloudArrowUpIcon, SparklesIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { format, subDays } from 'date-fns';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BookOpenIcon className="w-4 h-4" /> },
  { id: 'manuscript', label: 'Manuscript', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { id: 'metadata', label: 'Metadata', icon: <DocumentTextIcon className="w-4 h-4" /> },
  { id: 'formatting', label: 'Formatting', icon: <PaintBrushIcon className="w-4 h-4" /> },
  { id: 'cover', label: 'Cover', icon: <PaintBrushIcon className="w-4 h-4" /> },
  { id: 'distribution', label: 'Distribution', icon: <TruckIcon className="w-4 h-4" /> },
  { id: 'finance', label: 'Finance', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
];

const PREFLIGHT_CHECKS = [
  { item: 'File format supported', status: 'pass' as const, message: 'DOCX file accepted' },
  { item: 'No password protection', status: 'pass' as const, message: 'File is accessible' },
  { item: 'Word count (min 5,000)', status: 'pass' as const, message: '89,000 words detected' },
  { item: 'Chapter headings detected', status: 'pass' as const, message: '22 chapters found' },
  { item: 'Images embedded correctly', status: 'pass' as const, message: '3 images, all valid' },
  { item: 'No tracked changes', status: 'pass' as const, message: 'Clean document' },
  { item: 'Spelling language set', status: 'pass' as const, message: 'English (US)' },
  { item: 'No hidden text', status: 'pass' as const, message: 'No hidden content' },
  { item: 'Special characters', status: 'warning' as const, message: '4 unusual characters found — review recommended' },
  { item: 'Font embedding', status: 'pass' as const, message: 'Standard fonts used' },
  { item: 'Paragraph styles consistent', status: 'pass' as const, message: 'Body, heading styles applied' },
  { item: 'Scene breaks detected', status: 'pass' as const, message: '47 scene breaks marked' },
  { item: 'Front matter present', status: 'pass' as const, message: 'Title page, copyright found' },
  { item: 'Back matter present', status: 'warning' as const, message: 'About the Author section missing' },
  { item: 'Table of contents', status: 'pass' as const, message: 'TOC present and linked' },
];

const TRIM_SIZES = ['6" × 9"', '5.5" × 8.5"', '5" × 8"', '5.25" × 8"', '8" × 10"', '8.5" × 11"'];
const TEMPLATES = ['Classic Serif', 'Modern Clean', 'Academic', 'Literary', 'Commercial Fiction', 'Children\'s', 'Technical', 'Poetry'];

const CHANNELS = [
  { id: 'amazon-kdp', name: 'Amazon KDP', emoji: '📦', royaltyRate: 0.70, desc: 'Largest ebook & POD marketplace' },
  { id: 'ingram-spark', name: 'IngramSpark', emoji: '🌍', royaltyRate: 0.55, desc: 'Global print distribution network' },
  { id: 'apple-books', name: 'Apple Books', emoji: '🍎', royaltyRate: 0.70, desc: 'Premium ebook platform' },
  { id: 'kobo', name: 'Kobo', emoji: '📖', royaltyRate: 0.70, desc: 'International ebook retailer' },
  { id: 'barnes-noble', name: 'Barnes & Noble', emoji: '🏛️', royaltyRate: 0.65, desc: 'US print & ebook market' },
  { id: 'author-store', name: 'Author Store', emoji: '🛒', royaltyRate: 0.95, desc: 'Direct sales, highest royalties' },
];

const mockEarnings = Array.from({ length: 60 }, (_, i) => ({
  date: format(subDays(new Date(), 59 - i), 'MMM d'),
  earnings: Math.round((Math.random() * 300 + 50) * 100) / 100,
}));

export const TitleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [title, setTitle] = useState<Title | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [metaSubTab, setMetaSubTab] = useState('basic');
  const [selectedTrimSize, setSelectedTrimSize] = useState('6" × 9"');
  const [selectedTemplate, setSelectedTemplate] = useState('Classic Serif');
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

  if (!title) return <Layout title="Loading…"><div className="animate-pulse h-96 bg-gray-100 rounded-2xl" /></Layout>;

  const completedSteps = [
    ...(title.formats.length > 0 ? ['manuscript'] : []),
    ...(title.shortSynopsis ? ['metadata'] : []),
    ...(title.formats.some(f => f.status === 'complete') ? ['formatting'] : []),
    ...(title.coverUrl ? ['cover'] : []),
    ...(title.channels.some(c => c.status === 'live') ? ['distribution'] : []),
  ];

  const handleFormatNow = () => {
    toast.success('Formatting job queued! This usually takes 2–3 minutes.');
  };

  const handleChannelSubmit = (channelId: string) => {
    setIsSubmitting(channelId);
    setTimeout(() => {
      toast.success(`Successfully submitted to ${CHANNELS.find(c => c.id === channelId)?.name}!`);
      setIsSubmitting(null);
    }, 1500);
  };

  const getChannelStatus = (channelId: string) => {
    const ch = title.channels.find(c => c.name === channelId);
    return ch?.status || 'not-submitted';
  };

  return (
    <Layout title={title.title} breadcrumbs={[{ label: 'My Titles', href: '/titles' }, { label: title.title }]}>
      <TabPanel tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex gap-6 items-start">
                <div className="w-28 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg">
                  <BookOpenIcon className="w-10 h-10 text-white opacity-70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold text-gray-900">{title.title}</h2>
                      {title.subtitle && <p className="text-gray-500 text-sm">{title.subtitle}</p>}
                      <p className="text-sm text-gray-400 mt-1">by {title.authorName}</p>
                    </div>
                    <StatusBadge status={title.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Word Count</p>
                      <p className="font-bold text-gray-900">{(title.wordCount || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Pages</p>
                      <p className="font-bold text-gray-900">{title.pageCount || '—'}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">Channels</p>
                      <p className="font-bold text-gray-900">{title.channels.filter(c => c.status === 'live').length} live</p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ReadinessScore score={title.readinessScore} size="lg" />
                </div>
              </div>
            </div>

            {/* Workflow stepper */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Publishing Workflow</h3>
              <PublishingWorkflow completed={completedSteps} current={completedSteps.length < 5 ? TABS[completedSteps.length + 1]?.id : undefined} />
            </div>
          </div>
        )}

        {/* ── MANUSCRIPT ── */}
        {activeTab === 'manuscript' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CloudArrowUpIcon className="w-5 h-5 text-primary-500" /> Upload Manuscript
                </h3>
                <FileUploadZone
                  onDrop={files => { if (files[0]) toast.success(`Uploaded: ${files[0].name}`); }}
                  accept={{ 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'application/pdf': ['.pdf'], 'application/rtf': ['.rtf'] }}
                  maxSize={50 * 1024 * 1024}
                  label="Drop your manuscript here or click to browse"
                  hint="Accepts .docx, .doc, .rtf, .odt, .txt, .pdf — max 50MB"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Pre-flight Validation</h3>
                <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">13 Passed · 2 Warnings · 0 Errors</p>
                    <p className="text-xs text-green-600">Manuscript is ready for formatting</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {PREFLIGHT_CHECKS.map((check, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {check.status === 'pass' ? <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        : check.status === 'warning' ? <ExclamationCircleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        : <XCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{check.item}</p>
                        <p className="text-xs text-gray-500">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Version history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Version History</h3>
              <div className="space-y-4">
                {[
                  { version: 'v3.0', date: '2024-05-20', notes: 'Final copy edit applied', size: '892 KB' },
                  { version: 'v2.1', date: '2024-05-10', notes: 'Beta reader revisions', size: '887 KB' },
                  { version: 'v2.0', date: '2024-04-28', notes: 'Second draft complete', size: '901 KB' },
                  { version: 'v1.0', date: '2024-03-15', notes: 'First draft uploaded', size: '823 KB' },
                ].map(v => (
                  <div key={v.version} className="border-l-2 border-primary-200 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary-600">{v.version}</span>
                      <span className="text-xs text-gray-400">{v.size}</span>
                    </div>
                    <p className="text-xs text-gray-600">{v.notes}</p>
                    <p className="text-xs text-gray-400">{v.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── METADATA ── */}
        {activeTab === 'metadata' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Sub-tabs */}
                <div className="flex gap-1 mb-6 overflow-x-auto">
                  {['basic', 'contributors', 'classification', 'description', 'advanced'].map(sub => (
                    <button key={sub} onClick={() => setMetaSubTab(sub)} className={clsx('px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap', metaSubTab === sub ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')}>
                      {sub === 'basic' ? 'Basic Info' : sub === 'contributors' ? 'Contributors' : sub === 'classification' ? 'Classification' : sub === 'description' ? 'Description' : 'Advanced'}
                    </button>
                  ))}
                </div>

                {metaSubTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                        <input defaultValue={title.title} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                        <input defaultValue={title.subtitle || ''} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" placeholder="Optional" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                        <select defaultValue="en" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Publication Date</label>
                        <input type="date" defaultValue={title.publicationDate} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Count</label>
                        <input type="number" defaultValue={title.pageCount} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                      </div>
                    </div>
                    <button onClick={() => toast.success('Metadata saved!')} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'contributors' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Author Name</label><input defaultValue={title.authorName} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Pen Name</label><input placeholder="Optional pen name" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Author Bio</label><textarea rows={4} placeholder="Write a brief author bio for reader-facing descriptions..." className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" /></div>
                    <button onClick={() => toast.success('Contributors saved!')} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'classification' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                      <select defaultValue={title.genre} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                        <option>Business & Technology</option><option>Science Fiction</option><option>Fiction</option><option>Non-Fiction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">BISAC Codes</label>
                      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl min-h-[48px]">
                        {(title.bisacCodes || ['BUS000000']).map(code => (
                          <span key={code} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 text-xs rounded-lg font-mono">{code} <button className="text-primary-400 hover:text-primary-600">×</button></span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Keywords</label>
                      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-xl min-h-[48px]">
                        {(title.keywords || ['entrepreneurship', 'tech startup', 'silicon valley']).map(kw => (
                          <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">{kw} <button className="text-gray-400">×</button></span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => toast.success('Classification saved!')} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'description' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">Short Synopsis</label>
                        <button onClick={() => toast.info('AI is generating your synopsis…')} className="flex items-center gap-1 text-xs text-accent-600 font-medium hover:text-accent-700">
                          <SparklesIcon className="w-3.5 h-3.5" /> Generate with AI
                        </button>
                      </div>
                      <textarea rows={3} defaultValue={title.shortSynopsis} maxLength={500} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                      <p className="text-xs text-gray-400 text-right mt-1">0 / 500</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Long Description</label>
                      <textarea rows={8} placeholder="Full marketing description for retailer product pages..." maxLength={4000} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                      <p className="text-xs text-gray-400 text-right mt-1">0 / 4000</p>
                    </div>
                    <button onClick={() => toast.success('Description saved!')} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">Save Changes</button>
                  </div>
                )}

                {metaSubTab === 'advanced' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Series Name</label><input defaultValue={title.seriesName || ''} placeholder="Optional" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Series Number</label><input type="number" defaultValue={title.seriesNumber || ''} placeholder="e.g. 1" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Publisher / Imprint</label><input defaultValue={title.publisherName || ''} placeholder="Your publisher name" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Copyright Year</label><input type="number" defaultValue={title.copyrightYear || new Date().getFullYear()} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" /></div>
                    </div>
                    <button onClick={() => toast.success('Advanced settings saved!')} className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">Save Changes</button>
                  </div>
                )}
              </div>
            </div>

            {/* Channel readiness sidebar */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 px-1">Channel Readiness</h3>
              {[
                { channel: 'amazon-kdp', displayName: 'Amazon KDP', requirements: [
                  { key: 'title', label: 'Title', met: !!title.title },
                  { key: 'author', label: 'Author name', met: !!title.authorName },
                  { key: 'desc', label: 'Description', met: !!(title.shortSynopsis || title.longDescription) },
                  { key: 'bisac', label: 'BISAC codes', met: !!(title.bisacCodes?.length) },
                  { key: 'cover', label: 'Cover image', met: !!title.coverUrl, optional: true },
                ]},
                { channel: 'ingram-spark', displayName: 'IngramSpark', requirements: [
                  { key: 'title', label: 'Title', met: !!title.title },
                  { key: 'author', label: 'Author', met: !!title.authorName },
                  { key: 'pub-date', label: 'Publication date', met: !!title.publicationDate },
                  { key: 'cover', label: 'Cover (hi-res)', met: !!title.coverUrl },
                  { key: 'isbn', label: 'ISBN', met: false, optional: true },
                ]},
                { channel: 'apple-books', displayName: 'Apple Books', requirements: [
                  { key: 'title', label: 'Title', met: !!title.title },
                  { key: 'author', label: 'Author', met: !!title.authorName },
                  { key: 'desc', label: 'Description', met: !!(title.shortSynopsis) },
                  { key: 'cover', label: 'Cover', met: !!title.coverUrl },
                ]},
              ].map(ch => <ChannelReadiness key={ch.channel} {...ch} />)}
            </div>
          </div>
        )}

        {/* ── FORMATTING ── */}
        {activeTab === 'formatting' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Format Type</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {['print', 'ebook', 'both'].map(ft => (
                    <button key={ft} onClick={() => setFormatType(ft)} className={clsx('py-3 rounded-xl text-sm font-medium border-2 transition-colors capitalize', formatType === ft ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {ft === 'print' ? '📚 Print' : ft === 'ebook' ? '📱 E-book' : '📚📱 Both'}
                    </button>
                  ))}
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-3">Trim Size</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {TRIM_SIZES.map(size => (
                    <button key={size} onClick={() => setSelectedTrimSize(size)} className={clsx('py-2.5 px-3 rounded-xl text-sm border-2 transition-colors', selectedTrimSize === size ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      {size}
                    </button>
                  ))}
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-3">Interior Template</h3>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {TEMPLATES.map(tmpl => (
                    <button key={tmpl} onClick={() => setSelectedTemplate(tmpl)} className={clsx('p-3 rounded-xl border-2 text-xs font-medium transition-colors text-center', selectedTemplate === tmpl ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                      <div className="w-full h-12 bg-gradient-to-b from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-lg">
                        {tmpl === 'Classic Serif' ? 'A' : tmpl === 'Modern Clean' ? 'Aa' : tmpl === 'Academic' ? '§' : '¶'}
                      </div>
                      {tmpl}
                    </button>
                  ))}
                </div>

                <button onClick={handleFormatNow} className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm">
                  Format Now →
                </button>
              </div>
            </div>

            {/* Format history */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Format Jobs</h3>
              <div className="space-y-3">
                {[
                  { id: 'j1', type: 'Print + E-book', template: 'Classic Serif', status: 'complete', date: '2024-05-20' },
                  { id: 'j2', type: 'E-book', template: 'Modern Clean', status: 'complete', date: '2024-05-10' },
                  { id: 'j3', type: 'Print', template: 'Academic', status: 'complete', date: '2024-04-28' },
                ].map(job => (
                  <div key={job.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{job.type}</span>
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">✓ Complete</span>
                    </div>
                    <p className="text-xs text-gray-500">{job.template} · {job.date}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs text-primary-600 hover:text-primary-700">Download PDF</button>
                      <button className="text-xs text-primary-600 hover:text-primary-700">Download EPUB</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── COVER ── */}
        {activeTab === 'cover' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Cover Image</h3>
                <FileUploadZone
                  onDrop={files => { if (files[0]) toast.success(`Cover uploaded: ${files[0].name}`); }}
                  accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/tiff': ['.tiff', '.tif'] }}
                  maxSize={30 * 1024 * 1024}
                  label="Drop your cover image here"
                  hint="Minimum 1600×2400px · JPEG, PNG, TIFF · Max 30MB"
                />
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setDesignerModalOpen(true)} className="flex-1 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white font-medium rounded-xl hover:from-accent-700 hover:to-accent-800 transition-all">
                    ✨ Open Cover Designer
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input type="checkbox" id="barcode" className="rounded" />
                  <label htmlFor="barcode" className="text-sm text-gray-700">Inject barcode & pricing on cover (print only)</label>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Cover Validation</h3>
                <div className="space-y-2">
                  {[
                    { item: 'Resolution (min 1600×2400)', status: 'pass', msg: '2560×3840px ✓' },
                    { item: 'File size', status: 'pass', msg: '4.2 MB (within limit)' },
                    { item: 'Color profile', status: 'warning', msg: 'RGB detected — CMYK recommended for print' },
                    { item: 'Bleed margins', status: 'pass', msg: '0.125" bleed present' },
                    { item: 'Text safe zones', status: 'pass', msg: 'All text within safe margins' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      {c.status === 'pass' ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />}
                      <span className="font-medium text-gray-700">{c.item}</span>
                      <span className="text-gray-500 text-xs ml-auto">{c.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
              <h3 className="text-base font-semibold text-gray-900 mb-4 self-start">Preview</h3>
              <div className="w-40 h-56 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-xl mb-3">
                <BookOpenIcon className="w-12 h-12 text-white opacity-60" />
              </div>
              <p className="text-xs text-gray-500 text-center">Cover preview will appear here after upload</p>
            </div>
          </div>
        )}

        {/* ── DISTRIBUTION ── */}
        {activeTab === 'distribution' && (
          <div className="space-y-4">
            {/* Royalty price hint */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              💡 Set your list price for each channel. Your royalties are calculated automatically based on each platform's rate.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {CHANNELS.map(ch => {
                const status = getChannelStatus(ch.id);
                const price = parseFloat(channelPrices[ch.id] || '9.99');
                const royalty = (price * ch.royaltyRate).toFixed(2);
                return (
                  <div key={ch.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{ch.emoji} {ch.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{ch.desc}</p>
                      </div>
                      <span className={clsx('text-xs px-2 py-1 rounded-full font-medium',
                        status === 'live' ? 'bg-green-100 text-green-700' :
                        status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-500')}>
                        {status === 'live' ? '🟢 Live' : status === 'pending' ? '🟡 Pending' : '○ Not Listed'}
                      </span>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">List Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number" step="0.01" value={channelPrices[ch.id] || '9.99'}
                          onChange={e => setChannelPrices(p => ({ ...p, [ch.id]: e.target.value }))}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-4 p-2.5 bg-gray-50 rounded-lg">
                      <div className="flex justify-between"><span>Royalty rate:</span><span className="font-medium">{(ch.royaltyRate * 100).toFixed(0)}%</span></div>
                      <div className="flex justify-between mt-1"><span>Your royalty:</span><span className="font-semibold text-green-600">${royalty}</span></div>
                    </div>
                    <button
                      onClick={() => handleChannelSubmit(ch.id)}
                      disabled={isSubmitting === ch.id}
                      className={clsx('w-full py-2 text-sm font-medium rounded-xl transition-colors',
                        status === 'live'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      )}
                    >
                      {isSubmitting === ch.id ? 'Submitting…' : status === 'live' ? 'Withdraw' : 'Submit for Distribution'}
                    </button>
                    {ch.id === 'amazon-kdp' && (
                      <p className="text-xs text-amber-600 mt-2 text-center">⚠️ KDP Select requires 90-day exclusivity</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FINANCE ── */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'This Month', value: '$2,847', trend: '+14%' },
                { label: 'All-Time Revenue', value: '$17,430', trend: '' },
                { label: 'Total Royalties', value: '$11,490', trend: '' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                  {s.trend && <p className="text-xs text-green-600 font-medium mt-1">{s.trend} vs last month</p>}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Earnings (Last 60 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockEarnings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={9} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v: number | undefined) => [`$${(v || 0).toFixed(2)}`, 'Earnings']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </TabPanel>

      {/* Cover Designer Modal */}
      <Modal isOpen={designerModalOpen} onClose={() => setDesignerModalOpen(false)} title="Cover Designer">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mx-auto mb-4">
            <PaintBrushIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrated Cover Designer</h3>
          <p className="text-sm text-gray-500 mb-6">Our AI-powered cover designer with 500+ professionally designed templates is launching Q3 2024. Choose from genre-specific layouts, customize typography, and generate unique artwork.</p>
          <button onClick={() => { setDesignerModalOpen(false); toast.info('You\'ll be notified when Cover Designer launches!'); }} className="px-6 py-2.5 bg-accent-600 text-white font-medium rounded-xl hover:bg-accent-700">
            Notify Me at Launch
          </button>
        </div>
      </Modal>
    </Layout>
  );
};
