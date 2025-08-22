'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Home, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavigationHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  breadcrumbs?: Array<{
    label: string;
    href?: string; // Optional href - if not provided, item is not clickable
  }>;
  className?: string;
  variant?: 'glass' | 'solid' | 'transparent';
}

export default function NavigationHeader({
  title,
  subtitle,
  showBackButton = true,
  backHref,
  onBack,
  rightActions,
  breadcrumbs,
  className = '',
  variant = 'glass',
}: NavigationHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  // Track navigation history for smart back button
  useEffect(() => {
    const history = sessionStorage.getItem('navigationHistory');
    if (history) {
      setNavigationHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    setNavigationHistory((prev) => {
      const updated = [...prev, pathname];
      // Keep only last 10 paths
      if (updated.length > 10) {
        updated.shift();
      }
      sessionStorage.setItem('navigationHistory', JSON.stringify(updated));
      return updated;
    });
  }, [pathname]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      // Smart back navigation
      const previousPath = navigationHistory[navigationHistory.length - 2];
      if (previousPath && previousPath !== pathname) {
        router.push(previousPath);
      } else if (window.history.length > 1) {
        router.back();
      } else {
        // Fallback to dashboard
        router.push('/dashboard');
      }
    }
  };

  // Determine default back destination based on current path
  const getDefaultBackHref = () => {
    if (backHref) return backHref;

    const pathSegments = pathname.split('/').filter(Boolean);

    // Learning mode specific navigation
    if (pathSegments[0] === 'learn') {
      switch (pathSegments[1]) {
        case 'topic':
        case 'swipe':
        case 'new':
        case 'review':
          return '/dashboard';
        case 'session':
          // Check if came from topic mode or other sources
          const fromTopic = navigationHistory.includes('/learn/topic');
          return fromTopic ? '/learn/topic' : '/dashboard';
        default:
          return '/dashboard';
      }
    }

    // Library navigation
    if (pathSegments[0] === 'library') {
      if (pathSegments[1] === 'story') {
        return '/library';
      }
      return '/dashboard';
    }

    // Settings and other pages
    if (pathSegments[0] === 'settings') {
      return '/dashboard';
    }

    // Default fallback
    return '/dashboard';
  };

  const baseStyles = {
    glass:
      'bg-white/20 dark:bg-black/20 backdrop-blur-lg border-b border-white/10 dark:border-white/5',
    solid: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    transparent: 'bg-transparent',
  };

  const textStyles = {
    glass: 'text-white',
    solid: 'text-gray-900 dark:text-white',
    transparent: 'text-gray-900 dark:text-white',
  };

  return (
    <>
      {/* Mobile Navigation Header */}
      <header
        className={`sticky top-0 z-40 ${baseStyles[variant]} ${className} transition-all duration-200`}
      >
        <div className="px-4 py-3">
          {/* Main Navigation Row */}
          <div className="flex items-center justify-between">
            {/* Left Section: Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className={`flex items-center justify-center w-11 h-11 -ml-2 rounded-xl ${
                  variant === 'glass'
                    ? 'hover:bg-white/10 active:bg-white/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                } transition-all duration-200 touch-manipulation`}
                aria-label="Go back"
              >
                <ArrowLeft className={`w-5 h-5 ${textStyles[variant]}`} />
              </button>
            )}

            {/* Center Section: Title */}
            <div className="flex-1 mx-3">
              {title && (
                <h1 className={`text-lg font-semibold ${textStyles[variant]} truncate`}>{title}</h1>
              )}
              {subtitle && (
                <p
                  className={`text-sm ${
                    variant === 'glass' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  } truncate`}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              {rightActions}

              {/* Home Button for Quick Navigation */}
              <Link
                href="/dashboard"
                className={`flex items-center justify-center w-11 h-11 rounded-xl ${
                  variant === 'glass'
                    ? 'hover:bg-white/10 active:bg-white/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                } transition-all duration-200 touch-manipulation`}
                aria-label="Go to dashboard"
              >
                <Home className={`w-5 h-5 ${textStyles[variant]}`} />
              </Link>

              {/* Mobile Menu Toggle (if breadcrumbs exist) */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`flex items-center justify-center w-11 h-11 rounded-xl md:hidden ${
                    variant === 'glass'
                      ? 'hover:bg-white/10 active:bg-white/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                  } transition-all duration-200 touch-manipulation`}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? (
                    <X className={`w-5 h-5 ${textStyles[variant]}`} />
                  ) : (
                    <Menu className={`w-5 h-5 ${textStyles[variant]}`} />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Breadcrumbs - Desktop */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center gap-2 mt-2 text-sm" aria-label="Breadcrumb">
              <Link
                href="/dashboard"
                className={`${
                  variant === 'glass'
                    ? 'text-white/70 hover:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                } transition-colors`}
              >
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span
                    className={
                      variant === 'glass' ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'
                    }
                  >
                    /
                  </span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={`${
                        variant === 'glass'
                          ? 'text-white/70 hover:text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      } transition-colors`}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        variant === 'glass' ? 'text-white' : 'text-gray-900 dark:text-white'
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile Breadcrumbs Dropdown */}
        {mobileMenuOpen && breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className={`md:hidden px-4 pb-3 ${
              variant === 'glass'
                ? 'border-t border-white/10'
                : 'border-t border-gray-200 dark:border-gray-700'
            }`}
            aria-label="Breadcrumb"
          >
            <div className="pt-3 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  variant === 'glass'
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                Home
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={index}>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-lg ${
                        variant === 'glass'
                          ? 'text-white/80 hover:bg-white/10'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } transition-colors`}
                      style={{ paddingLeft: `${(index + 1) * 12 + 12}px` }}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`block px-3 py-2 font-medium ${
                        variant === 'glass' ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}
                      style={{ paddingLeft: `${(index + 1) * 12 + 12}px` }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Bottom Navigation Bar for Mobile (optional - can be used for primary actions) */}
      {/* This can be conditionally rendered based on the page */}
    </>
  );
}
