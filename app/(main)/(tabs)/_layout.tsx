import { useCurrentWorkout } from "@/store/workout-store";
import Feather from "@expo/vector-icons/Feather";
import { Redirect, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
    const currentWorkout = useCurrentWorkout();

    if (currentWorkout) {
        return <Redirect href="/workout" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
