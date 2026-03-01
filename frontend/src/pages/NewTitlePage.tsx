import React, { useState, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { createTitle } from '../api/titles';
import {
  CheckIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENRES = [
  'Fiction',
  'Literary Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Historical Fiction',
  'Non-Fiction',
  'Business & Technology',
  'Self-Help',
  'Biography & Memoir',
  'History',
  'Science & Nature',
  'Cooking & Food',
  'Travel',
  "Children's",
  'Young Adult',
  'Poetry',
  'Graphic Novel',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ko', label: 'Korean' },
];

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Title, author, and genre', icon: BookOpenIcon },
  { id: 2, title: 'Description', description: 'Synopsis and summary', icon: PencilSquareIcon },
  { id: 3, title: 'Classification', description: 'Categories and keywords', icon: TagIcon },
  { id: 4, title: 'Review', description: 'Confirm and create', icon: ClipboardDocumentCheckIcon },
];

const SUGGESTED_BISAC = [
  'FIC000000 - Fiction / General',
  'FIC028000 - Fiction / Science Fiction / General',
  'FIC009000 - Fiction / Fantasy / General',
  'FIC031000 - Fiction / Thrillers / General',
  'FIC027000 - Fiction / Romance / General',
  'BUS000000 - Business & Economics / General',
  'BUS071000 - Business & Economics / Entrepreneurship',
  'SEL000000 - Self-Help / General',
  'BIO000000 - Biography & Autobiography / General',
  'HIS000000 - History / General',
];

const SUGGESTED_KEYWORDS_BY_GENRE: Record<string, string[]> = {
  'Science Fiction': ['space opera', 'dystopia', 'cyberpunk', 'time travel', 'aliens', 'AI', 'post-apocalyptic'],
  Fantasy: ['epic fantasy', 'urban fantasy', 'magic', 'dragons', 'quest', 'dark fantasy', 'mythology'],
  Thriller: ['suspense', 'crime', 'espionage', 'conspiracy', 'action', 'psychological thriller'],
  Romance: ['contemporary romance', 'historical romance', 'enemies to lovers', 'slow burn', 'second chance'],
  Mystery: ['detective', 'whodunit', 'cozy mystery', 'noir', 'cold case', 'police procedural'],
  'Business & Technology': ['leadership', 'startup', 'innovation', 'technology', 'management', 'entrepreneurship'],
};

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormData {
  title: string;
  subtitle: string;
  primaryAuthor: string;
  genre: string;
  language: string;
  synopsisShort: string;
  synopsisLong: string;
  bisacCodes: string[];
  keywords: string[];
  audienceAgeMin: string;
  audienceAgeMax: string;
}

const initialForm: FormData = {
  title: '',
  subtitle: '',
  primaryAuthor: '',
  genre: '',
  language: 'en',
  synopsisShort: '',
  synopsisLong: '',
  bisacCodes: [],
  keywords: [],
  audienceAgeMin: '',
  audienceAgeMax: '',
};

// ---------------------------------------------------------------------------
// NewTitlePage
// ---------------------------------------------------------------------------

export const NewTitlePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [bisacInput, setBisacInput] = useState('');

  // Form updater
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setErrors((e) => {
        const next = { ...e };
        delete next[key];
        return next;
      });
    },
    [],
  );

  // Step validation
  const validateStep = (s: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.primaryAuthor.trim()) errs.primaryAuthor = 'Author name is required';
    }
    if (s === 2) {
      if (form.synopsisShort.length > 400)
        errs.synopsisShort = `Short synopsis must be 400 characters or less (currently ${form.synopsisShort.length})`;
      if (form.synopsisLong.length > 4000)
        errs.synopsisLong = `Long synopsis must be 4000 characters or less (currently ${form.synopsisLong.length})`;
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  // AI synopsis generation (simulated)
  const handleAiGenerate = async (field: 'synopsisShort' | 'synopsisLong') => {
    setAiGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      if (field === 'synopsisShort') {
        updateField(
          'synopsisShort',
          `${form.title} is a captivating ${form.genre || 'literary'} work by ${form.primaryAuthor || 'the author'} that explores the boundaries of human experience. A must-read for lovers of thought-provoking narratives.`,
        );
      } else {
        updateField(
          'synopsisLong',
          `In "${form.title}", ${form.primaryAuthor || 'the author'} delivers a masterfully crafted ${form.genre || 'literary'} experience that captivates from the very first page. This remarkable work weaves together compelling characters, intricate plot threads, and profound thematic depth.\n\nSet against a richly imagined backdrop, the story follows protagonists who must navigate extraordinary circumstances that challenge their deepest beliefs. As tensions rise and alliances shift, readers are drawn into a world where nothing is quite as it seems.\n\nWith prose that is both elegant and accessible, this book stands as a testament to the power of storytelling. It is a work that will resonate with readers long after the final page is turned, sparking conversations and inspiring reflection on what it means to be human in an ever-changing world.`,
        );
      }
      toast.success('Synopsis generated by AI');
    } catch {
      toast.error('AI generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  // AI keyword suggestion
  const handleSuggestKeywords = async () => {
    setAiGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const genreKeywords =
        SUGGESTED_KEYWORDS_BY_GENRE[form.genre] ||
        ['bestseller', 'page-turner', 'compelling', 'debut novel', 'literary fiction'];
      const newKeywords = genreKeywords.filter((k) => !form.keywords.includes(k));
      updateField('keywords', [...form.keywords, ...newKeywords.slice(0, 5)]);
      toast.success(`Added ${Math.min(newKeywords.length, 5)} suggested keywords`);
    } catch {
      toast.error('Keyword suggestion failed');
    } finally {
      setAiGenerating(false);
    }
  };

  // Add keyword
  const addKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (kw && !form.keywords.includes(kw)) {
      updateField('keywords', [...form.keywords, kw]);
      setKeywordInput('');
    }
  };

  // Add BISAC code
  const addBisac = (code: string) => {
    if (!form.bisacCodes.includes(code)) {
      updateField('bisacCodes', [...form.bisacCodes, code]);
    }
    setBisacInput('');
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createTitle({
        title: form.title,
        subtitle: form.subtitle,
        primary_author: form.primaryAuthor,
        genre: form.genre,
        language: form.language,
        synopsis_short: form.synopsisShort,
        synopsis_long: form.synopsisLong,
        bisac_codes: form.bisacCodes,
        keywords: form.keywords,
        audience_age_min: form.audienceAgeMin ? parseInt(form.audienceAgeMin) : null,
        audience_age_max: form.audienceAgeMax ? parseInt(form.audienceAgeMax) : null,
      });
      toast.success('Title created successfully!');
      navigate('/titles');
    } catch {
      // Simulated success for demo
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Title created successfully!');
      navigate('/titles');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const inputClasses = (field: string) =>
    [
      'w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50/50 focus:bg-white',
      errors[field] ? 'border-red-400' : 'border-gray-200',
    ].join(' ');

  const languageLabel = LANGUAGES.find((l) => l.code === form.language)?.label ?? form.language;

  return (
    <Layout
      title="New Title"
      breadcrumbs={[
        { label: 'My Titles', href: '/titles' },
        { label: 'New Title' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        {/* ---------------------------------------------------------------- */}
        {/* Step indicator                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div
                    className={[
                      'flex-1 h-0.5 mx-2 rounded-full transition-colors',
                      step > i ? 'bg-indigo-600' : 'bg-gray-200',
                    ].join(' ')}
                  />
                )}
                <button
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  className="flex items-center gap-2.5 group"
                >
                  <div
                    className={[
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                      step === s.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : step > s.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-400',
                    ].join(' ')}
                  >
                    {step > s.id ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      s.id
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p
                      className={[
                        'text-xs font-semibold',
                        step === s.id
                          ? 'text-indigo-700'
                          : step > s.id
                          ? 'text-gray-700'
                          : 'text-gray-400',
                      ].join(' ')}
                    >
                      {s.title}
                    </p>
                    <p className="text-[10px] text-gray-400">{s.description}</p>
                  </div>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Step content                                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* ------ Step 1: Basic Info ------ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Start with the essential details of your title.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={inputClasses('title')}
                  placeholder="Enter your book title"
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subtitle
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  className={inputClasses('subtitle')}
                  placeholder="Optional subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.primaryAuthor}
                  onChange={(e) => updateField('primaryAuthor', e.target.value)}
                  className={inputClasses('primaryAuthor')}
                  placeholder="Author or pen name"
                />
                {errors.primaryAuthor && (
                  <p className="text-xs text-red-500 mt-1">{errors.primaryAuthor}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Genre
                  </label>
                  <select
                    value={form.genre}
                    onChange={(e) => updateField('genre', e.target.value)}
                    className={`${inputClasses('genre')} bg-white`}
                  >
                    <option value="">Select genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Language
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    className={`${inputClasses('language')} bg-white`}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ------ Step 2: Description ------ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Write a compelling synopsis to attract readers. Use AI to generate a starting point.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Short Synopsis{' '}
                    <span className="text-gray-400 font-normal">(max 400 chars)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAiGenerate('synopsisShort')}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {aiGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea
                  value={form.synopsisShort}
                  onChange={(e) => updateField('synopsisShort', e.target.value)}
                  rows={3}
                  maxLength={400}
                  className={inputClasses('synopsisShort')}
                  placeholder="A brief tagline or hook for your book (used for catalog listings)..."
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.synopsisShort && (
                    <p className="text-xs text-red-500">{errors.synopsisShort}</p>
                  )}
                  <p className="text-xs text-gray-400 ml-auto">
                    {form.synopsisShort.length}/400
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Long Synopsis{' '}
                    <span className="text-gray-400 font-normal">(max 4000 chars)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAiGenerate('synopsisLong')}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {aiGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <textarea
                  value={form.synopsisLong}
                  onChange={(e) => updateField('synopsisLong', e.target.value)}
                  rows={8}
                  maxLength={4000}
                  className={inputClasses('synopsisLong')}
                  placeholder="Full book description for product pages. Include plot summary, themes, and what makes your book unique..."
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.synopsisLong && (
                    <p className="text-xs text-red-500">{errors.synopsisLong}</p>
                  )}
                  <p className="text-xs text-gray-400 ml-auto">
                    {form.synopsisLong.length}/4000
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------ Step 3: Classification ------ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Classification</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Categorize your book with keywords, BISAC codes, and audience information.
                </p>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Keywords
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestKeywords}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {aiGenerating ? 'Suggesting...' : 'AI Suggest'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() =>
                          updateField('keywords', form.keywords.filter((k) => k !== kw))
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    className={`${inputClasses('keywords')} flex-1`}
                    placeholder="Type a keyword and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BISAC codes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  BISAC Category
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.bisacCodes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200"
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() =>
                          updateField('bisacCodes', form.bisacCodes.filter((c) => c !== code))
                        }
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={bisacInput}
                    onChange={(e) => setBisacInput(e.target.value)}
                    className={inputClasses('bisacCodes')}
                    placeholder="Search BISAC codes..."
                  />
                  {bisacInput && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {SUGGESTED_BISAC.filter(
                        (b) =>
                          b.toLowerCase().includes(bisacInput.toLowerCase()) &&
                          !form.bisacCodes.includes(b),
                      ).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => addBisac(b)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Audience age range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Audience Age Range{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={form.audienceAgeMin}
                      onChange={(e) => updateField('audienceAgeMin', e.target.value)}
                      className={inputClasses('audienceAgeMin')}
                      placeholder="Min age"
                      min="0"
                      max="99"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={form.audienceAgeMax}
                      onChange={(e) => updateField('audienceAgeMax', e.target.value)}
                      className={inputClasses('audienceAgeMax')}
                      placeholder="Max age"
                      min="0"
                      max="99"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------ Step 4: Review ------ */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review & Create</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Review your title details before creating.
                </p>
              </div>

              <div className="space-y-4">
                {/* Basic Info summary */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Basic Information</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Title:</span>{' '}
                      <span className="font-medium text-gray-900">{form.title || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Subtitle:</span>{' '}
                      <span className="font-medium text-gray-900">{form.subtitle || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Author:</span>{' '}
                      <span className="font-medium text-gray-900">{form.primaryAuthor || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Genre:</span>{' '}
                      <span className="font-medium text-gray-900">{form.genre || '--'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Language:</span>{' '}
                      <span className="font-medium text-gray-900">{languageLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Description summary */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Description</h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-500">Short Synopsis:</span>
                      <p className="font-medium text-gray-900 mt-0.5 line-clamp-2">
                        {form.synopsisShort || '--'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Long Synopsis:</span>
                      <p className="font-medium text-gray-900 mt-0.5 line-clamp-3">
                        {form.synopsisLong || '--'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Classification summary */}
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Classification</h3>
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-500">Keywords:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {form.keywords.length > 0 ? (
                          form.keywords.map((kw) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">BISAC:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {form.bisacCodes.length > 0 ? (
                          form.bisacCodes.map((code) => (
                            <span
                              key={code}
                              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                            >
                              {code.split(' - ')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </div>
                    </div>
                    {(form.audienceAgeMin || form.audienceAgeMax) && (
                      <div>
                        <span className="text-gray-500">Audience:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {form.audienceAgeMin || '0'} - {form.audienceAgeMax || '99'} years
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Navigation buttons                                               */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={step === 1 ? () => navigate('/titles') : handleBack}
              className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="relative flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    Create Title
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
