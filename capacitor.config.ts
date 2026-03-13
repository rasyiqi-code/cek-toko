import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cektoko.app',
  appName: 'Cek Toko',
  webDir: 'out',
  server: {
    // url: 'http://10.19.13.235:3000', // Gunakan IP lokal untuk testing offline di WiFi
    androidScheme: 'https',
    url: 'https://cek-toko.vercel.app',
    cleartext: true
  }
};

export default config;
