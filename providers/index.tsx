import React from 'react';
import { StorageProvider } from './StorageProvider';
import { SettingsProvider } from './SettingsProvider';

export { StorageProvider, StorageContext, WalletTransactionsStatus } from './StorageProvider';
export { SettingsProvider, SettingsContext } from './SettingsProvider';
export { useStorage } from './hooks/useStorage';
export { useSettings } from './hooks/useSettings';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders wraps the app with all necessary providers
 * Order matters: StorageProvider must come before SettingsProvider
 * because SettingsProvider uses useStorage hook
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <StorageProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </StorageProvider>
  );
};

