import { useEffect } from 'react';
import { storageService } from '../services/storageService';

export const useSettingsInitialization = () => {
  useEffect(() => {
    // Migrate old settings if needed (only runs once)
    storageService.migrateOldSettings();
  }, []);

  // Utility methods for settings management
  const resetAllSettings = () => {
    return storageService.resetSettings();
  };

  const getCurrentSettings = () => {
    return storageService.getSettings();
  };

  return {
    resetAllSettings,
    getCurrentSettings,
  };
};
