import Feather from "@expo/vector-icons/Feather";

import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useWorkoutActions } from "../components/workout-store";
import { useWorkouts } from "../lib/api";
import workouts from "../lib/data";

export function HomeScreen() {
  const { start } = useWorkoutActions();
  const { data } = useWorkouts();

  return (
    <View className="flex-1 bg-zinc-900">
      <ScrollView className="flex-1 p-2">
        {workouts.map((workout) => {
          const lastPerformed = data?.find((w) => w.template_id === workout.id)?.started_at;

          return (
            <View className="p-2" key={workout.id}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert("Start Workout", `Are you sure you want to start ${workout.name}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Start",
                      onPress: () => {
                        start({
                          name: workout.name,
                          templateId: workout.id,
                          users: [
                            {
                              id: "74z2z1nlcupr0tc",
                              name: "Timo",
                            },
                            {
                              id: "5vzepo7uod04j7i",
                              name: "Alina",
                            },
                          ],
                        });
                      },
                    },
                  ]);
                }}
              >
                <View className="p-4 bg-black rounded-lg h-36 flex-row items-center space-x-6">
                  <View className="flex-1 gap-y-2">
                    <Text className="text-white font-medium">{workout.name}</Text>
                    <Text numberOfLines={3} className="text-xs text-zinc-400">
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
                  </View>
                  <Feather name="chevron-right" size={16} color="gray" />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
