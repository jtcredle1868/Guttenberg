import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

const genres = ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Business', 'Self-Help', 'Biography', 'History', 'Cooking', 'Travel', 'Children\'s', 'Poetry'];

export const NewTitlePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', subtitle: '', genre: '', language: 'en', authorName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
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

  return (
    <Layout title="New Title" breadcrumbs={[{ label: 'My Titles', href: '/titles' }, { label: 'New Title' }]}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Create a New Title</h2>
            <p className="text-sm text-gray-500 mt-1">Start your publishing journey with basic information. You can add more details later.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
              <input {...field('title')} className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-400' : 'border-gray-300'} rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`} placeholder="Enter your book title" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
              <input {...field('subtitle')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Optional subtitle" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Author Name <span className="text-red-500">*</span></label>
              <input {...field('authorName')} className={`w-full px-4 py-2.5 border ${errors.authorName ? 'border-red-400' : 'border-gray-300'} rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none`} placeholder="Author or pen name" />
              {errors.authorName && <p className="text-xs text-red-500 mt-1">{errors.authorName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                <select {...field('genre')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                  <option value="">Select genre</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <select {...field('language')} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="it">Italian</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate('/titles')} className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                Create Title
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
