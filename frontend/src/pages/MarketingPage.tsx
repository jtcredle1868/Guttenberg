import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MOCK_TITLES } from '../mockData';
import { TitleListItem } from '../api/types';
import { useToast } from '../components/ui/Toast';
import {
  SparklesIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  UserGroupIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolidIcon,
} from '@heroicons/react/24/solid';

// ---------------------------------------------------------------------------
// Mock ARC campaigns
// ---------------------------------------------------------------------------

interface ArcCampaign {
  id: string;
  name: string;
  titleId: string;
  expiresAt: string;
  codesTotal: number;
  codesUsed: number;
  reviewsReceived: number;
  status: 'active' | 'expired';
}

const MOCK_ARC_CAMPAIGNS: ArcCampaign[] = [
  {
    id: '1',
    name: 'Launch Team ARC',
    titleId: MOCK_TITLES[0]?.id ?? '',
    expiresAt: '2026-04-15',
    codesTotal: 50,
    codesUsed: 37,
    reviewsReceived: 24,
    status: 'active',
  },
  {
    id: '2',
    name: 'Blogger Outreach',
    titleId: MOCK_TITLES[1]?.id ?? '',
    expiresAt: '2026-03-30',
    codesTotal: 25,
    codesUsed: 25,
    reviewsReceived: 18,
    status: 'expired',
  },
];

// ---------------------------------------------------------------------------
// Mock landing pages
// ---------------------------------------------------------------------------

interface LandingPageItem {
  titleId: string;
  title: string;
  slug: string;
  theme: string;
  published: boolean;
}

const MOCK_LANDING_PAGES: LandingPageItem[] = MOCK_TITLES.map((t) => ({
  titleId: t.id,
  title: t.title,
  slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  theme: 'Default',
  published: t.status === 'live',
}));

const THEME_OPTIONS = ['Default', 'Minimal', 'Bold', 'Elegant', 'Dark'];

// ---------------------------------------------------------------------------
// MarketingPage
// ---------------------------------------------------------------------------

export const MarketingPage = () => {
  const toast = useToast();

  // Synopsis generator state
  const [selectedTitleId, setSelectedTitleId] = useState(MOCK_TITLES[0]?.id ?? '');
  const [synopsisStyle, setSynopsisStyle] = useState<'retail' | 'press'>('retail');
  const [synopsis, setSynopsis] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Landing pages state
  const [landingPages, setLandingPages] = useState<LandingPageItem[]>(MOCK_LANDING_PAGES);

  const selectedTitle: TitleListItem | undefined = MOCK_TITLES.find(
    (t) => t.id === selectedTitleId,
  );

  // ARC summary stats
  const totalCampaigns = MOCK_ARC_CAMPAIGNS.filter((c) => c.status === 'active').length;
  const totalReviewers = MOCK_ARC_CAMPAIGNS.reduce((a, c) => a + c.codesUsed, 0);
  const totalReviews = MOCK_ARC_CAMPAIGNS.reduce((a, c) => a + c.reviewsReceived, 0);

  // ---- Handlers ----

  const handleGenerateSynopsis = async () => {
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1800));
      const titleName = selectedTitle?.title ?? 'your book';
      const authorName = selectedTitle?.primary_author ?? 'the author';

      if (synopsisStyle === 'retail') {
        setSynopsis(
          `${titleName} by ${authorName} is a breathtaking journey through imagination and emotion. From the very first page, readers are drawn into a richly layered world where every chapter reveals new depths. A must-read for anyone who believes in the transformative power of storytelling.`,
        );
      } else {
        setSynopsis(
          `FOR IMMEDIATE RELEASE -- ${authorName} returns with ${titleName}, a bold and ambitious new work that challenges genre conventions. Drawing on years of craft and a keen understanding of the human condition, this title promises to be one of the defining releases of the season. Review copies available upon request.`,
        );
      }
      toast.success('Synopsis generated with AI!');
    } catch {
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleLandingPagePublish = (titleId: string) => {
    setLandingPages((pages) =>
      pages.map((p) =>
        p.titleId === titleId ? { ...p, published: !p.published } : p,
      ),
    );
    toast.success('Landing page status updated');
  };

  const updateLandingPageTheme = (titleId: string, theme: string) => {
    setLandingPages((pages) =>
      pages.map((p) => (p.titleId === titleId ? { ...p, theme } : p)),
    );
  };

  return (
    <Layout title="Marketing & Discovery" breadcrumbs={[{ label: 'Marketing & Discovery' }]}>
      {/* ================================================================== */}
      {/* Section 1: AI Synopsis Generator                                   */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <SparklesSolidIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">AI Synopsis Generator</h3>
            <p className="text-xs text-gray-500">Generate compelling copy for retail listings or press</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
            <SparklesIcon className="w-3 h-3" />
            AI-assisted
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <select
                value={selectedTitleId}
                onChange={(e) => {
                  setSelectedTitleId(e.target.value);
                  setSynopsis('');
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {MOCK_TITLES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Style</label>
              <div className="flex gap-2">
                {(['retail', 'press'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setSynopsisStyle(style);
                      setSynopsis('');
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      synopsisStyle === style
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {style === 'retail' ? 'Retail Copy' : 'Press Release'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateSynopsis}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-60"
            >
              <SparklesIcon className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Synopsis'}
            </button>
          </div>

          {/* Results area */}
          <div>
            {synopsis ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {synopsis}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(synopsis)}
                  className="mt-3 flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy to Clipboard
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[180px] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Generated synopsis will appear here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Section 2: Landing Pages                                           */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <GlobeAltIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Landing Pages</h3>
            <p className="text-xs text-gray-500">
              Manage book landing pages with custom themes
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Slug
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Theme
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Published
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {landingPages.map((lp) => (
                <tr key={lp.titleId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                    {lp.title}
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      /{lp.slug}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={lp.theme}
                      onChange={(e) =>
                        updateLandingPageTheme(lp.titleId, e.target.value)
                      }
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {THEME_OPTIONS.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleLandingPagePublish(lp.titleId)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        lp.published ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full mt-1 transition-transform shadow-sm ${
                          lp.published ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        handleCopy(`https://guttenberg.io/book/${lp.slug}`)
                      }
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Section 3: ARC Campaigns                                           */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <MegaphoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">ARC Campaigns</h3>
              <p className="text-xs text-gray-500">
                Advance reader copy campaigns and review tracking
              </p>
            </div>
          </div>
          <button
            onClick={() => toast.info('ARC campaign creation coming soon!')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
          >
            + New Campaign
          </button>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChartBarIcon className="w-4 h-4 text-indigo-500" />
              <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
            </div>
            <p className="text-xs text-gray-500">Active Campaigns</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <UserGroupIcon className="w-4 h-4 text-emerald-500" />
              <p className="text-2xl font-bold text-gray-900">{totalReviewers}</p>
            </div>
            <p className="text-xs text-gray-500">Total Reviewers</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <StarIcon className="w-4 h-4 text-amber-500" />
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
            </div>
            <p className="text-xs text-gray-500">Reviews Received</p>
          </div>
        </div>

        {/* Campaign cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ARC_CAMPAIGNS.map((campaign) => (
            <div
              key={campaign.id}
              className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">{campaign.name}</p>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-lg font-bold text-gray-900">{campaign.codesUsed}</p>
                  <p className="text-[11px] text-gray-500">Claimed</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-lg font-bold text-gray-900">
                    {campaign.reviewsReceived}
                  </p>
                  <p className="text-[11px] text-gray-500">Reviews</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(
                      (campaign.reviewsReceived / campaign.codesUsed) * 100,
                    )}
                    %
                  </p>
                  <p className="text-[11px] text-gray-500">Conversion</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    {campaign.codesUsed} / {campaign.codesTotal} codes used
                  </span>
                  <span>Expires: {campaign.expiresAt}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${(campaign.codesUsed / campaign.codesTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Section 4: Press Kit & Social                                      */}
      {/* ================================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Press Kit & Social Assets</h3>
            <p className="text-xs text-gray-500">
              Generate press kits and social media graphics per title
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {MOCK_TITLES.filter((t) => t.status === 'live' || t.status === 'ready').map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                <p className="text-xs text-gray-500">{t.primary_author}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => {
                    toast.info('Generating press kit...');
                    setTimeout(() => toast.success('Press kit ready!'), 2000);
                  }}
                  className="flex items-center gap-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                  Press Kit
                </button>
                <button
                  onClick={() => {
                    toast.info('Generating social assets...');
                    setTimeout(
                      () => toast.success('Social media assets ready!'),
                      1500,
                    );
                  }}
                  className="flex items-center gap-1.5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  <PhotoIcon className="w-3.5 h-3.5" />
                  Social Assets
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
