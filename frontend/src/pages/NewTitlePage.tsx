import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const genres = [
  'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller',
  'Romance', 'Business', 'Self-Help', 'Biography', 'History', 'Cooking', 'Travel',
  "Children's", 'Poetry',
];

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.875rem',
  color: '#e8f1f8',
  background: 'rgba(10,22,40,0.65)',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#8aafc8',
  marginBottom: '0.375rem',
};

export const NewTitlePage = () => {
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm] = useState({
    title: '', subtitle: '', genre: '', language: 'en', authorName: '',
  });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())      e.title      = 'Title is required';
    if (!form.authorName.trim()) e.authorName = 'Author name is required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    toast.success('Title created! Now add your manuscript.');
    navigate('/titles');
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const getInputStyle = (name: string, hasError: boolean): React.CSSProperties => ({
    ...inputBase,
    border: hasError
      ? '1px solid rgba(248,113,113,0.60)'
      : focusedField === name
      ? '1px solid rgba(212,175,55,0.60)'
      : '1px solid rgba(61,96,128,0.40)',
    boxShadow: focusedField === name
      ? '0 0 0 3px rgba(201,162,39,0.12)'
      : hasError
      ? '0 0 0 3px rgba(248,113,113,0.08)'
      : 'none',
  });

  return (
    <Layout
      title="New Title"
      breadcrumbs={[{ label: 'My Titles', href: '/titles' }, { label: 'New Title' }]}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a2d4e 0%, #0f2040 100%)',
            border: '1px solid rgba(212,175,55,0.20)',
            boxShadow: '0 4px 24px rgba(5,13,26,0.50)',
          }}
        >
          {/* Gold top accent rule */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)' }}
          />
          {/* Radial inner glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 65%)' }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-7">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(10,22,40,0.60) 100%)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  boxShadow: '0 4px 12px rgba(212,175,55,0.12)',
                }}
              >
                <BookOpenIcon className="w-6 h-6" style={{ color: '#d4af37' }} />
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#e0c060' }}
                >
                  Create a New Title
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'rgba(138,175,200,0.65)', fontFamily: 'Inter, sans-serif' }}
                >
                  Start your publishing journey with basic information. You can add more details later.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label style={labelStyle}>
                  Title <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  {...field('title')}
                  style={getInputStyle('title', !!errors.title)}
                  placeholder="Enter your book title"
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.title && (
                  <p className="text-xs mt-1" style={{ color: '#f87171', fontFamily: 'Inter, sans-serif' }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  {...field('subtitle')}
                  style={getInputStyle('subtitle', false)}
                  placeholder="Optional subtitle"
                  onFocus={() => setFocusedField('subtitle')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              {/* Author name */}
              <div>
                <label style={labelStyle}>
                  Author Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  {...field('authorName')}
                  style={getInputStyle('authorName', !!errors.authorName)}
                  placeholder="Author or pen name"
                  onFocus={() => setFocusedField('authorName')}
                  onBlur={() => setFocusedField(null)}
                />
                {errors.authorName && (
                  <p className="text-xs mt-1" style={{ color: '#f87171', fontFamily: 'Inter, sans-serif' }}>
                    {errors.authorName}
                  </p>
                )}
              </div>

              {/* Genre + Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Genre</label>
                  <select
                    {...field('genre')}
                    style={{ ...getInputStyle('genre', false), cursor: 'pointer', colorScheme: 'dark' }}
                    onFocus={() => setFocusedField('genre')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="" style={{ background: '#0f2040' }}>Select genre</option>
                    {genres.map(g => (
                      <option key={g} value={g} style={{ background: '#0f2040' }}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Language</label>
                  <select
                    {...field('language')}
                    style={{ ...getInputStyle('language', false), cursor: 'pointer', colorScheme: 'dark' }}
                    onFocus={() => setFocusedField('language')}
                    onBlur={() => setFocusedField(null)}
                  >
                    <option value="en" style={{ background: '#0f2040' }}>English</option>
                    <option value="es" style={{ background: '#0f2040' }}>Spanish</option>
                    <option value="fr" style={{ background: '#0f2040' }}>French</option>
                    <option value="de" style={{ background: '#0f2040' }}>German</option>
                    <option value="pt" style={{ background: '#0f2040' }}>Portuguese</option>
                    <option value="it" style={{ background: '#0f2040' }}>Italian</option>
                  </select>
                </div>
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(61,96,128,0.30), transparent)' }}
              />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/titles')}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(61,96,128,0.40)',
                    color: '#8aafc8',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.65)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#c5d8e8';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(61,96,128,0.10)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(61,96,128,0.40)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#8aafc8';
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-150"
                  style={{
                    background: 'linear-gradient(135deg, #c9a227 0%, #d4af37 50%, #c9a227 100%)',
                    color: '#0a1628',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 2px 12px rgba(201,162,39,0.35)',
                    border: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(201,162,39,0.50)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(201,162,39,0.35)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  Create Title →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
