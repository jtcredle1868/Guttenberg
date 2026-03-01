import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { MOCK_TITLES } from '../mockData';
import { SparklesIcon, DocumentTextIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const mockArcCampaigns = [
  { id: '1', name: 'Launch Team ARC', expiresAt: '2024-07-15', codesTotal: 50, codesUsed: 37, reviewsReceived: 24, status: 'active' as const },
  { id: '2', name: 'Blogger Outreach', expiresAt: '2024-06-30', codesTotal: 25, codesUsed: 25, reviewsReceived: 18, status: 'expired' as const },
];

export const MarketingPage = () => {
  const [selectedTitleId, setSelectedTitleId] = useState(MOCK_TITLES[0].id);
  const [arcModalOpen, setArcModalOpen] = useState(false);
  const [synopsis, setSynopsis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [arcForm, setArcForm] = useState({ name: '', expiresAt: '', codesTotal: '25' });
  const toast = useToast();

  const selectedTitle = MOCK_TITLES.find(t => t.id === selectedTitleId) || MOCK_TITLES[0];

  const handleGenerateSynopsis = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSynopsis(`In the high-stakes world of Silicon Valley, ${selectedTitle.authorName}'s "${selectedTitle.title}" follows a visionary entrepreneur navigating the treacherous landscape of tech innovation. A gripping narrative of ambition, betrayal, and ultimate triumph, this essential read for anyone daring to build the future.`);
      setIsGenerating(false);
      toast.success('Synopsis generated with AI!');
    }, 1800);
  };

  const handleCreateArc = () => {
    toast.success(`ARC campaign "${arcForm.name}" created! ${arcForm.codesTotal} review copies ready.`);
    setArcModalOpen(false);
  };

  const handlePressKit = () => {
    toast.info('Generating press kit… Download will start shortly.');
    setTimeout(() => toast.success('Press kit ready! Check your downloads.'), 2000);
  };

  return (
    <Layout title="Marketing Hub" breadcrumbs={[{ label: 'Marketing Hub' }]}>
      {/* Title selector */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700">Title:</label>
        <select
          value={selectedTitleId}
          onChange={e => setSelectedTitleId(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none min-w-48"
        >
          {MOCK_TITLES.filter(t => t.status !== 'draft').map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* AI Synopsis Generator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-accent-500" />
            <h3 className="text-base font-semibold text-gray-900">AI Synopsis Generator</h3>
          </div>
          {synopsis ? (
            <div className="p-4 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border border-accent-200 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">{synopsis}</p>
            </div>
          ) : (
            <div className="h-28 bg-gray-50 rounded-xl flex items-center justify-center mb-4 border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">Generated synopsis will appear here</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSynopsis}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-accent-600 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-accent-700 hover:to-primary-700 transition-all disabled:opacity-60"
            >
              <SparklesIcon className="w-4 h-4" />
              {isGenerating ? 'Generating…' : 'Generate with AI'}
            </button>
            {synopsis && (
              <button onClick={() => { navigator.clipboard.writeText(synopsis); toast.success('Copied!'); }} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50">
                Copy
              </button>
            )}
          </div>
        </div>

        {/* Press Kit */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-5 h-5 text-primary-500" />
            <h3 className="text-base font-semibold text-gray-900">Press Kit Generator</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Generate a professional press kit including book summary, author bio, high-res cover, book specs, and media contact info.</p>
          <div className="space-y-2 mb-4">
            {['Book Summary & Blurb', 'Author Bio & Photo', 'High-Res Cover Image', 'Book Specifications', 'Media Contact Sheet', 'Review Quotes'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> {item}
              </div>
            ))}
          </div>
          <button onClick={handlePressKit} className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
            ↓ Download Press Kit (PDF)
          </button>
        </div>
      </div>

      {/* ARC Campaigns */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MegaphoneIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-gray-900">ARC Campaigns</h3>
          </div>
          <button onClick={() => setArcModalOpen(true)} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700">
            + New Campaign
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockArcCampaigns.map(campaign => (
            <div key={campaign.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">{campaign.name}</p>
                <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {campaign.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{campaign.codesUsed}</p>
                  <p className="text-xs text-gray-500">Claimed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{campaign.reviewsReceived}</p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-lg font-bold text-gray-900">{Math.round(campaign.reviewsReceived / campaign.codesUsed * 100)}%</p>
                  <p className="text-xs text-gray-500">Conversion</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{campaign.codesUsed} / {campaign.codesTotal} codes used</span>
                  <span>Expires: {campaign.expiresAt}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-primary-500 rounded-full" style={{ width: `${campaign.codesUsed / campaign.codesTotal * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Landing Page */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Book Landing Page</h3>
        <p className="text-sm text-gray-500 mb-4">Your personalized landing page for <strong>{selectedTitle.title}</strong> is ready to share.</p>
        <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 mb-4">
          https://guttenberg.io/book/{selectedTitle.id}
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.info('Opening page preview…')} className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">Preview</button>
          <button onClick={() => { navigator.clipboard.writeText(`https://guttenberg.io/book/${selectedTitle.id}`); toast.success('Link copied!'); }} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700">Copy Link</button>
        </div>
      </div>

      {/* ARC Campaign Modal */}
      <Modal isOpen={arcModalOpen} onClose={() => setArcModalOpen(false)} title="New ARC Campaign">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name</label>
            <input value={arcForm.name} onChange={e => setArcForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Launch Team ARC" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Review Copies</label>
            <input type="number" value={arcForm.codesTotal} onChange={e => setArcForm(f => ({ ...f, codesTotal: e.target.value }))} min="1" max="500" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
            <input type="date" value={arcForm.expiresAt} onChange={e => setArcForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setArcModalOpen(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleCreateArc} className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">Create Campaign</button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
