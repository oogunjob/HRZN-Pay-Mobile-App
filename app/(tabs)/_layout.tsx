import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" drawable="ic_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf="paperplane.fill" drawable="ic_explore" />
        <Label>Explore</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
