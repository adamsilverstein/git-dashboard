import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { ConfigProvider } from './src/context/ConfigContext';
import { BadgeProvider, useBadge } from './src/context/BadgeContext';
import { TokenSetupScreen } from './src/screens/TokenSetupScreen';
import { PRListScreen } from './src/screens/PRListScreen';
import { PRDetailScreen } from './src/screens/PRDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { DashboardStackParamList, RootTabParamList } from './src/navigation/types';

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0d1117',
    card: '#161b22',
    text: '#e6edf3',
    border: '#21262d',
    primary: '#58a6ff',
  },
};

function DashboardNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#161b22' },
        headerTintColor: '#e6edf3',
        headerTitleStyle: { fontSize: 16 },
      }}
    >
      <DashboardStack.Screen
        name="PRList"
        component={PRListScreen}
        options={{ title: 'Pull Requests' }}
      />
      <DashboardStack.Screen
        name="PRDetail"
        component={PRDetailScreen}
        options={{ title: 'Details' }}
      />
    </DashboardStack.Navigator>
  );
}

function MainApp() {
  const { token, loading } = useApp();
  const { unseenCount } = useBadge();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (!token) {
    return (
      <NavigationContainer theme={navTheme}>
        <TokenSetupScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#161b22', borderTopColor: '#21262d' },
          tabBarActiveTintColor: '#58a6ff',
          tabBarInactiveTintColor: '#484f58',
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardNavigator}
          options={{
            tabBarLabel: 'PRs',
            tabBarBadge: unseenCount > 0 ? unseenCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#58a6ff', fontSize: 10 },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#161b22' },
            headerTintColor: '#e6edf3',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ConfigProvider>
        <BadgeProvider>
          <MainApp />
        </BadgeProvider>
      </ConfigProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
});
