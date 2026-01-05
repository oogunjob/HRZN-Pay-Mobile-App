import { useContext } from 'react';
import { SettingsContext } from '../SettingsProvider';

export const useSettings = () => useContext(SettingsContext);

