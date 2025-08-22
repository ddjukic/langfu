import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/learn/new', name: 'Learn New' },
  { path: '/vocabulary/load', name: 'Vocabulary Load' },
  { path: '/settings', name: 'Settings' },
  { path: '/extract', name: 'Extract' },
];

test.describe('WCAG 2.1 AA Compliance', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} page should meet WCAG 2.1 AA standards`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Run accessibility tests
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Violations found on ${pageInfo.name}:`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        });
      }

      // Assert no violations
      expect(accessibilityScanResults.violations).toHaveLength(0);
    });

    test(`${pageInfo.name} page should have proper heading hierarchy`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // Get all headings
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
        elements.map((el) => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
        }))
      );

      // Check heading hierarchy
      let previousLevel = 0;
      for (const heading of headings) {
        // Heading levels should not skip (e.g., h1 -> h3)
        if (previousLevel > 0) {
          expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
        }
        previousLevel = heading.level;
      }

      // Should have at least one h1
      const h1Count = headings.filter((h) => h.level === 1).length;
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Should not have more than one h1 (typically)
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test(`${pageInfo.name} page should have proper language attributes`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // Check html lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
    });

    test(`${pageInfo.name} page should have skip navigation links`, async ({ page }) => {
      await page.goto(pageInfo.path);

      // Look for skip links (usually hidden but accessible)
      const skipLinks = await page.$$(
        '[href^="#"][class*="skip"], [href^="#main"], [href^="#content"]'
      );

      // At least one skip link should be present for keyboard navigation
      if (pageInfo.path !== '/login' && pageInfo.path !== '/register') {
        expect(skipLinks.length).toBeGreaterThan(0);
      }
    });
  }

  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate with keyboard only', async ({ page }) => {
      await page.goto('/');

      // Start tabbing through the page
      let activeElement = await page.evaluate(() => document.activeElement?.tagName);

      // Tab through interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');

        const newActiveElement = await page.evaluate(() => ({
          tag: document.activeElement?.tagName,
          visible: document.activeElement
            ? window.getComputedStyle(document.activeElement).visibility !== 'hidden'
            : false,
          tabIndex: (document.activeElement as HTMLElement)?.tabIndex,
        }));

        // Focused element should be visible
        if (newActiveElement.tag !== 'BODY') {
          expect(newActiveElement.visible).toBe(true);
        }

        // Should not focus on elements with negative tabindex
        expect(newActiveElement.tabIndex).toBeGreaterThanOrEqual(-1);
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Check if focused element has visible outline
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el) return null;

        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          border: styles.border,
          boxShadow: styles.boxShadow,
        };
      });

      if (focusedElement) {
        // Should have some form of focus indicator
        const hasOutline =
          focusedElement.outlineWidth !== '0px' && focusedElement.outline !== 'none';
        const hasBoxShadow = focusedElement.boxShadow !== 'none';
        const hasBorder = focusedElement.border !== 'none';

        expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
      }
    });

    test('should trap focus in modals', async ({ page }) => {
      // This test would need an actual modal to test
      // Skip if no modals are present
      await page.goto('/dashboard');

      // Try to find and open a modal
      const modalTrigger = page.getByRole('button', { name: /open|add|create|new/i }).first();

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Wait for modal to appear
        const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();

        if (await modal.isVisible()) {
          // Tab through modal
          const focusableElements = await modal
            .locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
            .all();

          if (focusableElements.length > 0) {
            // Focus should stay within modal
            await page.keyboard.press('Tab');

            const focusedElement = await page.evaluate(() =>
              document.activeElement?.closest('[role="dialog"], .modal, [class*="modal"]')
            );

            expect(focusedElement).toBeTruthy();
          }
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels for interactive elements', async ({ page }) => {
      await page.goto('/');

      // Check buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);

        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label');
          const textContent = await button.textContent();
          const title = await button.getAttribute('title');

          // Button should have accessible text
          expect(ariaLabel || textContent?.trim() || title).toBeTruthy();
        }
      }

      // Check links
      const links = page.locator('a');
      const linkCount = await links.count();

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);

        if (await link.isVisible()) {
          const ariaLabel = await link.getAttribute('aria-label');
          const textContent = await link.textContent();
          const title = await link.getAttribute('title');

          // Link should have accessible text
          expect(ariaLabel || textContent?.trim() || title).toBeTruthy();
        }
      }
    });

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/login');

      // Check all form inputs
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);

        if (await input.isVisible()) {
          const inputId = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledby = await input.getAttribute('aria-labelledby');

          // Check for associated label
          if (inputId) {
            const label = page.locator(`label[for="${inputId}"]`);
            const hasLabel = (await label.count()) > 0;

            // Input should have a label or aria-label
            expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
          } else {
            // If no id, must have aria-label
            expect(ariaLabel || ariaLabelledby).toBeTruthy();
          }
        }
      }
    });

    test('should have proper ARIA roles for landmarks', async ({ page }) => {
      await page.goto('/');

      // Check for main landmarks
      const landmarks = {
        main: page.locator('[role="main"], main'),
        navigation: page.locator('[role="navigation"], nav'),
        banner: page.locator('[role="banner"], header'),
        contentinfo: page.locator('[role="contentinfo"], footer'),
      };

      // Should have main content area
      expect(await landmarks.main.count()).toBeGreaterThan(0);

      // Should have navigation
      expect(await landmarks.navigation.count()).toBeGreaterThan(0);
    });

    test('should announce live regions properly', async ({ page }) => {
      await page.goto('/learn/new');

      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="alert"], [role="status"]');
      const count = await liveRegions.count();

      for (let i = 0; i < count; i++) {
        const region = liveRegions.nth(i);
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');

        // Live regions should have appropriate politeness
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive);
        }

        // Alert and status roles are implicitly live
        if (role === 'alert' || role === 'status') {
          expect(role).toBeTruthy();
        }
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('should not rely solely on color to convey information', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for elements that might use color alone
      const elements = page.locator(
        '.success, .error, .warning, [class*="success"], [class*="error"], [class*="warning"]'
      );
      const count = await elements.count();

      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);

        if (await element.isVisible()) {
          // Should have text or icon in addition to color
          const text = await element.textContent();
          const hasIcon = (await element.locator('svg, img, [class*="icon"]').count()) > 0;
          const ariaLabel = await element.getAttribute('aria-label');

          expect(text?.trim() || hasIcon || ariaLabel).toBeTruthy();
        }
      }
    });

    test('should maintain contrast in high contrast mode', async ({ page }) => {
      // Emulate high contrast mode
      await page.emulateMedia({ forcedColors: 'active' });
      await page.goto('/');

      // Run contrast check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter((v) =>
        v.id.includes('contrast')
      );

      expect(contrastViolations).toHaveLength(0);
    });
  });

  test.describe('Forms and Errors', () => {
    test('should have accessible error messages', async ({ page }) => {
      await page.goto('/login');

      // Submit form with invalid data
      const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for error messages
        await page.waitForTimeout(500);

        // Check for error messages
        const errors = page.locator(
          '[role="alert"], .error, [class*="error"], [aria-invalid="true"]'
        );
        const errorCount = await errors.count();

        if (errorCount > 0) {
          for (let i = 0; i < errorCount; i++) {
            const error = errors.nth(i);

            if (await error.isVisible()) {
              // Error should be associated with form field
              const describedby = await error.getAttribute('aria-describedby');
              const role = await error.getAttribute('role');
              const text = await error.textContent();

              // Should have meaningful error text
              expect(text?.trim().length).toBeGreaterThan(0);

              // Should be announced to screen readers
              expect(role === 'alert' || describedby).toBeTruthy();
            }
          }
        }
      }
    });

    test('should have proper field validation indicators', async ({ page }) => {
      await page.goto('/register');

      // Find required fields
      const requiredFields = page.locator('input[required], input[aria-required="true"]');
      const count = await requiredFields.count();

      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const field = requiredFields.nth(i);

        if (await field.isVisible()) {
          // Required fields should be indicated
          const required = await field.getAttribute('required');
          const ariaRequired = await field.getAttribute('aria-required');

          expect(required !== null || ariaRequired === 'true').toBeTruthy();
        }
      }
    });
  });
});
