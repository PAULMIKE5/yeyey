// types/telegram.d.ts

interface TelegramWebAppUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  // Add other fields from Telegram.WebAppUser if needed
}

interface TelegramWebAppInitData {
  user?: TelegramWebAppUser;
  // Add other fields from Telegram.WebAppInitData if needed
}

interface TelegramWebApp {
  ready: () => void;
  initDataUnsafe?: TelegramWebAppInitData;
  // Add other methods/properties of Telegram.WebApp if you use them
  // For example:
  // version: string;
  // platform: string;
  // themeParams: Record<string, string>;
  // close: () => void;
  // sendData: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Export an empty object to make this file a module
// This is sometimes needed for `declare global` to work correctly in all setups
export {};
