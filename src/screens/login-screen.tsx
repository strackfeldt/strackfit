import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button } from "../components/button";
import { useLogin } from "../data/hooks";

export function LoginScreen() {
  const { mutate: login } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-zinc-200 dark:bg-black justify-center p-4">
      <View className="flex-row justify-center items-center gap-2">
        <Feather name="user" size={40} color="gray" />
        <Text className="text-2xl font-medium dark:text-white">Login</Text>
      </View>

      <View className="dark:text-white mt-4">
        <TextInput
          className="rounded-lg bg-zinc-100  p-4 border dark:bg-zinc-800 dark:text-white"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      <View className="dark:text-white mt-4">
        <TextInput
          className="rounded-lg bg-zinc-100  p-4 border dark:bg-zinc-800 dark:text-white"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View className="mt-4 w-full">
        <Button
          onPress={() => {
            login({ email, password });
          }}
        >
          <Feather name="log-in" size={20} color="white" />
          <Text className="text-white">Login</Text>
        </Button>
      </View>
    </View>
  );
}
