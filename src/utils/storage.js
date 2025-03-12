// Local storage keys
const STORAGE_KEYS = {
    READ_NEWS: 'readNews',
    SAVED_NEWS: 'savedNews',
    PREFERENCES: 'preferences',
    SENTIMENT_ORDER: 'sentimentOrder'
  };
  
  export const loadUserPreferences = (userId) => {
    try {
      const readNews = new Set(JSON.parse(localStorage.getItem(`${userId}_${STORAGE_KEYS.READ_NEWS}`) || '[]'));
      const savedNews = new Set(JSON.parse(localStorage.getItem(`${userId}_${STORAGE_KEYS.SAVED_NEWS}`) || '[]'));
      const preferences = JSON.parse(localStorage.getItem(`${userId}_${STORAGE_KEYS.PREFERENCES}`) || '[]');
      const sentimentOrder = localStorage.getItem(`${userId}_${STORAGE_KEYS.SENTIMENT_ORDER}`) || 'all';
  
      return {
        readNews,
        savedNews,
        preferences,
        sentimentOrder
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {
        readNews: new Set(),
        savedNews: new Set(),
        preferences: [],
        sentimentOrder: 'all'
      };
    }
  };
  
  export const saveUserPreferences = (userId, { readNews, savedNews, preferences, sentimentOrder }) => {
    try {
      localStorage.setItem(`${userId}_${STORAGE_KEYS.READ_NEWS}`, JSON.stringify(Array.from(readNews)));
      localStorage.setItem(`${userId}_${STORAGE_KEYS.SAVED_NEWS}`, JSON.stringify(Array.from(savedNews)));
      localStorage.setItem(`${userId}_${STORAGE_KEYS.PREFERENCES}`, JSON.stringify(preferences));
      localStorage.setItem(`${userId}_${STORAGE_KEYS.SENTIMENT_ORDER}`, sentimentOrder);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };
  