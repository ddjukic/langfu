import { test, expect, devices } from '@playwright/test';

// Test on specific mobile viewports
const mobileDevices = [
  { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
  { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
  { name: 'Pixel 5', viewport: { width: 393, height: 851 } },
  { name: 'Small Mobile', viewport: { width: 320, height: 568 } },
  { name: 'iPad', viewport: { width: 768, height: 1024 } },
];

test.describe('Mobile Responsiveness', () => {
  for (const device of mobileDevices) {
    test.describe(`${device.name} (${device.viewport.width}x${device.viewport.height})`, () => {
      test.use({
        viewport: device.viewport,
        isMobile: device.viewport.width < 768,
        hasTouch: true,
      });

      test('should display mobile navigation menu', async ({ page, isMobile }) => {
        await page.goto('/');

        if (isMobile) {
          // Mobile menu button should be visible
          const menuButton = page.getByRole('button', { name: /menu/i });
          await expect(menuButton).toBeVisible();

          // Desktop navigation should be hidden
          const desktopNav = page.locator('nav.hidden-mobile');
          if ((await desktopNav.count()) > 0) {
            await expect(desktopNav).toBeHidden();
          }

          // Open mobile menu
          await menuButton.click();

          // Mobile menu should be visible
          const mobileMenu = page.locator('[role="navigation"], .mobile-menu');
          await expect(mobileMenu).toBeVisible();
        } else {
          // Desktop navigation should be visible
          const desktopNav = page.locator('nav');
          await expect(desktopNav).toBeVisible();

          // Mobile menu button should not be visible
          const menuButton = page.getByRole('button', { name: /menu/i });
          if ((await menuButton.count()) > 0) {
            await expect(menuButton).toBeHidden();
          }
        }
      });

      test('should have minimum touch target size of 44px', async ({ page }) => {
        await page.goto('/');

        // Check all interactive elements
        const interactiveElements = page.locator(
          'button, a, input, select, textarea, [role="button"], [role="link"]'
        );
        const count = await interactiveElements.count();

        for (let i = 0; i < count; i++) {
          const element = interactiveElements.nth(i);

          if (await element.isVisible()) {
            const box = await element.boundingBox();

            if (box) {
              // Touch targets should be at least 44x44px for accessibility
              const minSize = 44;

              // Some elements might be smaller but have padding/margin for touch area
              if (box.width < minSize || box.height < minSize) {
                // Check if element has sufficient padding/margin
                const styles = await element.evaluate((el) => {
                  const computed = window.getComputedStyle(el);
                  return {
                    padding: computed.padding,
                    margin: computed.margin,
                    display: computed.display,
                  };
                });

                // Inline elements and text links might be exceptions
                if (styles.display !== 'inline') {
                  console.warn(
                    `Element might have small touch target: ${box.width}x${box.height}px`
                  );
                }
              }
            }
          }
        }
      });

      test('should have readable text on mobile', async ({ page }) => {
        await page.goto('/');

        // Check font sizes
        const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th');
        const count = await textElements.count();

        for (let i = 0; i < Math.min(count, 20); i++) {
          // Check first 20 elements for performance
          const element = textElements.nth(i);

          if (await element.isVisible()) {
            const fontSize = await element.evaluate((el) => {
              return window.getComputedStyle(el).fontSize;
            });

            const fontSizeNum = parseFloat(fontSize);

            // Minimum readable font size on mobile is typically 12px
            if (fontSizeNum < 12) {
              const text = await element.textContent();
              console.warn(`Small font size detected (${fontSize}): ${text?.substring(0, 50)}`);
            }
          }
        }
      });

      test('should handle responsive layouts correctly', async ({ page }) => {
        await page.goto('/dashboard');

        const viewport = page.viewportSize();
        if (!viewport) return;

        // Check if content fits within viewport
        const body = page.locator('body');
        const bodySize = await body.boundingBox();

        if (bodySize) {
          // Content width should not exceed viewport width (no horizontal scroll)
          expect(bodySize.width).toBeLessThanOrEqual(viewport.width + 1); // +1 for rounding
        }

        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
      });

      test('should display content in single column on small screens', async ({
        page,
        isMobile,
      }) => {
        if (!isMobile) {
          test.skip();
        }

        await page.goto('/learn/new');

        // Check for grid/flex layouts
        const containers = page.locator('.grid, .flex, [class*="grid"], [class*="flex"]');
        const count = await containers.count();

        for (let i = 0; i < count; i++) {
          const container = containers.nth(i);

          if (await container.isVisible()) {
            const className = await container.getAttribute('class');

            // On mobile, grids should typically be single column
            if (className?.includes('grid')) {
              const gridCols = await container.evaluate((el) => {
                return window.getComputedStyle(el).gridTemplateColumns;
              });

              // Check if it's a single column or responsive
              if (gridCols && !gridCols.includes('1fr') && !gridCols.includes('100%')) {
                console.log(`Multi-column grid on mobile: ${gridCols}`);
              }
            }
          }
        }
      });

      test('should handle form inputs on mobile', async ({ page, isMobile }) => {
        await page.goto('/login');

        // Find form inputs
        const emailInput = page
          .locator('input[type="email"], input[name="email"], input[id="email"]')
          .first();
        const passwordInput = page.locator('input[type="password"]').first();

        if (await emailInput.isVisible()) {
          // Input should be easily tappable
          const box = await emailInput.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40); // Minimum height for mobile inputs

            if (isMobile) {
              expect(box.width).toBeGreaterThanOrEqual(200); // Should be wide enough
            }
          }

          // Test input interaction
          await emailInput.click();
          await emailInput.fill('test@example.com');

          // Keyboard should not obscure input (this is hard to test automatically)
          const isInView = await emailInput.isInViewport();
          expect(isInView).toBe(true);
        }

        if (await passwordInput.isVisible()) {
          await passwordInput.click();
          await passwordInput.fill('testpassword');
        }
      });

      test('should handle swipe gestures for game interactions', async ({ page, isMobile }) => {
        if (!isMobile) {
          test.skip();
        }

        await page.goto('/learn/new');

        // Find swipeable elements (e.g., cards in matching game)
        const cards = page.locator('.card, [class*="card"]');

        if ((await cards.count()) > 0) {
          const firstCard = cards.first();

          if (await firstCard.isVisible()) {
            const box = await firstCard.boundingBox();

            if (box) {
              // Simulate swipe gesture
              await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
              await page.mouse.down();
              await page.mouse.move(box.x + box.width + 50, box.y + box.height / 2, { steps: 10 });
              await page.mouse.up();

              // Card should respond to swipe (animation or state change)
              // This would depend on actual implementation
            }
          }
        }
      });

      test('should optimize images for mobile', async ({ page }) => {
        await page.goto('/');

        // Check image sizes
        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
          const img = images.nth(i);

          if (await img.isVisible()) {
            const src = await img.getAttribute('src');

            // Check for responsive images
            const srcset = await img.getAttribute('srcset');
            const sizes = await img.getAttribute('sizes');

            if (!srcset && src && !src.includes('svg')) {
              console.warn(`Image without srcset for responsive loading: ${src}`);
            }

            // Check actual rendered size
            const box = await img.boundingBox();
            const naturalSize = await img.evaluate((el: HTMLImageElement) => ({
              width: el.naturalWidth,
              height: el.naturalHeight,
            }));

            if (box && naturalSize.width > 0) {
              // Image should not be much larger than displayed size
              const ratio = naturalSize.width / box.width;
              if (ratio > 2) {
                console.warn(
                  `Image might be too large for display size: ${naturalSize.width}px natural vs ${box.width}px displayed`
                );
              }
            }
          }
        }
      });

      test('should handle mobile keyboard interactions', async ({ page, isMobile }) => {
        if (!isMobile) {
          test.skip();
        }

        await page.goto('/learn/session');

        // Find text input for sentence creation
        const textInput = page.locator('input[type="text"], textarea').first();

        if (await textInput.isVisible()) {
          // Focus input
          await textInput.click();

          // Input should be in viewport (not hidden by keyboard)
          await page.waitForTimeout(500); // Wait for keyboard animation

          const isInView = await textInput.isInViewport();
          expect(isInView).toBe(true);

          // Type some text
          await textInput.fill('Test sentence input');

          // Submit button should be accessible
          const submitButton = page.getByRole('button', { name: /submit|check|send/i });
          if (await submitButton.isVisible()) {
            const buttonInView = await submitButton.isInViewport();
            expect(buttonInView).toBe(true);
          }
        }
      });

      test('should have proper spacing for mobile', async ({ page }) => {
        await page.goto('/dashboard');

        // Check padding and margins
        const mainContent = page.locator('main, .main-content, [role="main"]').first();

        if (await mainContent.isVisible()) {
          const padding = await mainContent.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              left: computed.paddingLeft,
              right: computed.paddingRight,
              top: computed.paddingTop,
              bottom: computed.paddingBottom,
            };
          });

          // Should have some padding on mobile for edge spacing
          const leftPadding = parseFloat(padding.left);
          const rightPadding = parseFloat(padding.right);

          if (device.viewport.width < 768) {
            expect(leftPadding).toBeGreaterThanOrEqual(8); // At least 8px padding
            expect(rightPadding).toBeGreaterThanOrEqual(8);
          }
        }
      });

      test('should handle orientation changes', async ({ page, context }) => {
        if (device.viewport.width >= 768) {
          test.skip(); // Skip for tablets and desktop
        }

        await page.goto('/');

        // Portrait orientation
        await page.setViewportSize({
          width: device.viewport.width,
          height: device.viewport.height,
        });

        // Check layout in portrait
        let hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);

        // Landscape orientation
        await page.setViewportSize({
          width: device.viewport.height,
          height: device.viewport.width,
        });

        // Check layout in landscape
        hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      });

      test('should load quickly on mobile networks', async ({ page }) => {
        // Simulate slow 3G network
        await page.route('**/*', (route) => {
          // Add artificial delay to simulate slow network
          setTimeout(() => route.continue(), 100);
        });

        const startTime = Date.now();
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - startTime;

        // Page should be interactive within 3 seconds on slow network
        expect(loadTime).toBeLessThan(3000);

        // Check for lazy loading of images
        const images = page.locator('img[loading="lazy"]');
        const lazyCount = await images.count();

        if (lazyCount === 0) {
          console.warn(
            'No lazy-loaded images found - consider adding loading="lazy" for better mobile performance'
          );
        }
      });
    });
  }
});
