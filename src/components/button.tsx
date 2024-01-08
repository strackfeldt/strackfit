import clsx from "clsx";
import React from "react";
import { TouchableOpacity } from "react-native";

export function Button({ children, className, ...props }: TouchableOpacity["props"]) {
  return (
    <TouchableOpacity
      {...props}
      className={clsx(
        "bg-zinc-900 active:bg-black text-white font-bold p-2 rounded-lg items-center justify-center flex-row space-x-1.5",
        className
      )}
    >
      {children}
    </TouchableOpacity>
  );
}
