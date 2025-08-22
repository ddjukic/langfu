const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// Maskable icons (with safe area padding)
const maskableIconSizes = [
  { size: 192, name: 'icon-192x192-maskable.png' },
  { size: 512, name: 'icon-512x512-maskable.png' },
];

// Apple touch icons
const appleIconSizes = [
  { size: 120, name: 'apple-icon-120x120.png' },
  { size: 152, name: 'apple-icon-152x152.png' },
  { size: 167, name: 'apple-icon-167x167.png' },
  { size: 180, name: 'apple-icon-180x180.png' },
];

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');

  try {
    const svgBuffer = await fs.readFile(svgPath);

    // Generate regular icons
    console.log('Generating regular icons...');
    for (const { size, name } of iconSizes) {
      await sharp(svgBuffer).resize(size, size).png().toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name}`);
    }

    // Generate maskable icons with safe area (10% padding)
    console.log('\nGenerating maskable icons...');
    for (const { size, name } of maskableIconSizes) {
      const padding = Math.floor(size * 0.1);
      const innerSize = size - padding * 2;

      // Create a canvas with padding
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 59, g: 130, b: 246, alpha: 1 }, // Blue background
        },
      })
        .composite([
          {
            input: await sharp(svgBuffer).resize(innerSize, innerSize).toBuffer(),
            left: padding,
            top: padding,
          },
        ])
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name}`);
    }

    // Generate Apple touch icons
    console.log('\nGenerating Apple touch icons...');
    for (const { size, name } of appleIconSizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png({ quality: 100 })
        .toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name}`);
    }

    // Generate favicon.ico (multi-resolution)
    console.log('\nGenerating favicon...');
    await sharp(svgBuffer).resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    await sharp(svgBuffer).resize(16, 16).toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✓ Generated favicon-16x16.png');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
