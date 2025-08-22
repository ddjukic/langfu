'use client';

import React from 'react';

interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}

export function SearchHighlight({ text, searchQuery, className = '' }: SearchHighlightProps) {
  if (!searchQuery || searchQuery.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters in the search query
  const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create case-insensitive regex
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // Split text by the regex
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search query (case-insensitive)
        const isMatch = part.toLowerCase() === searchQuery.toLowerCase();

        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-medium px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}
