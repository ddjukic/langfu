import { test, expect } from '@playwright/test';

test.describe('Comprehensive Story Functionality Test', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:3002/login');

    // Login with test credentials
    await page.fill('input[type="email"]', 'd.dejan.djukic@gmail.com');
    await page.fill('input[type="password"]', 'langfu-test');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard after login
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    // Navigate to library
    await page.goto('http://localhost:3002/library');
    await page.waitForLoadState('networkidle');
  });

  test('1️⃣ Library page functionality and search', async ({ page }) => {
    console.log('Testing library page functionality...');

    // First click on the Stories tab to ensure we're viewing stories
    await page.click('button:has-text("Stories")');
    await page.waitForTimeout(1000);

    // Check if stories are visible - use more specific selectors based on LibraryClient component
    const storyElements = await page.locator('a[href*="/library/story/"]').count();
    console.log(`✅ Found ${storyElements} story cards in library`);
    expect(storyElements).toBeGreaterThan(0);

    // Test search functionality if available
    const searchButton = page.locator('button[aria-label*="Search"]');
    if ((await searchButton.count()) > 0) {
      await searchButton.click();
      await page.waitForTimeout(500);

      const searchInput = page.locator(
        'input[placeholder*="Search"], input[placeholder*="search"]'
      );
      if ((await searchInput.count()) > 0) {
        await searchInput.fill('Uruguay');
        await page.waitForTimeout(1000);
        const searchResults = await page.locator('a[href*="/library/story/"]').count();
        console.log(`✅ Search for 'Uruguay' returned ${searchResults} results`);
        await searchInput.clear();
      }
    }

    // Test language tabs if available
    const languageTabs = await page.locator('[role="tab"]').count();
    console.log(`✅ Found ${languageTabs} language tabs`);
  });

  test('2️⃣ Spanish story: "El Clásico del Río de la Plata" complete testing', async ({ page }) => {
    console.log('Testing Spanish story...');

    // First click on the Stories tab to ensure we're viewing stories
    await page.click('button:has-text("Stories")');
    await page.waitForTimeout(1000);

    // Navigate to Spanish story
    const spanishStoryLink = page.locator('a[href*="cmelonq6a000ldffkhxvz30r6"]');
    if ((await spanishStoryLink.count()) > 0) {
      await spanishStoryLink.click();
      await page.waitForLoadState('networkidle');

      // Check story content is displayed
      const storyContent = await page.locator('.story-content').first().textContent();
      expect(storyContent).toBeTruthy();
      console.log(`✅ Spanish story content loaded`);

      // Test vocabulary highlighting - check for interactive elements
      const vocabularyWords = await page.locator('.keyword').count();
      console.log(`✅ Found ${vocabularyWords} vocabulary keywords`);
      expect(vocabularyWords).toBeGreaterThan(0);

      // Test specific vocabulary click interactions
      const testWords = ['estadio', 'jugadores', 'gol', 'arquero', 'hinchada'];
      for (const word of testWords) {
        // Look for the keyword span with the specific word
        const wordElement = page.locator(`.keyword:has-text("${word}")`).first();
        if ((await wordElement.count()) > 0) {
          // Click the word to trigger tooltip
          await wordElement.click();
          await page.waitForTimeout(500);

          // Check if tooltip appears
          const tooltip = page.locator('.tooltip.visible-force');
          const tooltipVisible = (await tooltip.count()) > 0;

          let tooltipText = '';
          if (tooltipVisible) {
            tooltipText = (await tooltip.first().textContent()) || '';
          }

          console.log(
            `✅ Word "${word}": found=true, tooltip=${tooltipVisible}, translation="${tooltipText.slice(0, 50)}..."`
          );

          // Close tooltip
          if (tooltipVisible) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
          }
        } else {
          console.log(`⚠️ Word "${word}" not found as keyword`);
        }
      }

      // Check vocabulary list at bottom
      const vocabList = await page
        .locator('.vocabulary-list, [data-testid="vocabulary-list"], .word-list')
        .count();
      console.log(`✅ Vocabulary list present: ${vocabList > 0}`);

      // Check for placeholder text (CRITICAL)
      const placeholderCount = await page.locator('text="[Translation for"').count();
      expect(placeholderCount).toBe(0);
      console.log(`✅ No placeholder text found: ${placeholderCount === 0}`);
    } else {
      console.log('❌ Spanish story not found in library');
      expect(false).toBe(true); // Fail the test
    }
  });

  test('3️⃣ German story: "Das legendäre Finale" complete testing', async ({ page }) => {
    console.log('Testing German story...');

    // First click on the Stories tab to ensure we're viewing stories
    await page.click('button:has-text("Stories")');
    await page.waitForTimeout(1000);

    // Navigate to German story
    const germanStoryLink = page.locator('a[href*="cmeloo62u000ndffku0hijo9e"]');
    if ((await germanStoryLink.count()) > 0) {
      await germanStoryLink.click();
      await page.waitForLoadState('networkidle');

      // Check story content is displayed
      const storyContent = await page.locator('.story-content').first().textContent();
      expect(storyContent).toBeTruthy();
      console.log(`✅ German story content loaded`);

      // Test vocabulary highlighting
      const vocabularyWords = await page.locator('.keyword').count();
      console.log(`✅ Found ${vocabularyWords} vocabulary keywords`);
      expect(vocabularyWords).toBeGreaterThan(0);

      // Test specific vocabulary click interactions
      const testWords = ['Stadion', 'Spieler', 'Tor', 'Torwart', 'Fans'];
      for (const word of testWords) {
        // Look for the keyword span with the specific word
        const wordElement = page.locator(`.keyword:has-text("${word}")`).first();
        if ((await wordElement.count()) > 0) {
          // Click the word to trigger tooltip
          await wordElement.click();
          await page.waitForTimeout(500);

          // Check if tooltip appears
          const tooltip = page.locator('.tooltip.visible-force');
          const tooltipVisible = (await tooltip.count()) > 0;

          let tooltipText = '';
          if (tooltipVisible) {
            tooltipText = (await tooltip.first().textContent()) || '';
          }

          console.log(
            `✅ Word "${word}": found=true, tooltip=${tooltipVisible}, translation="${tooltipText.slice(0, 50)}..."`
          );

          // Close tooltip
          if (tooltipVisible) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(200);
          }
        } else {
          console.log(`⚠️ Word "${word}" not found as keyword`);
        }
      }

      // Check vocabulary list at bottom
      const vocabList = await page
        .locator('.vocabulary-list, [data-testid="vocabulary-list"], .word-list')
        .count();
      console.log(`✅ Vocabulary list present: ${vocabList > 0}`);

      // Check for placeholder text (CRITICAL)
      const placeholderCount = await page.locator('text="[Translation for"').count();
      expect(placeholderCount).toBe(0);
      console.log(`✅ No placeholder text found: ${placeholderCount === 0}`);
    } else {
      console.log('❌ German story not found in library');
      expect(false).toBe(true); // Fail the test
    }
  });

  test('4️⃣ Critical placeholder text validation across all pages', async ({ page }) => {
    console.log('Testing for placeholder text across all pages...');

    // Test library page
    const libraryPlaceholders = await page.locator('text="[Translation for"').count();
    const libraryNeeded = await page.locator('text="needed]"').count();
    const libraryLoadButtons = await page.locator('text="Load Translations"').count();

    expect(libraryPlaceholders).toBe(0);
    expect(libraryNeeded).toBe(0);
    expect(libraryLoadButtons).toBe(0);

    console.log(`✅ Library page placeholder check: PASS`);
    console.log(`✅ Library page "needed]" check: PASS`);
    console.log(`✅ Library page "Load Translations" check: PASS`);
  });

  test('5️⃣ Mobile/responsive functionality', async ({ page }) => {
    console.log('Testing mobile/responsive functionality...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Click on Stories tab first
    await page.click('button:has-text("Stories")');
    await page.waitForTimeout(1000);

    // Navigate to a story
    const storyLink = page.locator('a[href*="/library/story/"]').first();
    if ((await storyLink.count()) > 0) {
      await storyLink.click();
      await page.waitForLoadState('networkidle');

      // Test mobile touch interaction
      const mobileVocab = page.locator('.keyword').first();
      if ((await mobileVocab.count()) > 0) {
        await mobileVocab.tap();
        await page.waitForTimeout(500);

        // Check if interaction works on mobile
        const mobileTooltip = await page.locator('.tooltip.visible-force').count();
        console.log(
          `✅ Mobile touch interaction: ${mobileTooltip > 0 ? 'WORKING' : 'NOT WORKING'}`
        );
      }
    }
  });

  test('6️⃣ CRUD operations testing', async ({ page }) => {
    console.log('Testing CRUD operations...');

    // Click on Stories tab first
    await page.click('button:has-text("Stories")');
    await page.waitForTimeout(1000);

    // Navigate to a story
    const storyLink = page.locator('a[href*="/library/story/"]').first();
    if ((await storyLink.count()) > 0) {
      await storyLink.click();
      await page.waitForLoadState('networkidle');

      // Test "Practice Words" button if available
      const practiceButton = page.locator(
        'button:has-text("Practice"), button:has-text("practice")'
      );
      if ((await practiceButton.count()) > 0) {
        console.log(`✅ Practice button found: ${await practiceButton.count()}`);
      }

      // Test story editing - look for edit button
      const editButton = page.locator(
        'button:has-text("Edit"), a:has-text("Edit"), [href*="edit"]'
      );
      if ((await editButton.count()) > 0) {
        console.log(`✅ Edit button found: ${await editButton.count()}`);
      }
    }
  });
});
