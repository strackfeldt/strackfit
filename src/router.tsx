import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, SafeAreaView, Text, TouchableOpacity, useColorScheme } from "react-native";
import { useTimer } from "./components/use-timer";
import { useCancelWorkout, useCurrentWorkout, useFinishWorkout } from "./data/hooks";
import { HistoryScreen } from "./screens/history-screen";
import { HomeScreen } from "./screens/home-screen";
import { LoginScreen } from "./screens/login-screen";
import { SettingsScreen } from "./screens/settings-screen";
import { StatsScreen } from "./screens/stats-screen";
import { WorkoutScreen } from "./screens/workout-screen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function WorkoutStack() {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();
  const { mutate: cancelWorkout } = useCancelWorkout();
  const { mutate: finishWorkout } = useFinishWorkout();

  if (!currentWorkout || isLoading) return null;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={"Workout"}
        component={WorkoutScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert("Cancel Workout", "Are you sure you want to cancel this workout?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      cancelWorkout(currentWorkout?.id);
                      useTimer.getState().stop();
                    },
                  },
                ]);
              }}
            >
              <Text className="text-red-600">Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => {
                Alert.alert("Finish Workout", "Are you sure you want to finish this workout?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      finishWorkout(currentWorkout?.id);
                      useTimer.getState().stop();
                    },
                  },
                ]);
              }}
            >
              <Text className="dark:text-white">Finish</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}
export function Router({ user }: { user: any }) {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();

  const scheme = useColorScheme();

  if (isLoading) return null;

  const isWorkingOut = !!currentWorkout;

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView className="flex-1">
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

        {isWorkingOut ? (
          <WorkoutStack />
        ) : (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: "#14b8a6",
              lazy: false,
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="HomeStack"
              component={HomeStack}
              options={{
                // headerShown: false,
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Stats"
              component={StatsScreen}
              options={{
                tabBarIcon: ({ color, size }) => <Feather name="activity" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
              }}
            />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
}
