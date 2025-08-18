'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Globe, Target } from 'lucide-react';
import Link from 'next/link';
import { Language } from '@prisma/client';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 mb-6 flex items-center">
          <Link href="/dashboard" className="text-white hover:text-white/80 mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="space-y-6">
            {/* Profile Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Language Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language Settings
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Learning Language
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentLanguage(Language.GERMAN)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                      currentLanguage === Language.GERMAN
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇩🇪 German
                  </button>
                  
                  <button
                    onClick={() => setCurrentLanguage(Language.SPANISH)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all ${
                      currentLanguage === Language.SPANISH
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🇪🇸 Spanish
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Learning Goals
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-semibold text-lg">
                    {dailyGoal}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg text-center ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Save Button */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
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