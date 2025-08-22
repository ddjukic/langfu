/**
 * Centralized Design System for LangFu App
 *
 * This file contains all the reusable style classes and design tokens
 * to ensure consistency across the application.
 */

export const designSystem = {
  // Layout
  layout: {
    container:
      'min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200',
    maxWidth: 'max-w-4xl mx-auto',
    maxWidthLarge: 'max-w-6xl mx-auto',
  },

  // Cards
  cards: {
    glass: 'bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl',
    glassHeader: 'bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-6',
    solid: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
    solidWithPadding: 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8',
    interactive:
      'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg dark:shadow-xl transition-all duration-200',
  },

  // Typography
  typography: {
    // Headers
    h1: 'text-3xl font-bold text-white',
    h2: 'text-2xl font-bold text-white',
    h3: 'text-4xl font-bold text-purple-600 dark:text-purple-400',

    // Text
    subtitle: 'text-white/80',
    body: 'text-gray-600 dark:text-gray-300',
    bodyLarge: 'text-xl text-gray-600 dark:text-gray-300',

    // Special
    wordDisplay: 'text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2',
    translation: 'text-xl text-gray-600 dark:text-gray-300',
  },

  // Buttons
  buttons: {
    // Primary (Purple)
    primary:
      'px-6 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors',
    primaryWithIcon:
      'px-6 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors flex items-center gap-2',

    // Secondary (Gray)
    secondary:
      'px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors',

    // Glass
    glass:
      'px-4 py-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-colors',
    glassWithIcon:
      'px-4 py-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-colors flex items-center gap-2',

    // Icon only
    iconGlass:
      'p-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200',
  },

  // Interactive Elements
  interactive: {
    // Example sentence cards
    exampleCard:
      'p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-700',

    // Highlighted text
    highlightedWord: 'bg-purple-600 dark:bg-purple-500 text-white px-1 rounded font-semibold',

    // Tags
    tag: 'inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm',
  },

  // Feedback
  feedback: {
    success:
      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700',
    error:
      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
    warning:
      'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
  },

  // Forms
  forms: {
    textarea:
      'w-full h-32 p-4 border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none resize-none text-lg transition-colors',
    input:
      'w-full p-4 border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none text-lg transition-colors',
  },

  // Animations
  animations: {
    spin: 'animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 dark:border-purple-400',
    pulse: 'animate-pulse',
    fadeIn: 'animate-fadeIn',
  },

  // Utilities
  utils: {
    divider: 'border-t border-purple-200 dark:border-purple-700',
    centerText: 'text-center',
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
  },
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
