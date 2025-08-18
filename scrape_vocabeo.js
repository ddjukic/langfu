#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeVocabeo() {
  console.log('🚀 Scraping ALL 6,108 words from vocabeo.com...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📄 Navigating to vocabeo.com/browse...');
    await page.goto('https://vocabeo.com/browse', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for list container (#list) which wraps the internal rows container (#list_height)
    console.log('⏳ Waiting for list containers (#list and inner #list_height)...');
    await page.waitForSelector('#list', { timeout: 15000 });
    // inner may render shortly after
    await page.waitForTimeout?.(500);
    
    let allWords = [];
    let previousCount = 0;
    let stagnantRounds = 0;
    const maxStagnantRounds = 50;
    
    console.log('📊 Starting extraction from #list/#list_height...');
    
    // Helper to try to click the "Scroll list to bottom" button that appears under the list
    async function tryClickScrollButton() {
      try {
        const clicked = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => (b.textContent||'').includes('Scroll list to bottom'));
          if (btn) { btn.click(); return true; }
          return false;
        });
        if (clicked) {
          console.log('✅ Clicked "Scroll list to bottom"');
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch {}
    }

    // Conservative container scroll: only a few attempts until child count stops growing
    let lastCount = await page.evaluate(() => {
      const outer = document.querySelector('#list');
      const inner = outer && (outer.querySelector('#list_height') || outer.querySelector('[data-testid="virtual_list"]'));
      return inner ? inner.children.length : (outer ? outer.children.length : 0);
    });
    for (let attempt = 0; attempt < 6; attempt++) {
      await tryClickScrollButton();
      await page.evaluate(() => {
        const outer = document.querySelector('#list');
        const inner = outer && (outer.querySelector('#list_height') || outer.querySelector('[data-testid="virtual_list"]'));
        const scroller = inner || outer;
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      });
      await new Promise(r => setTimeout(r, 800));
      const now = await page.evaluate(() => {
        const outer = document.querySelector('#list');
        const inner = outer && (outer.querySelector('#list_height') || outer.querySelector('[data-testid="virtual_list"]'));
        return inner ? inner.children.length : (outer ? outer.children.length : 0);
      });
      if (now > lastCount) {
        console.log(`⬇️ Rows loaded: ${lastCount} -> ${now}`);
        lastCount = now;
        attempt = Math.max(-1, attempt - 1);
      }
    }
    
    while (stagnantRounds < 6) {
      // Extract words using the exact structure from the page snapshot
      const currentWords = await page.evaluate(() => {
        const words = [];
        
        // Target the main vocabulary container based on the snapshot structure
        const outer = document.querySelector('#list');
        const mainContainer = outer && (outer.querySelector('#list_height') || outer.querySelector('[data-testid="virtual_list"]') || outer);
        if (!mainContainer) {
          return [];
        }
        
        // Each direct child under this container is a row with: German, English, Level, Frequency, ✓, •
        const allElements = Array.from(mainContainer.children);
        
        for (let element of allElements) {
          if (element.children && element.children.length >= 4) {
            const germanEl = element.children[0];
            const englishEl = element.children[1];
            const levelEl = element.children[2];
            const frequencyEl = element.children[3];
            
            const german = germanEl?.textContent?.trim();
            const english = englishEl?.textContent?.trim();
            const level = levelEl?.textContent?.trim();
            const frequency = frequencyEl?.textContent?.trim();
            
            // Validate vocabulary entry pattern
            if (german && english && level && frequency &&
                level.match(/^[ABC][12]$/) &&
                frequency.match(/^\d+$/) &&
                german.length > 0 && german.length < 100 &&
                english.length > 0 && english.length < 300 &&
                !german.includes('Test mode') && !german.includes('Sign in') &&
                !german.includes('Know this') && !german.includes('Learn this')) {
              
              // Clean German word
              const cleanGerman = german
                .replace(/,\s*(der|die|das)$/, '')
                .replace(/\s*-\s*\d+\.?$/, '')
                .trim();
              
              if (cleanGerman.length > 0) {
                words.push({
                  german: cleanGerman,
                  english: english,
                  level: level,
                  frequency: parseInt(frequency)
                });
              }
            }
          }
        }
        
        return words;
      });
      
      // Add unique words
      let newWordsCount = 0;
      currentWords.forEach(word => {
        const exists = allWords.some(existing => 
          existing.german === word.german && 
          existing.english === word.english &&
          existing.level === word.level
        );
        if (!exists) {
          allWords.push(word);
          newWordsCount++;
        }
      });
      
      console.log(`📈 Total: ${allWords.length} words (+${newWordsCount} new)`);
      
      // Check for progress
      if (allWords.length === previousCount) {
        stagnantRounds++;
        console.log(`🔄 No progress (${stagnantRounds}/6), sending End key and wheel...`);
        try { await page.keyboard.press('End'); await new Promise(r=>setTimeout(r,400)); await page.mouse.wheel({deltaY:1200}); } catch {}
      } else {
        previousCount = allWords.length;
        stagnantRounds = 0;
      }
      
      // Small wait
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Break if we've found the target amount
      if (allWords.length >= 6100) {
        console.log('🎯 Reached target of 6100+ words!');
        break;
      }
    }
    
    console.log(`\n✅ Extraction complete! Found ${allWords.length} words.`);
    
    // Organize by level and save
    const byLevel = {
      A1: allWords.filter(w => w.level === 'A1'),
      A2: allWords.filter(w => w.level === 'A2'),
      B1: allWords.filter(w => w.level === 'B1'),
      B2: allWords.filter(w => w.level === 'B2'),
      C1: allWords.filter(w => w.level === 'C1'),
      C2: allWords.filter(w => w.level === 'C2')
    };
    
    // Sort by frequency within each level
    Object.keys(byLevel).forEach(level => {
      byLevel[level].sort((a, b) => b.frequency - a.frequency);
    });
    
    console.log('\n📊 Final Statistics by Level:');
    let total = 0;
    Object.keys(byLevel).forEach(level => {
      const count = byLevel[level].length;
      total += count;
      console.log(`  ${level}: ${count} words`);
    });
    console.log(`  📈 Total: ${total} words`);
    
    // Save the data
    fs.writeFileSync('vocabeo_scraped.json', JSON.stringify(allWords, null, 2));
    fs.writeFileSync('vocabeo_by_level.json', JSON.stringify(byLevel, null, 2));
    
    console.log('\n💾 Data saved to:');
    console.log('  📄 vocabeo_scraped.json - All scraped words');
    console.log('  📄 vocabeo_by_level.json - Organized by CEFR level');
    
    return allWords.length;
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    return 0;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeVocabeo().then(count => {
  console.log(`\n🎉 Scraping session complete! Extracted ${count} words total.`);
});
