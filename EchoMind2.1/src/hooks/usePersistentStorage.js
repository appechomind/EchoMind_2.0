import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';

export function usePersistentStorage(key, initialValue) {
  const storageKey = STORAGE_KEYS[key];

  // Initialize state with value from localStorage or initialValue
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${storageKey}):`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${storageKey}):`, error);
      // If storage is full, try to clear old data
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        clearOldData();
      }
    }
  }, [storageKey, value]);

  const clearOldData = useCallback(() => {
    try {
      // Clear data older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (Array.isArray(value)) {
        const filteredValue = value.filter(item => 
          item.updatedAt && item.updatedAt > thirtyDaysAgo
        );
        setValue(filteredValue);
      }
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }, [value]);

  const clearStorage = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
      setValue(initialValue);
    } catch (error) {
      console.error(`Error clearing localStorage (${storageKey}):`, error);
    }
  }, [storageKey, initialValue]);

  return [value, setValue, clearStorage];
} 