'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TestDarkModePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-6 mb-6 transition-colors duration-200">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Dark Mode Test</h1>
            <ThemeToggle />
          </div>
        </div>

        {/* Test Components */}
        <div className="space-y-6">
          {/* Card Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Card Component
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This is a standard card that adapts to light and dark modes. Notice how the text
              contrast is maintained for readability.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white">Feature 1</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Description text</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white">Feature 2</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Description text</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white">Feature 3</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Description text</p>
              </div>
            </div>
          </div>

          {/* Button Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Button Styles</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors">
                  Primary Button
                </button>
                <button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Secondary Button
                </button>
                <button className="px-6 py-3 border-2 border-purple-500 dark:border-purple-400 text-purple-500 dark:text-purple-400 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  Outline Button
                </button>
              </div>
            </div>
          </div>

          {/* Form Elements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Form Elements</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text Input
                </label>
                <input
                  type="text"
                  placeholder="Enter some text..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Textarea
                </label>
                <textarea
                  placeholder="Enter longer text..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-full h-20 bg-purple-500 dark:bg-purple-600 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Purple</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-pink-500 dark:bg-pink-600 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pink</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-blue-500 dark:bg-blue-600 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blue</p>
              </div>
              <div className="text-center">
                <div className="w-full h-20 bg-green-500 dark:bg-green-600 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Green</p>
              </div>
            </div>
          </div>

          {/* Mobile Responsive Test */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 transition-all duration-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Mobile Responsive
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This layout is fully responsive. Try resizing your browser window or viewing on
              different devices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 text-white rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold">{i}</div>
                  <div className="text-sm opacity-90">Item {i}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Link */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 dark:bg-black/20 backdrop-blur text-white rounded-lg font-semibold hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
