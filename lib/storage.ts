"use client"

import * as React from "react"

const PREFIX = "tinverse_";

export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const fullKey = PREFIX + key;
      console.log('Storage: Getting item', {
        key: fullKey,
        timestamp: new Date().toISOString()
      });
      
      const item = localStorage.getItem(fullKey);
      if (!item || item === 'undefined') {
        console.log('Storage: No item found', {
          key: fullKey,
          timestamp: new Date().toISOString()
        });
        return defaultValue ?? null;
      }

      const parsed = JSON.parse(item);
      console.log('Storage: Retrieved item', {
        key: fullKey,
        hasValue: !!parsed,
        timestamp: new Date().toISOString()
      });
      return parsed;
    } catch (error) {
      console.error('Storage: Error getting item', {
        key: PREFIX + key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      const fullKey = PREFIX + key;
      console.log('Storage: Setting item', {
        key: fullKey,
        hasValue: !!value,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
      console.error('Storage: Error setting item', {
        key: PREFIX + key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  remove: (key: string): void => {
    try {
      const fullKey = PREFIX + key;
      console.log('Storage: Removing item', {
        key: fullKey,
        timestamp: new Date().toISOString()
      });
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('Storage: Error removing item', {
        key: PREFIX + key,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  },

  clear: (): void => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

export const createStorageHook = <T>(key: string, initialValue: T) => {
  const useStorage = () => {
    const [value, setValue] = React.useState<T>(() => {
      return storage.get(key, initialValue) ?? initialValue;
    });

    React.useEffect(() => {
      storage.set(key, value);
    }, [key, value]);

    return [value, setValue] as const;
  };

  return useStorage;
};
