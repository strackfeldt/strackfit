import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button } from "../components/button";
import { useLogin } from "../lib/hooks";

export function LoginScreen() {
  const { mutate: login } = useLogin();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-black justify-center p-4">
      <View className="flex-row justify-center items-center gap-2">
        <Feather name="user" size={40} color="gray" />
        <Text className="text-2xl font-medium text-white">Login</Text>
      </View>

      <View className="text-white mt-4">
        <TextInput
          className="rounded-lg p-4 border bg-zinc-800 text-white"
          placeholder="Email or Username"
          keyboardType="email-address"
          value={emailOrUsername}
          autoCapitalize="none"
          onChangeText={setEmailOrUsername}
        />
      </View>

      <View className="text-white mt-4">
        <TextInput
          className="rounded-lg p-4 border bg-zinc-800 text-white"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View className="mt-4 w-full">
        <Button
          onPress={() => {
            login({ username: emailOrUsername, password });
          }}
        >
          <Feather name="log-in" size={20} color="white" />
          <Text className="text-white">Login</Text>
        </Button>
      </View>
    </View>
  );
}
