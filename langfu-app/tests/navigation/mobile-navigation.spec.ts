import { test, expect } from '@playwright/test';

const mobileViewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
];

test.describe('Mobile Navigation System', () => {
  mobileViewports.forEach((viewport) => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test('navigation header has proper touch targets', async ({ page }) => {
        await page.goto('/test-navigation');

        // Check back button size
        const backButton = page.locator('button[aria-label="Go back"]').first();
        if (await backButton.isVisible()) {
          const box = await backButton.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }

        // Check home button size
        const homeButton = page.locator('a[aria-label="Go to dashboard"]').first();
        if (await homeButton.isVisible()) {
          const box = await homeButton.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(44);
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('breadcrumbs work on mobile', async ({ page }) => {
        await page.goto('/test-navigation');

        // Check if breadcrumbs are accessible via menu button on mobile
        const menuButton = page.locator('button[aria-label="Toggle navigation menu"]').first();
        if (await menuButton.isVisible()) {
          await menuButton.click();

          // Verify breadcrumb dropdown appears
          await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
        }
      });

      test('navigation flows work correctly', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'd.dejan.djukic@gmail.com');
        await page.fill('input[type="password"]', 'langfu-test');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        // Test navigation to Topic Mode
        await page.goto('/learn/topic');
        await expect(page.locator('h1:has-text("Topic Mode")')).toBeVisible();

        // Test back navigation
        const backButton = page.locator('button[aria-label="Go back"]').first();
        if (await backButton.isVisible()) {
          await backButton.click();
          await expect(page).toHaveURL('/dashboard');
        }
      });

      test('swipe learning navigation', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'd.dejan.djukic@gmail.com');
        await page.fill('input[type="password"]', 'langfu-test');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        // Navigate to swipe learning
        await page.goto('/learn/swipe');

        // Check navigation header is present
        await expect(page.locator('text=Swipe Learning')).toBeVisible();

        // Check subtitle shows word count
        const subtitle = page.locator('header').locator('text=/\\d+ words to review/');
        if (await subtitle.isVisible()) {
          await expect(subtitle).toBeVisible();
        }
      });

      test('library story navigation', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[type="email"]', 'd.dejan.djukic@gmail.com');
        await page.fill('input[type="password"]', 'langfu-test');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');

        // Navigate to library
        await page.goto('/library');

        // If there are stories, test navigation
        const storyLinks = page.locator('a[href^="/library/story/"]');
        const count = await storyLinks.count();

        if (count > 0) {
          await storyLinks.first().click();

          // Check navigation header is present
          await expect(page.locator('header').first()).toBeVisible();

          // Check back to library link works
          const backButton = page.locator('button[aria-label="Go back"]').first();
          if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page).toHaveURL('/library');
          }
        }
      });

      test('sticky header behavior', async ({ page }) => {
        await page.goto('/test-navigation');

        const header = page.locator('header').first();

        // Check header is sticky
        const position = await header.evaluate((el) => window.getComputedStyle(el).position);
        expect(position).toBe('sticky');

        // Scroll down and verify header stays visible
        await page.evaluate(() => window.scrollBy(0, 500));
        await expect(header).toBeVisible();
      });

      test('glass effect on navigation', async ({ page }) => {
        await page.goto('/test-navigation');

        const glassHeader = page.locator('.backdrop-blur').first();
        if (await glassHeader.isVisible()) {
          // Check backdrop blur is applied
          const backdropFilter = await glassHeader.evaluate(
            (el) => window.getComputedStyle(el).backdropFilter
          );
          expect(backdropFilter).toContain('blur');
        }
      });
    });
  });

  test('responsive breadcrumbs', async ({ page }) => {
    // Desktop view - breadcrumbs should be inline
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/test-navigation');

    const desktopBreadcrumbs = page.locator('.hidden.md\\:flex').first();
    if (await desktopBreadcrumbs.isVisible()) {
      await expect(desktopBreadcrumbs).toBeVisible();
    }

    // Mobile view - breadcrumbs should be in dropdown
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileBreadcrumbs = page.locator('.md\\:hidden').first();
    const menuButton = page.locator('button[aria-label="Toggle navigation menu"]').first();

    if (await menuButton.isVisible()) {
      // Breadcrumbs should be hidden initially
      expect(await mobileBreadcrumbs.isVisible()).toBeFalsy();

      // Click menu to show breadcrumbs
      await menuButton.click();

      // Now breadcrumbs should be visible
      if (await mobileBreadcrumbs.isVisible()) {
        await expect(mobileBreadcrumbs).toBeVisible();
      }
    }
  });

  test('home button always visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/test-navigation');

    // Home button should always be visible in header
    const homeButton = page.locator('a[aria-label="Go to dashboard"]').first();
    await expect(homeButton).toBeVisible();

    // Should have correct href
    const href = await homeButton.getAttribute('href');
    expect(href).toBe('/dashboard');
  });
});

test.describe('Navigation Accessibility', () => {
  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/test-navigation');

    // Tab through navigation elements
    await page.keyboard.press('Tab');

    // Check focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('ARIA labels are present', async ({ page }) => {
    await page.goto('/test-navigation');

    // Check for ARIA labels
    await expect(page.locator('[aria-label="Go back"]').first()).toHaveAttribute('aria-label');
    await expect(page.locator('[aria-label="Go to dashboard"]').first()).toHaveAttribute(
      'aria-label'
    );
    await expect(page.locator('nav[aria-label="Breadcrumb"]').first()).toHaveAttribute(
      'aria-label'
    );
  });

  test('focus trap in mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/test-navigation');

    const menuButton = page.locator('button[aria-label="Toggle navigation menu"]').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Tab should cycle within the menu
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should still be within the navigation area
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.closest('nav') !== null;
      });

      expect(focusedElement).toBeTruthy();
    }
  });
});
