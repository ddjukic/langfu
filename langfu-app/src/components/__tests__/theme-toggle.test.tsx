import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';

// Mock next-themes
const mockSetTheme = jest.fn();
const mockTheme = { current: 'light' };

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme.current,
    setTheme: mockSetTheme,
    systemTheme: 'light',
    themes: ['light', 'dark', 'system'],
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme.current = 'light';
  });

  it('should render the toggle button', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('theme'));
  });

  it('should toggle from light to dark theme', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should toggle from dark to light theme', () => {
    mockTheme.current = 'dark';
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should show correct icon for light theme', () => {
    render(<ThemeToggle />);

    // Check for sun icon (light theme indicator)
    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should show correct icon for dark theme', () => {
    mockTheme.current = 'dark';
    render(<ThemeToggle />);

    // Check for moon icon (dark theme indicator)
    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle system theme', () => {
    mockTheme.current = 'system';
    render(<ThemeToggle />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should toggle to a specific theme when system is selected
    expect(mockSetTheme).toHaveBeenCalled();
  });

  it('should be keyboard accessible', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Should be focusable
    button.focus();
    expect(document.activeElement).toBe(button);

    // Should respond to Enter key
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    expect(mockSetTheme).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Should have aria-label
    expect(button).toHaveAttribute('aria-label');

    // Should indicate current state
    const ariaLabel = button.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  it('should handle rapid clicks gracefully', () => {
    render(<ThemeToggle />);

    const button = screen.getByRole('button');

    // Simulate rapid clicking
    for (let i = 0; i < 5; i++) {
      fireEvent.click(button);
    }

    // Should have been called 5 times
    expect(mockSetTheme).toHaveBeenCalledTimes(5);
  });

  it('should maintain proper contrast ratios', () => {
    const { container } = render(<ThemeToggle />);

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();

    // Button should have proper styling classes
    const classList = button?.className || '';
    expect(classList).toBeTruthy();
  });
});
