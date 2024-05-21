import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native";

export default function Root() {
    const [qc] = useState(() => new QueryClient());

    // Set up the auth context and render our layout inside of it.
    return (
        <QueryClientProvider client={qc}>
            <ThemeProvider value={DarkTheme}>
                <SafeAreaView className="flex-1 bg-black">
                    <Slot />
                </SafeAreaView>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
