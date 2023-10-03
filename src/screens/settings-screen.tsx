import Updates from "expo-updates";
import React from "react";
import { Alert, Text, View } from "react-native";
import { Button } from "../components/button";
import { useLogout } from "../lib/hooks";

export function SettingsScreen() {
  const logout = useLogout();

  return (
    <View className="flex-1 bg-zinc-800 p-4 space-y-4">
      <View>
        <Button
          onPress={() => {
            Alert.alert(
              "Logout",
              "Are you sure you want to logout?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  onPress: () => {
                    logout();
                  },
                },
              ],
              { cancelable: false }
            );
          }}
        >
          <Text className="text-white">Logout</Text>
        </Button>
      </View>

      <View>
        <Button
          onPress={() => {
            Updates.fetchUpdateAsync().then(() => {
              Updates.reloadAsync();
            });
          }}
        >
          <Text className="text-white">Update</Text>
        </Button>
      </View>
    </View>
  );
}
