'use client';

import { Library, Book, Plus, MoreHorizontal } from 'lucide-react';

interface LibraryBottomNavProps {
  activeTab: 'words' | 'stories';
  onTabChange: (tab: 'words' | 'stories') => void;
  wordsCount: number;
  storiesCount: number;
  onAddNew?: () => void;
}

export default function LibraryBottomNav({
  activeTab,
  onTabChange,
  wordsCount,
  storiesCount,
  onAddNew,
}: LibraryBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Backdrop blur for iOS-style effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl" />

      {/* Navigation Content */}
      <div className="relative flex items-center justify-around px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        {/* Words Tab */}
        <button
          onClick={() => onTabChange('words')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === 'words'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <div className="relative">
            <Library
              className={`w-6 h-6 ${activeTab === 'words' ? 'scale-110' : ''} transition-transform`}
            />
            {wordsCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'words'
                    ? 'bg-purple-600 dark:bg-purple-400 text-white'
                    : 'bg-gray-500 dark:bg-gray-400 text-white'
                }`}
              >
                {wordsCount > 99 ? '99+' : wordsCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Words</span>
        </button>

        {/* Stories Tab */}
        <button
          onClick={() => onTabChange('stories')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
            activeTab === 'stories'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <div className="relative">
            <Book
              className={`w-6 h-6 ${activeTab === 'stories' ? 'scale-110' : ''} transition-transform`}
            />
            {storiesCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'stories'
                    ? 'bg-purple-600 dark:bg-purple-400 text-white'
                    : 'bg-gray-500 dark:bg-gray-400 text-white'
                }`}
              >
                {storiesCount > 99 ? '99+' : storiesCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">Stories</span>
        </button>

        {/* Add New Button (Central) */}
        {onAddNew && (
          <button onClick={onAddNew} className="flex flex-col items-center gap-1 px-4 py-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </button>
        )}

        {/* More Options */}
        <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400">
          <MoreHorizontal className="w-6 h-6" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </div>
  );
}
