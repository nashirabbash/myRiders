import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "myRiders",
  slug: "myRiders",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myriders",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  owner: "shirrrr",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.myriders.app",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY ?? "",
    },
  },

  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.myriders.app",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY ?? "",
      },
    },
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    [
      "expo-dev-client",
      {
        launchMode: "most-recent",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission:
          "Allow $(PRODUCT_NAME) to access your microphone.",
        enableBackgroundPlayback: true,
        enableBackgroundRecording: false,
      },
    ],
    "expo-asset",
    "expo-background-task",
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: true,
        barcodeScannerEnabled: true,
      },
    ],
    "expo-document-picker",
    [
      "expo-file-system",
      {
        supportsOpeningDocumentsInPlace: true,
        enableFileSharing: true,
      },
    ],
    "expo-font",
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
    "expo-localization",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow $(PRODUCT_NAME) to use your location.",
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
    "expo-media-library",
    [
      "expo-notifications",
      {
        color: "#ffffff",
        defaultChannel: "default",
        enableBackgroundRemoteNotifications: false,
      },
    ],
    "expo-screen-orientation",
    [
      "expo-sensors",
      {
        motionPermission: "Allow $(PRODUCT_NAME) to access your device motion",
      },
    ],
    [
      "expo-sqlite",
      {
        enableFTS: false,
        useSQLCipher: false,
        ios: {
          customBuildFlags: [
            "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
          ],
        },
      },
    ],
    "expo-system-ui",
    "expo-task-manager",
    "expo-tracking-transparency",
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    "expo-web-browser",
    [
      "expo-widgets",
      {
        widgets: [
          {
            name: "MyWidget",
            displayName: "My Widget",
            description: "A sample home screen widget",
            supportedFamilies: ["systemSmall", "systemMedium", "systemLarge"],
          },
        ],
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
  extra: {
    eas: {
      projectId: "f2875c38-a076-4d23-80e0-1bcdf3f3ffd2",
    },
    config: {
      devInfo: {
        stylingPrinciples: false,
      },
    },
  },
});
