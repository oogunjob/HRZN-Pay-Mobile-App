import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="creditcard.fill" drawable="ic_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pay">
        <Icon sf="bitcoinsign.circle.fill" drawable="ic_explore" />
        <Label>Pay</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="transactions">
        <Icon sf="list.bullet" drawable="ic_explore" />
        <Label>Transactions</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
