import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import { AppState, AppStateStatus, KeyboardAvoidingView } from "react-native";
import { useCurrentUser } from "./data/hooks";
import { Router } from "./router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

const qc = new QueryClient();

export async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

export default function App() {
  const user = useCurrentUser();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={qc}>
      <KeyboardAvoidingView className="flex-1 dark:bg-black" behavior="padding" enabled>
        <Router user={user} />
      </KeyboardAvoidingView>
    </QueryClientProvider>
  );
}
