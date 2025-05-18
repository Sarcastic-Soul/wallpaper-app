import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Wallpaper',
  slug: 'wallpaper',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'wallpaper',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.wallpaper',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    package: 'com.yourcompany.wallpaper',
    permissions: [
      'WRITE_EXTERNAL_STORAGE',
      'READ_EXTERNAL_STORAGE',
      'SET_WALLPAPER',
    ],
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    androidClientId: process.env.ANDROID_CLIENT_ID,
    iosClientId: process.env.IOS_CLIENT_ID,
    webClientId: process.env.WEB_CLIENT_ID,
  },
  plugins: [
    'expo-router',
    "expo-secure-store",
    [
      'expo-media-library',
      {
        photosPermission: 'Allow Wallpaper to access your photos.',
        savePhotosPermission: 'Allow Wallpaper to save photos.',
      },
    ],
  ],
});