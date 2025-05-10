export const APP_NAME = 'EchoMind 2.1';
export const APP_DESCRIPTION = 'Magic Photo Gallery with Voice Control';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'video/*': ['.mp4', '.webm', '.mov']
};

export const MAGIC_TRICK_DURATION = 3000; // 3 seconds
export const IMAGE_PREVIEW_DURATION = 2000; // 2 seconds

export const STORAGE_KEYS = {
  PROJECTS: 'echomind_projects',
  MEDIA_ITEMS: 'echomind_media_items',
};

export const THEME = {
  colors: {
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    background: {
      light: '#1E293B',
      DEFAULT: '#0F172A',
      dark: '#020617',
    },
    text: {
      light: '#F8FAFC',
      DEFAULT: '#E2E8F0',
      dark: '#94A3B8',
    },
  },
  gradients: {
    background: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900',
    text: 'bg-gradient-to-r from-pink-500 to-violet-500',
  },
  animations: {
    duration: {
      fast: 0.2,
      normal: 0.3,
      slow: 0.5,
    },
    easing: {
      easeInOut: [0.4, 0, 0.2, 1],
      easeOut: [0, 0, 0.2, 1],
      easeIn: [0.4, 0, 1, 1],
    },
  },
}; 