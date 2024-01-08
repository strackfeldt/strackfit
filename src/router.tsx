import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import { useCurrentWorkout } from "./components/workout-store";
import { useCurrentUser } from "./lib/api";
import { HomeScreen } from "./screens/home-screen";
import { LoginScreen } from "./screens/login-screen";
import { SettingsScreen } from "./screens/settings-screen";
import { WorkoutScreenWrapper } from "./screens/workout-screen";

const Tabs = createBottomTabNavigator();

function HomeStack() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export function AuthedRouter() {
  const user = useCurrentUser();
  const scheme = useColorScheme();
  const currentWorkout = useCurrentWorkout();

  if (!user) {
    return <LoginScreen />;
  }

  if (currentWorkout) {
    return <WorkoutScreenWrapper />;
  }

  return (
    <NavigationContainer
      theme={
        scheme === "dark"
          ? {
              ...DarkTheme,
              colors: {
                ...DarkTheme.colors,
                card: "#000",
              },
            }
          : DefaultTheme
      }
    >
      <StatusBar style="auto" />

      <HomeStack />
    </NavigationContainer>
  );
}
