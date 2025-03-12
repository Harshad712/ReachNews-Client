// Local storage keys
const STORAGE_KEYS = {
    READ_NEWS: 'readNews',
    SAVED_NEWS: 'savedNews',
    PREFERENCES: 'preferences',
    SENTIMENT_ORDER: 'sentimentOrder'
  };
  
  export const loadUserPreferences = (userId) => {
    try {
      const data = localStorage.getItem(`user_preferences_${userId}`);
      if (data) {
        const preferences = JSON.parse(data);
        return {
          readNews: new Set(preferences.readNews || []),
          savedNews: new Set(preferences.savedNews || []),
          preferences: preferences.preferences || [],
          displayMode: preferences.displayMode || 'all'
        };
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    return {
      readNews: new Set(),
      savedNews: new Set(),
      preferences: [],
      displayMode: 'all'
    };
  };
  
  export const saveUserPreferences = (userId, data) => {
    try {
      const preferences = {
        readNews: Array.from(data.readNews),
        savedNews: Array.from(data.savedNews),
        preferences: data.preferences,
        displayMode: data.displayMode
      };
      localStorage.setItem(`user_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };