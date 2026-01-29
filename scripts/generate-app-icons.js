#!/usr/bin/env node

/**
 * App Icon Generator Script
 *
 * This script generates app icons for iOS and Android from a source image.
 *
 * Requirements:
 * - Node.js
 * - sharp library: npm install sharp
 *
 * Usage:
 * 1. Place your 1024x1024 app icon as public/app-icon.png
 * 2. Run: node scripts/generate-app-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for iOS
const iosIconSizes = [
  { size: 20, scales: [1, 2, 3] },    // iPhone Notification
  { size: 29, scales: [1, 2, 3] },    // iPhone Settings
  { size: 40, scales: [1, 2, 3] },    // iPhone Spotlight
  { size: 60, scales: [2, 3] },       // iPhone App
  { size: 76, scales: [1, 2] },       // iPad App
  { size: 83.5, scales: [2] },        // iPad Pro App
  { size: 1024, scales: [1] },        // App Store
];

// Icon sizes needed for Android
const androidIconSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Adaptive icon sizes for Android
const androidAdaptiveSizes = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

async function generateIcons() {
  console.log('🌙 MiniRamadan App Icon Generator');
  console.log('==================================\n');

  // Check for sharp
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('❌ Sharp library not found. Installing...');
    console.log('Run: npm install sharp');
    console.log('\nAlternatively, you can use an online tool like:');
    console.log('- https://appicon.co/');
    console.log('- https://makeappicon.com/');
    console.log('\nUpload your 1024x1024 icon and download the generated assets.');
    return;
  }

  const sourceIcon = path.join(process.cwd(), 'public', 'app-icon.png');

  if (!fs.existsSync(sourceIcon)) {
    console.log('❌ Source icon not found at: public/app-icon.png');
    console.log('\nPlease create a 1024x1024 PNG icon and save it as public/app-icon.png');
    console.log('\nIcon design tips:');
    console.log('- Use the MiniRamadan branding (amber/yellow gradient)');
    console.log('- Include the crescent moon icon');
    console.log('- Keep it simple and recognizable');
    console.log('- Test visibility at small sizes (29px)');
    return;
  }

  // iOS output directory
  const iosOutputDir = path.join(
    process.cwd(),
    'ios',
    'App',
    'App',
    'Assets.xcassets',
    'AppIcon.appiconset'
  );

  // Android output directory
  const androidOutputDir = path.join(
    process.cwd(),
    'android',
    'app',
    'src',
    'main',
    'res'
  );

  // Create directories if they don't exist
  if (!fs.existsSync(iosOutputDir)) {
    fs.mkdirSync(iosOutputDir, { recursive: true });
    console.log('✅ Created iOS icon directory');
  }

  // Generate iOS icons
  console.log('\n📱 Generating iOS icons...');
  const contentsJson = {
    images: [],
    info: {
      author: 'xcode',
      version: 1
    }
  };

  for (const icon of iosIconSizes) {
    for (const scale of icon.scales) {
      const pixelSize = Math.round(icon.size * scale);
      const filename = `Icon-${icon.size}x${icon.size}@${scale}x.png`;
      const outputPath = path.join(iosOutputDir, filename);

      await sharp(sourceIcon)
        .resize(pixelSize, pixelSize)
        .png()
        .toFile(outputPath);

      contentsJson.images.push({
        filename,
        idiom: icon.size >= 76 ? 'ipad' : 'iphone',
        scale: `${scale}x`,
        size: `${icon.size}x${icon.size}`
      });

      console.log(`  ✓ ${filename} (${pixelSize}x${pixelSize})`);
    }
  }

  // Add App Store icon
  contentsJson.images.push({
    filename: 'Icon-1024x1024@1x.png',
    idiom: 'ios-marketing',
    scale: '1x',
    size: '1024x1024'
  });

  // Write Contents.json for iOS
  fs.writeFileSync(
    path.join(iosOutputDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('  ✓ Contents.json');

  // Generate Android icons
  console.log('\n🤖 Generating Android icons...');

  for (const icon of androidIconSizes) {
    const folderPath = path.join(androidOutputDir, icon.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const outputPath = path.join(folderPath, 'ic_launcher.png');
    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);

    console.log(`  ✓ ${icon.folder}/ic_launcher.png (${icon.size}x${icon.size})`);

    // Also create round icon
    const roundOutputPath = path.join(folderPath, 'ic_launcher_round.png');
    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .png()
      .toFile(roundOutputPath);

    console.log(`  ✓ ${icon.folder}/ic_launcher_round.png (${icon.size}x${icon.size})`);
  }

  // Generate adaptive icons (foreground)
  console.log('\n🎨 Generating Android adaptive icons...');

  for (const icon of androidAdaptiveSizes) {
    const folderPath = path.join(androidOutputDir, icon.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const outputPath = path.join(folderPath, 'ic_launcher_foreground.png');

    // For adaptive icons, the icon should be centered in a larger canvas
    // The safe zone is 66% of the total size
    const safeSize = Math.round(icon.size * 0.66);
    const padding = Math.round((icon.size - safeSize) / 2);

    await sharp(sourceIcon)
      .resize(safeSize, safeSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    console.log(`  ✓ ${icon.folder}/ic_launcher_foreground.png (${icon.size}x${icon.size})`);
  }

  console.log('\n✨ Icon generation complete!');
  console.log('\nNext steps:');
  console.log('1. Open ios/App/App.xcworkspace in Xcode');
  console.log('2. Open android/app in Android Studio');
  console.log('3. Build and test the icons on devices');
}

// Run the generator
generateIcons().catch(console.error);
