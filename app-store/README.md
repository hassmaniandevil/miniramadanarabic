# MiniRamadan App Store Assets

This directory contains all the assets and metadata needed for iOS App Store and Google Play Store submissions.

## Directory Structure

```
app-store/
├── README.md           # This file
├── metadata.json       # App metadata (descriptions, keywords, etc.)
├── screenshots/        # Store screenshots (create this folder)
│   ├── ios/
│   │   ├── 6.5-inch/   # iPhone 14 Pro Max, 15 Pro Max
│   │   ├── 5.5-inch/   # iPhone 8 Plus
│   │   └── ipad/       # iPad Pro
│   └── android/
│       ├── phone/
│       └── tablet/
└── icons/              # Generated app icons
```

## Quick Start

### 1. Generate App Icons

First, create your 1024x1024 app icon and save it as `public/app-icon.png`.

Then run:
```bash
npm install sharp  # If not already installed
node scripts/generate-app-icons.js
```

This will generate all required icon sizes for iOS and Android.

### 2. Take Screenshots

Screenshots should showcase the app's best features:

1. **Family Dashboard** - Show the daily activities and star counter
2. **Wonder Card** - Display a daily fact with Arabic word
3. **Kindness Mission** - Show a mission being completed
4. **Family Sky** - The constellation view with stars
5. **Photo Memories** - The memory gallery
6. **Time Capsule** - The message composer

#### iOS Screenshot Sizes
- **6.5 inch** (iPhone 14/15 Pro Max): 1290 × 2796 px
- **5.5 inch** (iPhone 8 Plus): 1242 × 2208 px
- **iPad Pro 12.9"**: 2048 × 2732 px

#### Android Screenshot Sizes
- **Phone**: 1080 × 1920 px minimum
- **Tablet 7"**: 1200 × 1920 px
- **Tablet 10"**: 1920 × 1200 px

### 3. Build for iOS

```bash
# Sync web app to iOS
npm run cap:sync

# Open in Xcode
npm run cap:ios

# In Xcode:
# 1. Select your team in Signing & Capabilities
# 2. Update the Bundle Identifier if needed
# 3. Archive the app: Product > Archive
# 4. Distribute to App Store Connect
```

### 4. Build for Android

```bash
# Sync web app to Android
npm run cap:sync

# Open in Android Studio
npm run cap:android

# In Android Studio:
# 1. Build > Generate Signed Bundle / APK
# 2. Create a new keystore or use existing
# 3. Build the Android App Bundle (.aab)
# 4. Upload to Google Play Console
```

## iOS App Store Checklist

- [ ] App icon (1024×1024)
- [ ] Screenshots for all device sizes
- [ ] App name (30 characters max)
- [ ] Subtitle (30 characters max)
- [ ] Description
- [ ] Keywords (100 characters max)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] In-app purchases configured
- [ ] App Review Information

## Google Play Store Checklist

- [ ] App icon (512×512)
- [ ] Feature graphic (1024×500)
- [ ] Screenshots (minimum 2, up to 8)
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] App category
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Target audience and content
- [ ] App signing configured

## Metadata Reference

See `metadata.json` for all app store metadata including:
- App descriptions (short and full)
- Keywords
- Categories
- Pricing
- Release notes
- Store-specific settings

## Testing

Before submitting:

1. Test on real iOS and Android devices
2. Test offline functionality
3. Test in-app purchases in sandbox mode
4. Test all features with different profile types
5. Check accessibility features
6. Verify privacy policy and terms links work

## Support

For questions about the submission process:
- iOS: [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- Android: [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
