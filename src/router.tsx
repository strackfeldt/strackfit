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
import { WorkoutPage } from "./screens/workout-screen";

const Tabs = createBottomTabNavigator();

function HomeStack() {
  return (
    <Tabs.Navigator
      screenOptions={{
        // tabBarShowLabel: false,
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

// function WorkoutStack() {
//   const { data: currentWorkout, isLoading } = useCurrentWorkout();
//   const { mutate: cancelWorkout } = useCancelWorkout();
//   const { mutate: finishWorkout } = useFinishWorkout();

//   if (!currentWorkout || isLoading) return null;

//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name={"Workout"}
//         component={WorkoutScreen}
//         options={{
//           headerLeft: () => (
//             <Button
//               title="Cancel"
//               onPress={() => {
//                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
//                 Alert.alert("Cancel Workout", "Are you sure you want to cancel this workout?", [
//                   { text: "Cancel", style: "cancel" },
//                   {
//                     text: "OK",
//                     onPress: () => {
//                       cancelWorkout(currentWorkout?.id);
//                     },
//                   },
//                 ]);
//               }}
//               color="red"
//             />
//           ),
//           headerRight: () => (
//             <Button
//               title="Finish"
//               onPress={() => {
//                 Alert.alert("Finish Workout", "Are you sure you want to finish this workout?", [
//                   { text: "Cancel", style: "cancel" },
//                   {
//                     text: "OK",
//                     onPress: () => {
//                       finishWorkout(currentWorkout?.id);
//                     },
//                   },
//                 ]);
//               }}
//             />
//           ),
//         }}
//       />
//     </Stack.Navigator>
//   );
// }

export function AuthedRouter() {
  const user = useCurrentUser();
  const scheme = useColorScheme();
  const currentWorkout = useCurrentWorkout();

  if (!user) {
    return <LoginScreen />;
  }

  if (currentWorkout) {
    return <WorkoutPage />;
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
