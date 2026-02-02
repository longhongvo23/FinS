import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.smarttrade.app',
    appName: 'SmartTrade',
    webDir: 'dist',
    server: {
        // Uncomment for live reload during development
        // url: 'http://192.168.1.x:5173',
        // cleartext: true,
        androidScheme: 'https',
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#ffffff',
            androidScaleType: 'CENTER_CROP',
            showSpinner: false,
        },
        StatusBar: {
            style: 'dark',
            backgroundColor: '#ffffff',
        },
    },
    android: {
        allowMixedContent: true,
        captureInput: true,
        webContentsDebuggingEnabled: true,
    },
    ios: {
        contentInset: 'automatic',
        preferredContentMode: 'mobile',
    },
};

export default config;
