'use client';

import NavigationHeader from '@/components/navigation-header';
import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Target,
  Trophy,
  ArrowRight,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

export default function TestNavigationPage() {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const viewportStyles = {
    mobile: 'max-w-[375px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-[1024px]',
  };

  const navigationExamples = [
    {
      title: 'Topic Mode',
      path: '/learn/topic',
      icon: BookOpen,
      description: 'Create stories with vocabulary',
    },
    {
      title: 'Swipe Learning',
      path: '/learn/swipe',
      icon: Target,
      description: 'Quick vocabulary review',
    },
    {
      title: 'Learning Session',
      path: '/learn/session',
      icon: Sparkles,
      description: 'Practice with games',
    },
    {
      title: 'Library Story',
      path: '/library/story/test',
      icon: BookOpen,
      description: 'Read interactive stories',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Viewport Size Selector */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mobile Navigation Test Suite
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Test Viewport:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewportSize('mobile')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewportSize === 'mobile'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-2" />
                Mobile (375px)
              </button>
              <button
                onClick={() => setViewportSize('tablet')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewportSize === 'tablet'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Tablet className="w-4 h-4 inline mr-2" />
                Tablet (768px)
              </button>
              <button
                onClick={() => setViewportSize('desktop')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewportSize === 'desktop'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Monitor className="w-4 h-4 inline mr-2" />
                Desktop (1024px)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header Examples */}
      <div className="p-8 space-y-8">
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Navigation Header Variants
          </h2>

          <div className="space-y-6">
            {/* Glass Variant */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Glass Variant (Default)
              </h3>
              <div className={`${viewportStyles[viewportSize]} mx-auto`}>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 rounded-lg overflow-hidden">
                  <NavigationHeader
                    title="Topic Mode"
                    subtitle="Create stories with vocabulary"
                    breadcrumbs={[
                      { label: 'Learning', href: '/dashboard' },
                      { label: 'Topic Mode' },
                    ]}
                    rightActions={
                      <div className="flex items-center gap-1 text-white">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    }
                  />
                  <div className="p-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                      <p className="text-white">Content area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solid Variant */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Solid Variant
              </h3>
              <div className={`${viewportStyles[viewportSize]} mx-auto`}>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <NavigationHeader
                    title="Matching Game"
                    subtitle="Round 2/3 • Score: 150"
                    variant="solid"
                    breadcrumbs={[
                      { label: 'Learning', href: '/dashboard' },
                      { label: 'Practice Session' },
                      { label: 'Matching' },
                    ]}
                    rightActions={
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Trophy className="w-5 h-5" />
                        <span className="font-semibold">150</span>
                      </div>
                    }
                  />
                  <div className="p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white">Content area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* With Multiple Breadcrumbs */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deep Navigation (Multiple Breadcrumbs)
              </h3>
              <div className={`${viewportStyles[viewportSize]} mx-auto`}>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 rounded-lg overflow-hidden">
                  <NavigationHeader
                    title="German Story"
                    subtitle="Intermediate • 250 words"
                    breadcrumbs={[
                      { label: 'Library', href: '/library' },
                      { label: 'My Stories', href: '/library/stories' },
                      { label: 'German', href: '/library/stories?lang=de' },
                      { label: 'Story Title' },
                    ]}
                    rightActions={
                      <button className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
                        <Sparkles className="w-5 h-5 text-white" />
                      </button>
                    }
                  />
                  <div className="p-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                      <p className="text-white">Story content area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Touch Target Testing */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Touch Target Testing
          </h2>
          <div
            className={`${viewportStyles[viewportSize]} mx-auto bg-white dark:bg-gray-800 rounded-lg p-4`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              All interactive elements have minimum 44x44px touch targets for mobile usability
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-purple-100 dark:bg-purple-900/30 rounded-xl border-2 border-dashed border-purple-400 dark:border-purple-600">
                  <span className="text-xs text-purple-700 dark:text-purple-300">44px</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Standard Touch Target
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Icon Button</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Navigation Links */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Test Live Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {navigationExamples.map((example) => {
              const Icon = example.icon;
              return (
                <Link
                  key={example.path}
                  href={example.path}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {example.title}
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {example.description}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                        {example.path}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Mobile Gesture Guide */}
        <section className="max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Mobile Interaction Guide
          </h2>
          <div className={`${viewportStyles[viewportSize]} mx-auto`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👆</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Tap</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Single tap to navigate or interact
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👈</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Swipe Back</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Swipe from left edge to go back (iOS)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Touch Targets</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All buttons are 44x44px minimum for easy tapping
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
