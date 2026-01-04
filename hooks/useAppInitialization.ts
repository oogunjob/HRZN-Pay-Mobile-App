import { useEffect, useState } from 'react';
import { useStorage } from '@/providers';
import { initCurrencyDaemon } from '@/blue_modules/currency';
import * as BlueElectrum from '@/blue_modules/BlueElectrum';

export const useAppInitialization = () => {
  const { walletsInitialized, setWalletsInitialized, startAndDecrypt, isStorageEncrypted } = useStorage();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true);
        setInitializationError(null);

        // Step 1: Initialize currency daemon (fetch exchange rates)
        console.log('[AppInit] Initializing currency daemon...');
        try {
          await initCurrencyDaemon();
          console.log('[AppInit] Currency daemon initialized');
        } catch (error: any) {
          console.warn('[AppInit] Currency daemon initialization failed:', error?.message || error);
          // Don't block app launch if currency fails
        }

        // Step 2: Check if storage is encrypted and unlock wallets
        console.log('[AppInit] Checking wallet storage...');
        try {
          const encrypted = await isStorageEncrypted();
          
          if (encrypted) {
            console.log('[AppInit] Storage is encrypted, will require unlock');
            // For now, we'll set walletsInitialized to false so unlock screen can show
            // In a full implementation, you'd show an unlock screen here
            setWalletsInitialized(false);
          } else {
            // No encryption, try to unlock directly
            console.log('[AppInit] Storage not encrypted, attempting to unlock...');
            try {
              const success = await startAndDecrypt();
              if (success) {
                console.log('[AppInit] Wallets unlocked successfully');
                setWalletsInitialized(true);
              } else {
                console.log('[AppInit] Failed to unlock wallets');
                setWalletsInitialized(false);
              }
            } catch (decryptError: any) {
              console.error('[AppInit] Error during decrypt:', decryptError?.message || decryptError);
              setWalletsInitialized(false);
            }
          }
        } catch (storageError: any) {
          console.error('[AppInit] Error checking storage:', storageError?.message || storageError);
          setWalletsInitialized(false);
        }

        // Step 3: Connect to Electrum (will be handled by SettingsProvider when walletsInitialized changes)
        console.log('[AppInit] Initialization complete');
      } catch (error: any) {
        console.error('[AppInit] Initialization error:', error?.message || error);
        setInitializationError(error?.message || 'Failed to initialize app');
        // Still allow app to proceed even if initialization fails
        setWalletsInitialized(false);
      } finally {
        setIsInitializing(false);
      }
    };

    // Wrap in try-catch to handle any synchronous errors
    try {
      initializeApp().catch((error: any) => {
        console.error('[AppInit] Unhandled promise rejection:', error?.message || error);
        setInitializationError(error?.message || 'Failed to initialize app');
        setWalletsInitialized(false);
        setIsInitializing(false);
      });
    } catch (error: any) {
      console.error('[AppInit] Synchronous error in initializeApp:', error?.message || error);
      setInitializationError(error?.message || 'Failed to initialize app');
      setWalletsInitialized(false);
      setIsInitializing(false);
    }
  }, []); // Only run once on mount

  return {
    isInitializing,
    initializationError,
    walletsInitialized,
  };
};
