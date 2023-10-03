import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import de from "date-fns/locale/de";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useWorkouts } from "../lib/hooks";

function WorkoutCalendar({ workouts }: { workouts: any[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const startDay = startOfMonth(selectedDate);
  const endDay = endOfMonth(selectedDate);

  const startWeek = startOfWeek(startDay, { locale: de });
  const endWeek = endOfWeek(endDay, { locale: de });

  const range = eachDayOfInterval({ start: startWeek, end: endWeek });

  return (
    <View className="border-b border-zinc-700 p-4">
      <View className="flex flex-row justify-between rounded-lg overflow-hidden mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <View key={`${day}-${index}`} className="p-4 bg-white bg-black w-[calc(100/7)%]">
            <Text className="text-xs font-medium text-white">{day}</Text>
          </View>
        ))}
      </View>
      <View className="flex flex-row justify-between flex-wrap rounded-lg overflow-hidden">
        {range.map((date) => {
          const day = format(date, "d");
          const isPrevMonth = isBefore(date, startDay);
          const isNextMonth = isAfter(date, endDay);

          const hasWorkout = workouts.some((workout) => {
            const workoutDate = new Date(workout?.started_at);
            return isSameDay(workoutDate, date);
          });

          return (
            <View
              key={`${date.getMonth()} ${day}`}
              className={`p-4 items-center justify-center w-[calc(100/7)%] ${
                isPrevMonth || isNextMonth ? "bg-black" : "bg-black"
              }`}
            >
              {hasWorkout && <View className="w-6 h-6 rounded-lg bg-teal-500 absolute" />}
              <Text className={`text-xs font-medium ${hasWorkout && "text-white"} text-white`}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
export function HistoryScreen() {
  const { data } = useWorkouts();

  const workoutLength = (workout: any) => {
    const start = new Date(workout.started_at);
    const end = new Date(workout.ended_at);

    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  if (!data) return null;

  return (
    <View className="flex-1 bg-zinc-800">
      <WorkoutCalendar workouts={data} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {data?.map((workout) => (
            <View key={workout.id} className="p-4 bg-black rounded-lg mb-4">
              <Text className="text-white">{workout.name}</Text>
              <Text className="text-white">{workoutLength(workout)}</Text>
              <Text className="text-white">{new Date(workout.created).toLocaleString("de")}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
