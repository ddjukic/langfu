'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationHeader from '@/components/navigation-header';
import { Save, X } from 'lucide-react';
import { Language } from '@prisma/client';
import { useLibraryStore } from '@/lib/store/library-store';

interface StoryEditClientProps {
  story: {
    id: string;
    title: string;
    topic: string | null;
    language: Language;
    level: string | null;
    content: string;
    summary: string | null;
  };
}

export default function StoryEditClient({ story }: StoryEditClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: story.title,
    topic: story.topic || '',
    level: story.level || '',
    summary: story.summary || '',
    content: story.content,
  });

  // Zustand store
  const updateStory = useLibraryStore((state) => state.updateStory);
  const setOperationState = useLibraryStore((state) => state.setOperationState);
  const clearOperationState = useLibraryStore((state) => state.clearOperationState);

  // Clean up operation state on unmount
  useEffect(() => {
    return () => {
      clearOperationState(story.id);
    };
  }, [story.id, clearOperationState]);

  const handleSave = async () => {
    // Clear any previous messages
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Story title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Story content is required');
      return;
    }

    setIsSaving(true);
    setOperationState(story.id, 'updating');

    try {
      const response = await fetch(`/api/library/story/${story.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          topic: formData.topic.trim() || null,
          level: formData.level.trim() || null,
          summary: formData.summary.trim() || null,
          content: formData.content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update story');
      }

      const updatedStory = await response.json();

      // Update the story in the store
      updateStory(story.id, {
        title: updatedStory.title,
        topic: updatedStory.topic,
        level: updatedStory.level,
        summary: updatedStory.summary,
        updatedAt: updatedStory.updatedAt || new Date().toISOString(),
      });

      setSuccess(true);

      // Redirect back to story view after a short delay
      setTimeout(() => {
        router.push(`/library/story/${story.id}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to save story:', error);
      setError('Failed to save story. Please try again.');
    } finally {
      setIsSaving(false);
      clearOperationState(story.id);
    }
  };

  const handleCancel = () => {
    router.push(`/library/story/${story.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 transition-colors duration-200">
      {/* Navigation Header */}
      <NavigationHeader
        title="Edit Story"
        subtitle={`${story.topic || 'General'} • ${story.language === 'GERMAN' ? '🇩🇪 German' : '🇪🇸 Spanish'}`}
        showBackButton={true}
        variant="glass"
        breadcrumbs={[
          { label: 'Library', href: '/library' },
          { label: story.title, href: `/library/story/${story.id}` },
          { label: 'Edit' },
        ]}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 touch-manipulation"
              aria-label="Cancel editing"
              disabled={isSaving}
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-500/80 hover:bg-green-500/90 active:bg-green-500 disabled:bg-gray-500/50 transition-all duration-200 touch-manipulation"
              aria-label="Save changes"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        }
      />

      {/* Message Display */}
      {error && (
        <div className="px-4 py-3 bg-red-500/20 backdrop-blur-lg border-b border-red-500/30">
          <div className="max-w-4xl mx-auto">
            <p className="text-white text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="px-4 py-3 bg-green-500/20 backdrop-blur-lg border-b border-green-500/30">
          <div className="max-w-4xl mx-auto">
            <p className="text-white text-sm font-medium">
              Story saved successfully! Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-6 md:p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter story title..."
                disabled={isSaving}
              />
            </div>

            {/* Topic and Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="topic"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Travel, Food, Daily Life"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Level
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  disabled={isSaving}
                >
                  <option value="">Select level</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Summary
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                placeholder="Brief description of the story..."
                rows={3}
                disabled={isSaving}
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                placeholder="Story content..."
                rows={20}
                disabled={isSaving}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formData.content.split(/\s+/).filter((word) => word.length > 0).length} words
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
