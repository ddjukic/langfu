const puppeteer = require('puppeteer');

async function testStory() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  try {
    const page = await browser.newPage();

    console.log('🚀 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    console.log('🔐 Logging in...');
    await page.type('input[name="email"]', 'd.dejan.djukic@gmail.com');
    await page.type('input[name="password"]', 'langfu-test');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');

    console.log('📖 Navigating to Spanish story...');
    await page.goto('http://localhost:3000/library/story/cmelonq6a000ldffkhxvz30r6');
    await page.waitForSelector('.story-content', { timeout: 10000 });

    console.log('🔍 Checking for keyword elements...');
    const keywordElements = await page.$$('.keyword');
    console.log(`Found ${keywordElements.length} keyword elements`);

    const storyHTML = await page.$eval('.story-content', (el) => el.innerHTML);
    console.log('Story content HTML (first 500 chars):');
    console.log(storyHTML.substring(0, 500));

    console.log('📷 Taking screenshot...');
    await page.screenshot({ path: 'story-debug.png', fullPage: true });

    // Check console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('❌ Console error:', msg.text());
      }
    });

    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testStory().catch(console.error);
