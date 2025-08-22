const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRegex() {
  try {
    console.log('=== REGEX DEBUG ===\n');

    const story = await prisma.story.findUnique({
      where: { id: 'cmelonq6a000ldffkhxvz30r6' },
      select: { title: true, content: true, keywords: true },
    });

    console.log('Testing word boundary regex patterns:\n');

    const testWord = 'estadio';
    const content = story.content;

    console.log(`Test word: "${testWord}"`);
    console.log(`Full content: ${content}\n`);

    // Test different regex patterns
    const patterns = [
      { name: 'Simple \\\\b boundary', regex: new RegExp('\\\\b' + testWord + '\\\\b', 'gi') },
      {
        name: 'Word boundary escaped',
        regex: new RegExp(
          '\\\\b' + testWord.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\b',
          'gi'
        ),
      },
      {
        name: 'Unicode word boundary',
        regex: new RegExp('(^|\\\\s)' + testWord + '(\\\\s|$)', 'gi'),
      },
      { name: 'Case insensitive', regex: new RegExp('\\\\b' + testWord + '\\\\b', 'i') },
      { name: 'Global match', regex: new RegExp(testWord, 'g') },
      { name: 'Simple test', regex: new RegExp(testWord, 'i') },
    ];

    patterns.forEach((pattern) => {
      const matches = content.match(pattern.regex);
      const testResult = pattern.regex.test(content);

      console.log(`${pattern.name}:`);
      console.log(`  Regex: ${pattern.regex}`);
      console.log(`  Test result: ${testResult}`);
      console.log(`  Matches: ${matches ? matches.length : 0}`);
      if (matches) {
        console.log(`  First match: "${matches[0]}"`);
      }
      console.log();

      // Reset regex lastIndex
      pattern.regex.lastIndex = 0;
    });

    // Test the actual highlighting logic from the component
    console.log('=== COMPONENT LOGIC SIMULATION ===\n');

    const createInteractiveContent = (content, keywords) => {
      if (!content || keywords.length === 0) return content;

      // Sort keywords by length (longest first) to avoid partial replacements
      const sortedKeywords = [...keywords].sort(
        (a, b) => (b.l2?.length || 0) - (a.l2?.length || 0)
      );

      let processedContent = content;
      const replacements = [];

      sortedKeywords.slice(0, 5).forEach((keyword, index) => {
        // Skip keywords without l2 property
        if (!keyword.l2) return;

        console.log(`Processing keyword ${index + 1}: "${keyword.l2}"`);

        // Create a unique placeholder to avoid double replacements
        const placeholder = `[[KEYWORD_${index}]]`;

        // Escape special regex characters in the keyword
        const escapedKeyword = keyword.l2.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        console.log(`  Escaped: "${escapedKeyword}"`);

        // Match whole words only, case-insensitive
        const regex = new RegExp(`\\\\b${escapedKeyword}\\\\b`, 'gi');
        console.log(`  Regex: ${regex}`);

        // Check if the word exists in the content
        const testResult = regex.test(processedContent);
        console.log(`  Test result: ${testResult}`);

        if (testResult) {
          // Reset regex lastIndex after test
          regex.lastIndex = 0;

          const matches = processedContent.match(regex);
          console.log(`  Matches found: ${matches ? matches.length : 0}`);

          // Replace with placeholder first
          processedContent = processedContent.replace(regex, placeholder);

          // Store the replacement HTML
          replacements.push({
            original: placeholder,
            replacement: `<span class="keyword">${keyword.l2}</span>`,
          });

          console.log(`  ✅ Will be highlighted`);
        } else {
          console.log(`  ❌ No matches found`);
        }
        console.log();
      });

      // Apply all replacements
      replacements.forEach(({ original, replacement }) => {
        processedContent = processedContent.split(original).join(replacement);
      });

      return processedContent;
    };

    const vocabulary = story.keywords;
    const result = createInteractiveContent(story.content, vocabulary);

    console.log('Final result preview:');
    console.log(result.substring(0, 300) + '...');

    const highlightedWords = (result.match(/<span class="keyword">/g) || []).length;
    console.log(`\nHighlighted words in result: ${highlightedWords}`);
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRegex();
