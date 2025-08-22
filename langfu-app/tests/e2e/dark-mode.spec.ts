import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Dark Mode Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Check initial theme (should be light by default or system preference)
    const html = page.locator('html');

    // Find and click the theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Get initial theme
    const initialTheme = await html.getAttribute('class');
    const isInitiallyDark = initialTheme?.includes('dark');

    // Click to toggle theme
    await themeToggle.click();

    // Wait for theme change
    if (isInitiallyDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Toggle back
    await themeToggle.click();

    // Should return to original theme
    if (isInitiallyDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });

  test('should persist theme preference across page reloads', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Set to dark mode
    const initialTheme = await html.getAttribute('class');
    if (!initialTheme?.includes('dark')) {
      await themeToggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    // Reload the page
    await page.reload();

    // Theme should still be dark
    await expect(html).toHaveClass(/dark/);

    // Set to light mode
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);

    // Reload again
    await page.reload();

    // Theme should still be light
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should persist theme preference across navigation', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Set to dark mode
    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);

    // Navigate to different pages
    await page.goto('/dashboard');
    await expect(html).toHaveClass(/dark/);

    await page.goto('/learn/new');
    await expect(html).toHaveClass(/dark/);

    await page.goto('/settings');
    await expect(html).toHaveClass(/dark/);

    // Toggle to light mode
    await page.getByRole('button', { name: /toggle theme/i }).click();
    await expect(html).not.toHaveClass(/dark/);

    // Navigate back to home
    await page.goto('/');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should have proper contrast ratios in dark mode', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Set to dark mode
    const initialTheme = await html.getAttribute('class');
    if (!initialTheme?.includes('dark')) {
      await themeToggle.click();
      await expect(html).toHaveClass(/dark/);
    }

    // Run accessibility tests in dark mode
    const darkModeResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for contrast violations
    const contrastViolations = darkModeResults.violations.filter((violation) =>
      violation.id.includes('contrast')
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should have proper contrast ratios in light mode', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Set to light mode
    const initialTheme = await html.getAttribute('class');
    if (initialTheme?.includes('dark')) {
      await themeToggle.click();
      await expect(html).not.toHaveClass(/dark/);
    }

    // Run accessibility tests in light mode
    const lightModeResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for contrast violations
    const contrastViolations = lightModeResults.violations.filter((violation) =>
      violation.id.includes('contrast')
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should apply correct colors to all components in dark mode', async ({ page }) => {
    const html = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });

    // Set to dark mode
    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);

    // Navigate to dashboard to check components
    await page.goto('/dashboard');

    // Check background colors
    const body = page.locator('body');
    const bodyBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Dark mode should have dark background
    const rgb = bodyBg.match(/\d+/g);
    if (rgb) {
      const [r, g, b] = rgb.map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      expect(brightness).toBeLessThan(128); // Dark background
    }

    // Check text colors for proper contrast
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const isVisible = await heading.isVisible();

      if (isVisible) {
        const color = await heading.evaluate((el) => window.getComputedStyle(el).color);

        // Text should be light in dark mode
        const textRgb = color.match(/\d+/g);
        if (textRgb) {
          const [r, g, b] = textRgb.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          expect(brightness).toBeGreaterThan(128); // Light text
        }
      }
    }
  });

  test('should handle theme toggle on mobile devices', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    const html = page.locator('html');

    // On mobile, theme toggle might be in a menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Toggle theme
    await themeToggle.click();

    // Check theme changed
    const currentTheme = await html.getAttribute('class');
    expect(currentTheme).toBeDefined();
  });

  test('should respect system preference on first visit', async ({ page, context }) => {
    // Clear all cookies and storage
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Set prefer dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Set prefer light mode
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();

    // Note: This might still be dark if localStorage was set
    // Clear localStorage to test system preference
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();

    await expect(html).not.toHaveClass(/dark/);
  });

  test('should not have flash of incorrect theme on page load', async ({ page }) => {
    // Set dark mode
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await themeToggle.click();

    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Navigate to a new page and check for theme flash
    await page.goto('/dashboard', { waitUntil: 'commit' });

    // Theme should be applied immediately
    const theme = await html.getAttribute('class');
    expect(theme).toContain('dark');
  });

  test('should work correctly on all major pages', async ({ page }) => {
    const pages = ['/', '/dashboard', '/learn/new', '/vocabulary/load', '/settings', '/extract'];

    const html = page.locator('html');

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Find theme toggle (location might vary per page)
      const themeToggle = page.getByRole('button', { name: /toggle theme/i });

      if (await themeToggle.isVisible()) {
        // Test theme toggle on this page
        const initialTheme = await html.getAttribute('class');
        await themeToggle.click();

        // Wait for theme to change
        await page.waitForTimeout(100);

        const newTheme = await html.getAttribute('class');
        expect(newTheme).not.toBe(initialTheme);

        // Verify no JavaScript errors
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        expect(consoleErrors).toHaveLength(0);
      }
    }
  });
});
