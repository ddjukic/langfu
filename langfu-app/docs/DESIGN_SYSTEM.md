# LangFu Design System Documentation

## Overview

The LangFu app uses a consistent purple-based design system with glass morphism effects and dark mode support. All components should follow these established patterns to maintain visual consistency.

## Design Principles

1. **Purple Gradient Theme**: Primary backgrounds use gradient from purple-500 to pink-500
2. **Glass Morphism**: Headers and overlays use white/20 with backdrop blur
3. **Dark Mode First**: All components must support dark mode with appropriate color variants
4. **Consistent Spacing**: Use standard padding and margin values
5. **Smooth Transitions**: All interactive elements should have smooth color transitions

## Color Palette

### Primary Colors

- **Purple Gradient**: `from-purple-500 to-pink-500` (light) / `from-purple-900 to-pink-900` (dark)
- **Purple Accent**: `purple-600` (light) / `purple-400` (dark)
- **Purple Backgrounds**: `purple-100` (light) / `purple-900/30` (dark)

### Neutral Colors

- **White/Glass**: `white/20` (light) / `black/20` (dark) with `backdrop-blur`
- **Card Background**: `white` (light) / `gray-800` (dark)
- **Text Primary**: `gray-900` (light) / `white` (dark)
- **Text Secondary**: `gray-600` (light) / `gray-300` (dark)

### Semantic Colors

- **Success**: `green-50` background with `green-800` text (light)
- **Error**: `red-50` background with `red-800` text (light)
- **Info**: `blue-50` background with `blue-800` text (light)
- **Warning**: `yellow-50` background with `yellow-800` text (light)

## Component Patterns

### Layout Container

```tsx
<div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900 p-4 transition-colors duration-200">
  <div className="max-w-4xl mx-auto">{/* Content */}</div>
</div>
```

### Glass Header

```tsx
<div className="bg-white/20 dark:bg-black/20 backdrop-blur rounded-2xl p-6 mb-6">
  <h2 className="text-2xl font-bold text-white">Title</h2>
  <p className="text-white/80">Subtitle</p>
</div>
```

### Content Card

```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">{/* Card content */}</div>
```

### Primary Button

```tsx
<button className="px-6 py-3 bg-purple-500 dark:bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors">
  Button Text
</button>
```

### Secondary Button

```tsx
<button className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
  Button Text
</button>
```

### Glass Button

```tsx
<button className="px-4 py-2 bg-white/20 dark:bg-white/10 rounded-lg text-white hover:bg-white/30 dark:hover:bg-white/20 transition-colors">
  Button Text
</button>
```

### Interactive Card (Examples)

```tsx
<div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-700">
  {/* Content */}
</div>
```

### Word Display

```tsx
<h3 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
  {word}
</h3>
<p className="text-xl text-gray-600 dark:text-gray-300">
  {translation}
</p>
```

### Tags/Badges

```tsx
<span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
  {tag}
</span>
```

### Form Elements

```tsx
<textarea className="w-full h-32 p-4 border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 outline-none resize-none text-lg transition-colors" />
```

## Using the Design System

The design system is centralized in `/src/lib/design-system.ts`. Import and use it in your components:

```tsx
import { designSystem } from '@/lib/design-system';

// Use predefined classes
<div className={designSystem.layout.container}>
  <div className={designSystem.cards.glass}>
    <h2 className={designSystem.typography.h2}>Title</h2>
    <button className={designSystem.buttons.primary}>Click me</button>
  </div>
</div>;
```

## Migration Checklist

When updating existing components:

1. ✅ Replace blue colors with purple equivalents
2. ✅ Ensure dark mode classes are present
3. ✅ Use glass morphism for headers/overlays
4. ✅ Apply consistent button styles
5. ✅ Add proper transitions to interactive elements
6. ✅ Use the centralized design system classes

## Components Status

### Fully Migrated

- ✅ MatchingGame
- ✅ Dashboard
- ✅ ExampleSentences (fixed)
- ✅ SentenceCreation (fixed)
- ✅ SwipeCard

### May Need Review

- Learning Session
- Progress/Charts components
- Install Prompt
- Vocabulary Load

## Best Practices

1. **Always support dark mode**: Use `dark:` variants for all colors
2. **Use transitions**: Add `transition-colors duration-200` for smooth mode switching
3. **Maintain consistency**: Use the design system classes instead of custom styles
4. **Test both modes**: Always verify appearance in both light and dark modes
5. **Mobile first**: Ensure responsive design works on all screen sizes
