import Feather from "@expo/vector-icons/Feather";
import { DarkTheme, DefaultTheme, NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, Text, TouchableOpacity, useColorScheme } from "react-native";
import { useTimer } from "./components/use-timer";
import { useCancelWorkout, useCurrentUser, useCurrentWorkout, useFinishWorkout } from "./lib/api";
import { HomeScreen } from "./screens/home-screen";
import { LoginScreen } from "./screens/login-screen";
import { SettingsScreen } from "./screens/settings-screen";
import { WorkoutScreen } from "./screens/workout-screen";

const Stack = createNativeStackNavigator();

function HomeStack() {
  const navigation = useNavigation<any>();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerRight: ({ tintColor }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Settings");
              }}
            >
              <Feather name="settings" size={20} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen name="Settings" component={SettingsScreen} />
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
              <Text className="text-white">Finish</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function AppRouter() {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();

  const scheme = useColorScheme();

  if (isLoading) return null;

  const isWorkingOut = !!currentWorkout;

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

      {isWorkingOut ? <WorkoutStack /> : <HomeStack />}
    </NavigationContainer>
  );
}

export function AuthedRouter() {
  const user = useCurrentUser();

  if (!user) {
    return <LoginScreen />;
  }

  return <AppRouter />;
}
