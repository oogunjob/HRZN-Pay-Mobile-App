import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon sf="creditcard.fill" drawable="ic_home" />
        <Label>{''}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pay">
        <Icon sf="bitcoinsign" drawable="ic_explore" />
        <Label>{''}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
