import { useCurrentUser } from "@/lib/api";
import { Redirect, Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const user = useCurrentUser();

    if (!user) {
        return <Redirect href="/login" />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="workout" options={{ headerShown: false }} />
        </Stack>
    );
}
