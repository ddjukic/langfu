const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBrowserFunctionality() {
  let browser;
  try {
    console.log('=== BROWSER FUNCTIONALITY TEST ===\n');
    console.log('Starting browser...');

    browser = await puppeteer.launch({
      headless: false, // Set to true if you want headless mode
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', (msg) => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER ERROR:', err.message));

    console.log('✅ Browser started successfully');

    // Test 1: Navigate to library page (should redirect to login)
    console.log('\n--- Test 1: Navigation to Library ---');
    await page.goto('http://localhost:3001/library', { waitUntil: 'networkidle2' });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to login page');

      // Test 2: Login with test credentials
      console.log('\n--- Test 2: Login Process ---');

      // Fill login form
      await page.waitForSelector('input[name="email"], input[type="email"]');
      await page.type('input[name="email"], input[type="email"]', 'd.dejan.djukic@gmail.com');
      await page.type('input[name="password"], input[type="password"]', 'langfu-test');

      console.log('✅ Filled login credentials');

      // Submit login
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]'),
      ]);

      const postLoginUrl = page.url();
      console.log(`Post-login URL: ${postLoginUrl}`);

      if (postLoginUrl.includes('/dashboard') || postLoginUrl.includes('/library')) {
        console.log('✅ Login successful');

        // Test 3: Navigate to Library
        console.log('\n--- Test 3: Library Page Access ---');
        if (!postLoginUrl.includes('/library')) {
          await page.goto('http://localhost:3001/library', { waitUntil: 'networkidle2' });
        }

        // Check if stories are displayed
        await page.waitForSelector('button', { timeout: 5000 });

        // Check for tab buttons
        const storyTabExists = (await page.$('button:has-text("Stories")')) !== null;
        const wordTabExists = (await page.$('button:has-text("Words")')) !== null;

        console.log(`Stories tab exists: ${storyTabExists}`);
        console.log(`Words tab exists: ${wordTabExists}`);

        if (storyTabExists) {
          // Click on Stories tab
          await page.click('button:has-text("Stories")');
          console.log('✅ Clicked Stories tab');

          // Wait for stories to load
          await page.waitForTimeout(1000);

          // Check for story items
          const storyLinks = await page.$$eval('a[href*="/library/story/"]', (links) =>
            links.map((link) => ({
              href: link.href,
              title: link.textContent?.trim(),
            }))
          );

          console.log(`Found ${storyLinks.length} story links:`);
          storyLinks.forEach((link, i) => {
            console.log(`  ${i + 1}. ${link.title} - ${link.href}`);
          });

          if (storyLinks.length > 0) {
            // Test 4: Test individual story - Use our target Spanish story
            console.log('\n--- Test 4: Individual Story Testing ---');
            const targetStoryUrl = 'http://localhost:3001/library/story/cmelonq6a000ldffkhxvz30r6';
            console.log(`Testing Spanish story: ${targetStoryUrl}`);

            await page.goto(targetStoryUrl, { waitUntil: 'networkidle2' });

            // Wait for content to load
            await page.waitForSelector('.story-content, .prose', { timeout: 5000 });

            // Check if vocabulary words are highlighted
            const keywordElements = await page.$$('.keyword');
            console.log(`Found ${keywordElements.length} highlighted keywords`);

            if (keywordElements.length > 0) {
              console.log('✅ Vocabulary words are highlighted!');

              // Test tooltip functionality
              console.log('\n--- Test 5: Tooltip Functionality ---');

              // Click on first keyword
              const firstKeyword = keywordElements[0];
              const keywordText = await firstKeyword.evaluate((el) => el.textContent);
              console.log(`Testing tooltip for word: "${keywordText}"`);

              await firstKeyword.click();
              await page.waitForTimeout(500); // Wait for tooltip animation

              // Check if tooltip appeared
              const tooltipExists = (await page.$('.tooltip.visible-force')) !== null;
              console.log(`Tooltip appeared: ${tooltipExists}`);

              if (tooltipExists) {
                const tooltipContent = await page.$eval(
                  '.tooltip.visible-force',
                  (el) => el.textContent
                );
                console.log(`Tooltip content: "${tooltipContent}"`);

                if (
                  tooltipContent.includes('[Translation for') &&
                  tooltipContent.includes('needed]')
                ) {
                  console.log('❌ CRITICAL ISSUE: Tooltip shows placeholder translation');
                } else {
                  console.log('✅ Tooltip shows actual translation');
                }
              } else {
                console.log('❌ Tooltip failed to appear');
              }
            } else {
              console.log('❌ CRITICAL ISSUE: No vocabulary words are highlighted');

              // Debug: Check story content
              const storyContentExists = (await page.$('.story-content')) !== null;
              const proseContentExists = (await page.$('.prose')) !== null;
              console.log(`Story content div exists: ${storyContentExists}`);
              console.log(`Prose content div exists: ${proseContentExists}`);

              // Get raw content to debug
              if (storyContentExists) {
                const htmlContent = await page.$eval('.story-content', (el) => el.innerHTML);
                console.log('HTML content preview:', htmlContent.substring(0, 200) + '...');
              }
            }

            // Test 6: Practice button functionality
            console.log('\n--- Test 6: Practice Button ---');
            const practiceButtonExists = (await page.$('button:has-text("Practice")')) !== null;
            console.log(`Practice button exists: ${practiceButtonExists}`);

            if (practiceButtonExists) {
              const practiceButtonDisabled = await page.$eval(
                'button:has-text("Practice")',
                (el) => el.disabled
              );
              console.log(`Practice button disabled: ${practiceButtonDisabled}`);

              if (keywordElements.length === 0 && practiceButtonDisabled) {
                console.log('✅ Practice button correctly disabled when no vocabulary');
              } else if (keywordElements.length > 0 && !practiceButtonDisabled) {
                console.log('✅ Practice button enabled with vocabulary');
              }
            }
          } else {
            console.log('❌ No stories found on library page');
          }

          // Test 7: Search functionality
          console.log('\n--- Test 7: Search Functionality ---');
          await page.goto('http://localhost:3001/library', { waitUntil: 'networkidle2' });

          // Open search filters
          const searchButtonExists =
            (await page.$('button[aria-label*="Search"], button:has-text("Search")')) !== null;
          if (searchButtonExists) {
            await page.click('button[aria-label*="Search"], button:has-text("Search")');
            console.log('✅ Opened search filters');

            // Wait for search input
            await page.waitForSelector('input[placeholder*="Search"]', { timeout: 2000 });

            // Search for "Uruguay"
            await page.type('input[placeholder*="Search"]', 'Uruguay');
            await page.waitForTimeout(1000); // Wait for search debounce

            // Check results
            const searchResults = await page.$$eval(
              'a[href*="/library/story/"]',
              (links) => links.length
            );
            console.log(`Search results for "Uruguay": ${searchResults} stories`);

            if (searchResults > 0) {
              console.log('✅ Search functionality working');
            } else {
              console.log('❌ Search functionality may not be working');
            }
          } else {
            console.log('❌ Search button not found');
          }
        } else {
          console.log('❌ Stories tab not found on library page');
        }
      } else {
        console.log('❌ Login failed - still on login page');
      }
    } else {
      console.log('❌ Did not redirect to login page as expected');
    }

    console.log('\n=== TEST SUMMARY ===');
    console.log('Check the console output above for detailed results');
  } catch (error) {
    console.error('Browser test error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
    await prisma.$disconnect();
  }
}

// Check if puppeteer is available
try {
  testBrowserFunctionality();
} catch (error) {
  console.log('Puppeteer not available. Installing...');
  console.log('Run: npm install puppeteer');
  console.log('Then run this script again.');
}
