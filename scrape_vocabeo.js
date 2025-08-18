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
    
    // Wait for the main content to load
    console.log('⏳ Waiting for main content...');
    await page.waitForSelector('main', { timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let allWords = [];
    let previousCount = 0;
    let stagnantRounds = 0;
    const maxStagnantRounds = 50;
    
    console.log('📊 Starting extraction with virtual scrolling...');
    
    // First, try to click the "Scroll list to bottom" button
    try {
      console.log('🔘 Looking for scroll button...');
      await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (let button of buttons) {
          if (button.textContent && button.textContent.trim() === 'Scroll list to bottom') {
            button.click();
            return true;
          }
        }
        return false;
      });
      console.log('✅ Clicked scroll button, waiting for content...');
      await new Promise(resolve => setTimeout(resolve, 8000)); // Wait longer for all content
    } catch (e) {
      console.log('ℹ️ Scroll button approach failed, using manual scrolling...');
    }
    
    while (stagnantRounds < maxStagnantRounds) {
      // Extract words using the exact structure from the page snapshot
      const currentWords = await page.evaluate(() => {
        const words = [];
        
        // Target the main vocabulary container based on the snapshot structure
        const mainContainer = document.querySelector('main');
        if (!mainContainer) {
          return [];
        }
        
        // Look for all vocabulary entry elements - they have 6 children: German, English, Level, Frequency, ✓, •
        const allElements = mainContainer.querySelectorAll('*');
        
        for (let element of allElements) {
          if (element.children && element.children.length === 6) {
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
        console.log(`🔄 No progress (${stagnantRounds}/${maxStagnantRounds}), scrolling within #list...`);
      } else {
        previousCount = allWords.length;
        stagnantRounds = 0;
      }
      
      // CRITICAL: Scroll to trigger loading more vocabulary
      await page.evaluate((rounds) => {
        // Strategy 1: Scroll the main container
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
          mainContainer.scrollTop += 1000;
          if (rounds > 15) {
            mainContainer.scrollTop = mainContainer.scrollHeight;
          }
        }
        
        // Strategy 2: Scroll the entire window
        window.scrollBy(0, 800);
        
        // Strategy 3: Scroll to the very bottom
        if (rounds > 10) {
          window.scrollTo(0, document.body.scrollHeight);
        }
        
      }, stagnantRounds);
      
      // Wait for new content to load
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Try to find and click scroll button every few rounds
      if (stagnantRounds % 5 === 0 && stagnantRounds > 0) {
        try {
          await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (let button of buttons) {
              if (button.textContent && button.textContent.includes('Scroll list to bottom')) {
                button.click();
                return true;
              }
            }
            return false;
          });
          await new Promise(resolve => setTimeout(resolve, 4000));
        } catch (e) {
          // Button interaction failed
        }
      }
      
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
