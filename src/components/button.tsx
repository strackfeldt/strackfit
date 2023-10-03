import React from "react";
import { TouchableOpacity } from "react-native";

export function Button({ children, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-zinc-900 active:bg-black text-white font-bold p-3 rounded-lg items-center justify-center flex-row space-x-1.5"
    >
      {children}
    </TouchableOpacity>
  );
}
