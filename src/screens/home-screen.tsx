import Feather from "@expo/vector-icons/Feather";
import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import workouts from "../lib/data";
import { useStartWorkout, useWorkouts } from "../lib/hooks";

export function HomeScreen() {
  const { mutate } = useStartWorkout();

  const { data } = useWorkouts();

  return (
    <View className="flex-1 bg-zinc-800 p-2  flex-row flex-wrap">
      {workouts.map((workout) => {
        const lastPerformed = data?.find((w) => w.template_id === workout.id)?.started_at;

        return (
          <View key={workout.id} className="w-1/2 p-2">
            <TouchableOpacity
              className="p-4 bg-black rounded-lg h-32"
              key={workout.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                Alert.alert("Start Workout", `Are you sure you want to start ${workout.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Start",
                    onPress: () => {
                      mutate({
                        id: workout.id,
                        name: workout.name,
                      });
                    },
                  },
                ]);
              }}
            >
              <Text className="text-white font-medium">{workout.name}</Text>
              <Text numberOfLines={3} className="text-xs text-zinc-400 mt-2">
                {workout.exercises.map((ex) => ex.name).join(", ")}
              </Text>

              <View className="flex-row items-center gap-1.5 mt-auto">
                <Feather name="clock" size={16} color="gray" />
                <Text className="text-xs text-zinc-400">
                  {lastPerformed
                    ? formatDistanceToNow(new Date(lastPerformed), {
                        addSuffix: true,
                      }).replace("about", "")
                    : "Never"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
