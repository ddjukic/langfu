const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateScreenshots() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Mobile screenshot 1 - Home screen
  const mobileScreenshot1 = await sharp({
    create: {
      width: 375,
      height: 812,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // Dark background
    },
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="375" height="812">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect x="20" y="100" width="335" height="200" rx="20" fill="url(#grad1)" />
            <text x="187" y="180" font-family="system-ui" font-size="48" fill="white" text-anchor="middle" font-weight="bold">LangFu</text>
            <text x="187" y="220" font-family="system-ui" font-size="16" fill="white" text-anchor="middle">Learn Languages Faster</text>
            
            <rect x="20" y="340" width="160" height="100" rx="12" fill="#1e293b" />
            <text x="100" y="380" font-family="system-ui" font-size="14" fill="white" text-anchor="middle">German</text>
            <text x="100" y="410" font-family="system-ui" font-size="24" fill="#3b82f6" text-anchor="middle" font-weight="bold">156</text>
            <text x="100" y="430" font-family="system-ui" font-size="12" fill="#94a3b8" text-anchor="middle">words learned</text>
            
            <rect x="195" y="340" width="160" height="100" rx="12" fill="#1e293b" />
            <text x="275" y="380" font-family="system-ui" font-size="14" fill="white" text-anchor="middle">Spanish</text>
            <text x="275" y="410" font-family="system-ui" font-size="24" fill="#8b5cf6" text-anchor="middle" font-weight="bold">89</text>
            <text x="275" y="430" font-family="system-ui" font-size="12" fill="#94a3b8" text-anchor="middle">words learned</text>
            
            <rect x="20" y="460" width="335" height="60" rx="12" fill="#3b82f6" />
            <text x="187" y="495" font-family="system-ui" font-size="18" fill="white" text-anchor="middle" font-weight="600">Start Learning</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile-1.png'));

  // Mobile screenshot 2 - Learning session
  const mobileScreenshot2 = await sharp({
    create: {
      width: 375,
      height: 812,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="375" height="812">
            <rect x="0" y="0" width="375" height="60" fill="#1e293b" />
            <text x="187" y="40" font-family="system-ui" font-size="18" fill="white" text-anchor="middle" font-weight="600">Matching Game</text>
            
            <text x="187" y="120" font-family="system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">Match the German word with its meaning</text>
            
            <rect x="40" y="160" width="140" height="80" rx="12" fill="#3b82f6" />
            <text x="110" y="205" font-family="system-ui" font-size="20" fill="white" text-anchor="middle" font-weight="600">Haus</text>
            
            <rect x="195" y="160" width="140" height="80" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
            <text x="265" y="205" font-family="system-ui" font-size="20" fill="white" text-anchor="middle">Tree</text>
            
            <rect x="40" y="260" width="140" height="80" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
            <text x="110" y="305" font-family="system-ui" font-size="20" fill="white" text-anchor="middle">House</text>
            
            <rect x="195" y="260" width="140" height="80" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2" />
            <text x="265" y="305" font-family="system-ui" font-size="20" fill="white" text-anchor="middle">Car</text>
            
            <rect x="20" y="700" width="335" height="8" rx="4" fill="#1e293b" />
            <rect x="20" y="700" width="200" height="8" rx="4" fill="#10b981" />
            <text x="187" y="680" font-family="system-ui" font-size="14" fill="#94a3b8" text-anchor="middle">Score: 8/10</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'screenshot-mobile-2.png'));

  // Desktop screenshot - Dashboard
  const desktopScreenshot = await sharp({
    create: {
      width: 1920,
      height: 1080,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 },
    },
  })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1920" height="1080">
            <rect x="0" y="0" width="1920" height="80" fill="#1e293b" />
            <text x="100" y="50" font-family="system-ui" font-size="32" fill="white" font-weight="bold">LangFu</text>
            <text x="1720" y="50" font-family="system-ui" font-size="18" fill="#94a3b8" text-anchor="end">Welcome back, User!</text>
            
            <rect x="100" y="140" width="400" height="250" rx="20" fill="#1e293b" />
            <text x="300" y="190" font-family="system-ui" font-size="24" fill="white" text-anchor="middle" font-weight="600">Learning Progress</text>
            <text x="300" y="250" font-family="system-ui" font-size="48" fill="#3b82f6" text-anchor="middle" font-weight="bold">245</text>
            <text x="300" y="290" font-family="system-ui" font-size="18" fill="#94a3b8" text-anchor="middle">Total Words Learned</text>
            <text x="300" y="340" font-family="system-ui" font-size="16" fill="#10b981" text-anchor="middle">15 day streak!</text>
            
            <rect x="540" y="140" width="400" height="250" rx="20" fill="#1e293b" />
            <text x="740" y="190" font-family="system-ui" font-size="24" fill="white" text-anchor="middle" font-weight="600">Today's Goal</text>
            <rect x="590" y="240" width="300" height="20" rx="10" fill="#374151" />
            <rect x="590" y="240" width="210" height="20" rx="10" fill="#8b5cf6" />
            <text x="740" y="290" font-family="system-ui" font-size="18" fill="#94a3b8" text-anchor="middle">7 / 10 words</text>
            
            <rect x="980" y="140" width="400" height="250" rx="20" fill="#1e293b" />
            <text x="1180" y="190" font-family="system-ui" font-size="24" fill="white" text-anchor="middle" font-weight="600">Review Due</text>
            <text x="1180" y="250" font-family="system-ui" font-size="48" fill="#f59e0b" text-anchor="middle" font-weight="bold">23</text>
            <text x="1180" y="290" font-family="system-ui" font-size="18" fill="#94a3b8" text-anchor="middle">Words to review</text>
            
            <rect x="1420" y="140" width="400" height="250" rx="20" fill="url(#grad2)" />
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
              </linearGradient>
            </defs>
            <text x="1620" y="250" font-family="system-ui" font-size="28" fill="white" text-anchor="middle" font-weight="bold">Start New Session</text>
            <text x="1620" y="290" font-family="system-ui" font-size="16" fill="white" text-anchor="middle">Continue your learning journey</text>
          </svg>
        `),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'screenshot-desktop-1.png'));

  console.log('✅ Screenshots generated successfully!');
}

generateScreenshots().catch(console.error);
