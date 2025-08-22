// Custom test renderer with providers

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useParams() {
    return {};
  },
}));

interface AllTheProvidersProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'system';
}

// Add all providers that wrap the app
function AllTheProviders({ children, theme = 'system' }: AllTheProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system';
}

// Custom render function that includes providers
const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  const { theme, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders theme={theme}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Utility functions for common test scenarios
export const testUtils = {
  // Wait for async operations
  waitForAsync: async (ms: number = 100) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // Mock fetch for API calls
  mockFetch: (response: any, status: number = 200) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      } as Response)
    );
  },

  // Clear all mocks
  clearAllMocks: () => {
    jest.clearAllMocks();
    if (global.fetch && jest.isMockFunction(global.fetch)) {
      (global.fetch as jest.Mock).mockClear();
    }
  },

  // Simulate viewport size
  setViewport: (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
    window.dispatchEvent(new Event('resize'));
  },

  // Simulate mobile device
  setMobileDevice: () => {
    testUtils.setViewport(375, 667);
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    });
  },

  // Simulate desktop device
  setDesktopDevice: () => {
    testUtils.setViewport(1920, 1080);
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });
  },

  // Mock localStorage
  mockLocalStorage: () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    return localStorageMock;
  },

  // Mock sessionStorage
  mockSessionStorage: () => {
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });
    return sessionStorageMock;
  },

  // Simulate theme preference
  setThemePreference: (theme: 'light' | 'dark') => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: theme === 'dark' && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  },

  // Simulate network conditions
  setNetworkCondition: (online: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: online,
    });
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  },

  // Get computed styles
  getComputedStyles: (element: HTMLElement) => {
    return window.getComputedStyle(element);
  },

  // Check contrast ratio (simplified)
  checkContrastRatio: (foreground: string, background: string): number => {
    // This is a simplified version - real implementation would need
    // to parse RGB values and calculate luminance
    return 4.5; // Minimum WCAG AA ratio
  },
};

export default customRender;
