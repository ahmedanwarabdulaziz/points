export default {
  expo: {
    name: 'Points Redeem',
    slug: 'points-redeem-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#274290',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.pointsredeem.app',
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan QR codes for customer identification and registration.',
        NSPhotoLibraryUsageDescription: 'This app needs access to your photos to select profile pictures and reward images.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#274290',
      },
      package: 'com.pointsredeem.app',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera for QR code scanning.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#f27921',
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '1b3483fb-d924-4cf2-99d1-a37a3c16838b',
      },
    },
    updates: {
      url: 'https://u.expo.dev/1b3483fb-d924-4cf2-99d1-a37a3c16838b',
      fallbackToCacheTimeout: 0,
      enabled: true,
      checkAutomatically: 'ON_LOAD',
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
};


