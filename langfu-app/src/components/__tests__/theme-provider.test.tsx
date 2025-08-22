import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../theme-provider';
import { ThemeToggle } from '../theme-toggle';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" {...props}>
      {children}
    </div>
  ),
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
    themes: ['light', 'dark', 'system'],
  }),
}));

describe('ThemeProvider', () => {
  it('should render children correctly', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });

  it('should pass props to NextThemesProvider', () => {
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="app-theme"
      >
        <div>Content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('theme-provider');
    expect(provider).toHaveAttribute('attribute', 'class');
    expect(provider).toHaveAttribute('defaultTheme', 'dark');
    expect(provider).toHaveAttribute('enableSystem', 'false');
    expect(provider).toHaveAttribute('storageKey', 'app-theme');
  });

  it('should not crash with no props', () => {
    expect(() => {
      render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      );
    }).not.toThrow();
  });

  it('should handle multiple children', () => {
    render(
      <ThemeProvider attribute="class">
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('should handle fragment children', () => {
    render(
      <ThemeProvider attribute="class">
        <>
          <div data-testid="fragment-child1">Fragment Child 1</div>
          <div data-testid="fragment-child2">Fragment Child 2</div>
        </>
      </ThemeProvider>
    );

    expect(screen.getByTestId('fragment-child1')).toBeInTheDocument();
    expect(screen.getByTestId('fragment-child2')).toBeInTheDocument();
  });

  it('should preserve children props', () => {
    const handleClick = jest.fn();

    render(
      <ThemeProvider attribute="class">
        <button onClick={handleClick} data-testid="button">
          Click me
        </button>
      </ThemeProvider>
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
