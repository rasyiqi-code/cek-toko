export const API_CONFIG = {
  // Production URL: https://cek-toko.vercel.app
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://cek-toko.vercel.app',
  IS_NATIVE: typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || window.location.protocol === 'tauri:'),
};

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If we are in a normal browser, use relative paths to avoid CORS issues
  // unless we are in a native wrapper (Capacitor/Tauri)
  if (typeof window !== 'undefined' && !API_CONFIG.IS_NATIVE) {
    return cleanPath;
  }
  
  return `${API_CONFIG.BASE_URL}${cleanPath}`;
};
