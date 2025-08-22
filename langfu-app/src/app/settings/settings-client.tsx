'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Globe, Target, Palette, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Language } from '@prisma/client';
import { ThemeToggle } from '@/components/theme-toggle';

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    currentLanguage: Language;
    dailyGoal: number;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [currentLanguage, setCurrentLanguage] = useState(user.currentLanguage);
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Gesture settings (stored in localStorage)
  const [hapticEnabled, setHapticEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hapticEnabled') !== 'false';
    }
    return true;
  });
  const [swipeDistance, setSwipeDistance] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('swipeDistance')) || 100;
    }
    return 100;
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          currentLanguage,
          dailyGoal,
        }),
      });

      if (response.ok) {
        // Save gesture settings to localStorage
        localStorage.setItem('hapticEnabled', String(hapticEnabled));
        localStorage.setItem('swipeDistance', String(swipeDistance));

        setMessage('Settings saved successfully!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center transition-colors duration-200">
          <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-xl p-8 transition-all duration-200">
          <div className="space-y-6">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Palette className="w-5 h-5" />
                Appearance
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred color theme or use system settings
                  </p>
                </div>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Globe className="w-5 h-5" />
                Language Settings
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Learning Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentLanguage(Language.GERMAN)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                      currentLanguage === Language.GERMAN
                        ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🇩🇪 German
                  </button>

                  <button
                    onClick={() => setCurrentLanguage(Language.SPANISH)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                      currentLanguage === Language.SPANISH
                        ? 'bg-purple-500 dark:bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    🇪🇸 Spanish
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Target className="w-5 h-5" />
                Learning Goals
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Goal (words per day)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="flex-1 accent-purple-500 dark:accent-purple-400"
                  />
                  <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">
                    {dailyGoal}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            {/* Gesture Settings Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Smartphone className="w-5 h-5" />
                Gesture Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Haptic Feedback
                    </span>
                    <button
                      type="button"
                      onClick={() => setHapticEnabled(!hapticEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        hapticEnabled
                          ? 'bg-purple-500 dark:bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className="sr-only">Enable haptic feedback</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Vibration feedback for swipe actions (mobile devices)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Swipe Sensitivity
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={swipeDistance}
                      onChange={(e) => setSwipeDistance(Number(e.target.value))}
                      className="flex-1 accent-purple-500 dark:accent-purple-400"
                    />
                    <span className="w-16 text-center text-sm text-gray-900 dark:text-white">
                      {swipeDistance === 50
                        ? 'High'
                        : swipeDistance === 100
                          ? 'Normal'
                          : swipeDistance === 150
                            ? 'Low'
                            : 'Very Low'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>High</span>
                    <span>Normal</span>
                    <span>Low</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    How far you need to swipe to trigger an action
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg text-center transition-colors duration-200 ${
                  message.includes('success')
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {message}
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
