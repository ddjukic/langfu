const { chromium } = require('playwright');

async function testStoryFunctionality() {
  console.log('🚀 Starting comprehensive story functionality test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Test 1: Navigate and login
    console.log('1️⃣ Testing login and navigation...');
    await page.goto('http://localhost:3002/library');

    // Should redirect to login
    await page.waitForURL(/login/);
    console.log('✅ Redirected to login as expected');

    // Login with test credentials
    await page.fill('input[type="email"]', 'd.dejan.djukic@gmail.com');
    await page.fill('input[type="password"]', 'langfu-test');
    await page.click('button[type="submit"]');

    // Wait for redirect to library
    await page.waitForURL(/library/, { timeout: 10000 });
    console.log('✅ Successfully logged in and navigated to library\n');

    // Test 2: Library page functionality
    console.log('2️⃣ Testing library page functionality...');

    // Check if stories are visible
    const storyElements = await page.locator('[data-testid*="story-card"]').count();
    console.log(`✅ Found ${storyElements} story cards in library`);

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('Uruguay');
      await page.waitForTimeout(1000);
      const searchResults = await page.locator('[data-testid*="story-card"]').count();
      console.log(`✅ Search for 'Uruguay' returned ${searchResults} results`);
      await searchInput.clear();
    }

    // Test language tabs
    const languageTabs = await page.locator('[role="tab"]').count();
    console.log(`✅ Found ${languageTabs} language tabs\n`);

    // Test 3: Spanish Story Testing
    console.log('3️⃣ Testing Spanish story: "El Clásico del Río de la Plata"...');

    // Navigate to Spanish story
    const spanishStoryLink = page.locator('a[href*="cmelonq6a000ldffkhxvz30r6"]');
    if ((await spanishStoryLink.count()) > 0) {
      await spanishStoryLink.click();
      await page.waitForLoadState('networkidle');

      // Check story content is displayed
      const storyContent = await page
        .locator('.story-content, [data-testid="story-content"]')
        .count();
      console.log(`✅ Spanish story content loaded: ${storyContent > 0}`);

      // Test vocabulary highlighting
      const vocabularyWords = await page
        .locator('button[data-testid*="vocab-word"], .vocab-word, button:has-text("estadio")')
        .count();
      console.log(`✅ Found ${vocabularyWords} interactive vocabulary words`);

      // Test specific vocabulary hover interactions
      const testWords = ['estadio', 'jugadores', 'gol', 'arquero', 'hinchada'];
      for (const word of testWords) {
        const wordElement = page.locator(`button:has-text("${word}")`).first();
        if ((await wordElement.count()) > 0) {
          await wordElement.hover();
          await page.waitForTimeout(500);

          // Check if tooltip appears
          const tooltip = await page
            .locator('.tooltip, [role="tooltip"], .translation-popup')
            .count();
          console.log(`✅ Word "${word}": tooltip visible: ${tooltip > 0}`);

          // Get tooltip text if visible
          if (tooltip > 0) {
            const tooltipText = await page
              .locator('.tooltip, [role="tooltip"], .translation-popup')
              .first()
              .textContent();
            console.log(`   Translation: "${tooltipText}"`);
          }
        }
      }

      // Check vocabulary list at bottom
      const vocabList = await page
        .locator('.vocabulary-list, [data-testid="vocabulary-list"]')
        .count();
      console.log(`✅ Vocabulary list present: ${vocabList > 0}`);

      console.log('');
    } else {
      console.log('❌ Spanish story not found in library');
    }

    // Test 4: German Story Testing
    console.log('4️⃣ Testing German story: "Das legendäre Finale"...');

    // Navigate back to library
    await page.goto('http://localhost:3002/library');
    await page.waitForLoadState('networkidle');

    // Navigate to German story
    const germanStoryLink = page.locator('a[href*="cmeloo62u000ndffku0hijo9e"]');
    if ((await germanStoryLink.count()) > 0) {
      await germanStoryLink.click();
      await page.waitForLoadState('networkidle');

      // Check story content is displayed
      const storyContent = await page
        .locator('.story-content, [data-testid="story-content"]')
        .count();
      console.log(`✅ German story content loaded: ${storyContent > 0}`);

      // Test vocabulary highlighting
      const vocabularyWords = await page
        .locator('button[data-testid*="vocab-word"], .vocab-word, button:has-text("Stadion")')
        .count();
      console.log(`✅ Found ${vocabularyWords} interactive vocabulary words`);

      // Test specific vocabulary hover interactions
      const testWords = ['Stadion', 'Spieler', 'Tor', 'Torwart', 'Fans'];
      for (const word of testWords) {
        const wordElement = page.locator(`button:has-text("${word}")`).first();
        if ((await wordElement.count()) > 0) {
          await wordElement.hover();
          await page.waitForTimeout(500);

          // Check if tooltip appears
          const tooltip = await page
            .locator('.tooltip, [role="tooltip"], .translation-popup')
            .count();
          console.log(`✅ Word "${word}": tooltip visible: ${tooltip > 0}`);

          // Get tooltip text if visible
          if (tooltip > 0) {
            const tooltipText = await page
              .locator('.tooltip, [role="tooltip"], .translation-popup')
              .first()
              .textContent();
            console.log(`   Translation: "${tooltipText}"`);
          }
        }
      }

      // Check vocabulary list at bottom
      const vocabList = await page
        .locator('.vocabulary-list, [data-testid="vocabulary-list"]')
        .count();
      console.log(`✅ Vocabulary list present: ${vocabList > 0}`);

      console.log('');
    } else {
      console.log('❌ German story not found in library');
    }

    // Test 5: Check for placeholder text (CRITICAL)
    console.log('5️⃣ Checking for placeholder text (CRITICAL TEST)...');

    const placeholderText = await page.locator('text="[Translation for"').count();
    const needsTranslation = await page.locator('text="needed]"').count();
    const loadTranslations = await page.locator('text="Load Translations"').count();

    console.log(
      `✅ Placeholder text check: ${placeholderText === 0 ? 'PASS' : 'FAIL'} (found ${placeholderText})`
    );
    console.log(
      `✅ "needed]" text check: ${needsTranslation === 0 ? 'PASS' : 'FAIL'} (found ${needsTranslation})`
    );
    console.log(
      `✅ "Load Translations" button check: ${loadTranslations === 0 ? 'PASS' : 'FAIL'} (found ${loadTranslations})`
    );

    // Test 6: Mobile/Responsive Testing
    console.log('\n6️⃣ Testing mobile/responsive functionality...');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileVocab = await page
      .locator('button[data-testid*="vocab-word"], .vocab-word')
      .first();
    if ((await mobileVocab.count()) > 0) {
      await mobileVocab.tap();
      await page.waitForTimeout(500);
      const mobileTooltip = await page.locator('.tooltip, [role="tooltip"]').count();
      console.log(`✅ Mobile touch interaction: ${mobileTooltip > 0 ? 'WORKING' : 'NOT WORKING'}`);
    }

    console.log('\n🎉 COMPREHENSIVE TEST COMPLETED!\n');

    // Keep browser open for manual inspection
    console.log('Browser will remain open for manual inspection...');
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testStoryFunctionality().catch(console.error);
