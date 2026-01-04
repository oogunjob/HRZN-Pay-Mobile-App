import { useEffect } from 'react';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export const AppInitializer: React.FC = () => {
  let initializationResult;
  
  try {
    initializationResult = useAppInitialization();
  } catch (error) {
    console.error('[AppInitializer] Error in useAppInitialization hook:', error);
    // Return null to prevent crash
    return null;
  }

  const { isInitializing, initializationError } = initializationResult;

  useEffect(() => {
    if (initializationError) {
      console.error('[AppInitializer] Error during initialization:', initializationError);
    }
  }, [initializationError]);

  // This component doesn't render anything, it just runs the initialization
  return null;
};
