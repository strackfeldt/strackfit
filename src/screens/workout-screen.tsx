import Feather from "@expo/vector-icons/Feather";
import { useKeepAwake } from "expo-keep-awake";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
  useColorScheme,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Button } from "../components/button";
import { useTimer } from "../components/use-timer";
import workouts, { Template } from "../data";
import {
  isOptimistic,
  useCreateLog,
  useCreateMissingExercises,
  useCurrentWorkout,
  useExercises,
  useLogs,
} from "../lib/api";

export function parseValue(value: string) {
  if (value.includes(",")) {
    const clean = value.replace(",", ".");

    return parseFloat(clean);
  }

  return parseInt(value);
}

function Exercise({
  currentWorkoutId,
  exercise,
}: {
  currentWorkoutId: string;
  exercise: Omit<Template["exercises"][number], "id"> & { id: string; logs: any[] };
}) {
  const { mutate } = useCreateLog();

  const [open, setOpen] = useState(false);

  const allDone = exercise.logs.length >= exercise.sets;

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");

  const formatRest = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) return `${minutes}`;

    if (remainingSeconds < 10) return `${minutes}:0${remainingSeconds}`;

    return `${minutes}:${remainingSeconds}`;
  };

  const restDisplay = !exercise.maxRest
    ? 0
    : !exercise.minRest || exercise.minRest === exercise.maxRest
    ? formatRest(exercise.maxRest)
    : `${formatRest(exercise.minRest)}-${formatRest(exercise.maxRest)}`;

  return (
    <View className="p-4 bg-black rounded-lg mb-2" key={exercise.id}>
      <TouchableOpacity
        onPress={() => {
          setOpen(!open);
        }}
      >
        <View className="flex-row justify-between items-center">
          <Text className="font-medium text-white text-lg">{exercise.name}</Text>
          {open ? (
            <Feather name="chevron-down" size={24} color="gray" />
          ) : (
            <Feather name="chevron-right" size={24} color="gray" />
          )}
        </View>
      </TouchableOpacity>
      {open && (
        <>
          <View className="flex-row justify-between items-center mt-3">
            <View className="flex-row gap-1">
              <Text className="font-medium text-white">{exercise.sets}</Text>
              <Text className="text-zinc-400">Sets</Text>
            </View>

            <View className="flex-row gap-1">
              <Text className="font-medium text-white">{exercise.reps}</Text>
              <Text className="text-zinc-400">Reps</Text>
            </View>

            <View className="flex-row gap-1">
              <Text className="font-medium text-white">{restDisplay}</Text>
              <Text className="text-zinc-400">Rest</Text>
            </View>

            <View>
              {allDone ? (
                <Feather name="check" size={20} color="gray" />
              ) : (
                <Text className="text-zinc-400">
                  {exercise.logs?.length}/{exercise.sets}
                </Text>
              )}
            </View>
          </View>

          <View className="mt-4">
            {exercise.logs?.map((log, index) => (
              <View className={`flex-row justify-between ${isOptimistic(log) ? "opacity-40" : ""}`} key={log.id}>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-400">#</Text>
                  <Text className="font-medium text-white">{index + 1}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-400">Reps</Text>
                  <Text className="font-medium text-white w-10 text-center">{log.reps}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-400">Weight</Text>
                  <Text className="font-medium text-white w-10 text-center">{log.weight}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-400">RPE</Text>
                  <Text className="font-medium text-white w-10 text-center">{log.rpe}</Text>
                </View>
              </View>
            ))}
          </View>

          {!allDone && (
            <View>
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-400">#</Text>
                  <Text className="font-medium text-white">{exercise.logs.length + 1}</Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-white">Reps</Text>
                  <TextInput
                    keyboardType="number-pad"
                    className="rounded-lg p-1 w-10 text-center bg-zinc-800 text-white"
                    value={reps}
                    onChangeText={setReps}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-white">Weight</Text>
                  <TextInput
                    keyboardType="numeric"
                    className="rounded-lg p-1 w-10 text-center bg-zinc-800 text-white"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="text-white">RPE</Text>
                  <TextInput
                    keyboardType="numeric"
                    className="rounded-lg p-1 w-10 text-center bg-zinc-800 text-white"
                    value={rpe}
                    onChangeText={setRpe}
                  />
                </View>
              </View>

              <View className="mt-8">
                <Button
                  onPress={() => {
                    if (!weight || !reps || !rpe) return;

                    if (exercise.maxRest) {
                      useTimer.getState().start(exercise.maxRest, exercise.minRest);
                    }

                    mutate(
                      {
                        exerciseId: exercise.id,
                        workoutId: currentWorkoutId,
                        reps: parseInt(reps),
                        weight: parseValue(weight),
                        rpe: parseValue(rpe),
                      },

                      {
                        onError: () => {
                          useTimer.getState().stop();
                        },
                        onSuccess: () => {
                          setWeight("");
                          setReps("");
                          setRpe("");
                        },
                      }
                    );
                  }}
                >
                  <Feather name="plus" size={20} color="gray" />
                  <Text className="text-white">Add Set</Text>
                </Button>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}
function WorkoutInfo({ workout }: { workout: any }) {
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const startedAt = new Date(workout.started_at);

      setTimeInSeconds(Math.floor((new Date().getTime() - startedAt.getTime()) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const hoursSinceStart = Math.floor(timeInSeconds / 3600);
  const minutesSinceStart = Math.floor((timeInSeconds % 3600) / 60);
  const secondsSinceStart = Math.floor(timeInSeconds % 60);

  const timers = [10, 60, 120, 180];

  function formatMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  }

  return (
    <View className="px-4 pt-3 pb-4 border-b border-zinc-700">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl text-white font-bold">{workout.name}</Text>
          <Text className="font-medium text-xs text-zinc-300">
            {hoursSinceStart > 0 && `${hoursSinceStart}:`}
            {minutesSinceStart < 10 ? `0${minutesSinceStart}` : minutesSinceStart}:
            {secondsSinceStart < 10 ? `0${secondsSinceStart}` : secondsSinceStart}
          </Text>
        </View>

        <Timer />
      </View>

      <View className="flex-row items-center justify-between gap-4 mt-2">
        {timers.map((timer) => (
          <TouchableOpacity
            key={timer}
            className="p-2 bg-black flex-1 rounded-lg flex-row items-center justify-center"
            onPress={() => {
              useTimer.getState().start(timer);
            }}
          >
            <Feather name="play" size={12} color="gray" />
            <Text className="ml-0.5 text-zinc-300 font-medium">{formatMinutes(timer)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
function CircularProgressBar({
  currentTime,
  maxLength,
  minLength,
}: {
  currentTime: number;
  maxLength: number;
  minLength: number | null;
}) {
  const progress = !currentTime ? 0 : (currentTime / maxLength) * 100;
  const scheme = useColorScheme();

  const size = 200;
  const center = size / 2;
  const radius = center - 10;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray * ((100 - progress) / 100);
  const done = progress >= 100;

  return (
    <View>
      <Svg height={size} width={size} className="rotate-180">
        <Circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={done ? "#22c55e" : scheme === "dark" ? "#444" : "#ddd"}
          strokeWidth={10}
        />
        {!done && (
          <Circle
            cx={center}
            cy={center}
            fill="transparent"
            r={radius}
            stroke={minLength && currentTime > minLength ? "#eab308" : "#14b8a6"}
            strokeWidth={10}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        )}
      </Svg>
    </View>
  );
}
function Timer() {
  const { timer, maxLength, minLength } = useTimer();

  const [modalVisible, setModalVisible] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  const soundPlayed = useRef(false);

  async function playSound() {
    Vibration.vibrate(1000, false);
  }

  useEffect(() => {
    if (!timer) {
      return;
    }

    setModalVisible(true);
    soundPlayed.current = false;

    const interval = setInterval(() => {
      const newTime = Math.floor((new Date().getTime() - timer.getTime()) / 1000);

      if (!soundPlayed.current && maxLength && newTime === maxLength) {
        soundPlayed.current = true;
        playSound();
      }

      setTimeInSeconds(newTime);
    }, 100);

    return () => {
      setTimeInSeconds(0);
      clearInterval(interval);
    };
  }, [timer]);

  const hoursSinceStart = Math.floor(timeInSeconds / 3600);
  const minutesSinceStart = Math.floor((timeInSeconds % 3600) / 60);
  const secondsSinceStart = Math.floor(timeInSeconds % 60);

  if (!timer || !maxLength) return null;

  return (
    <>
      <Button
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Text className="font-medium text-zinc-300">
          {hoursSinceStart > 0 && `${hoursSinceStart}:`}
          {minutesSinceStart < 10 ? `0${minutesSinceStart}` : minutesSinceStart}:
          {secondsSinceStart < 10 ? `0${secondsSinceStart}` : secondsSinceStart}
        </Text>
      </Button>

      <Modal
        animationType="none"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-end items-center bg-zinc-700/40">
          <View className="rounded-t-2xl p-4 bg-black w-full">
            <View className="flex-row justify-end">
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Feather name="x" size={20} color="gray" />
              </Button>
            </View>

            <View className="items-center justify-center h-72">
              <Text className="font-medium text-2xl text-zinc-300 absolute">
                {hoursSinceStart > 0 && `${hoursSinceStart}:`}
                {minutesSinceStart < 10 ? `0${minutesSinceStart}` : minutesSinceStart}:
                {secondsSinceStart < 10 ? `0${secondsSinceStart}` : secondsSinceStart}
              </Text>

              <CircularProgressBar currentTime={timeInSeconds} maxLength={maxLength} minLength={minLength} />
            </View>

            <View className="mb-8">
              <Button
                // className="p-2 rounded-lg flex-row items-center justify-center gap-1 mt-4 bg-zinc-800"
                onPress={() => {
                  setModalVisible(false);
                  useTimer.getState().stop();
                }}
              >
                <Feather name="square" size={20} color="gray" />
                <Text className="text-white">Stop Timer</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
function ExercisesMissing({
  templateExercises,
  serverExercises,
}: {
  templateExercises: any[];
  serverExercises: any[];
}) {
  const { mutate: createMissingExercises } = useCreateMissingExercises();

  return (
    <View className="flex-1 justify-center items-center bg-zinc-800">
      <Text className="text-lg font-bold mb-2 text-white">Some exercises are missing</Text>
      <View className="mb-4">
        {templateExercises
          .filter((t) => !serverExercises.find((s) => s.name === t.name))
          .map((t) => (
            <Text key={t.name} className="text-sm text-white">
              {t.name}
            </Text>
          ))}
      </View>
      <Button
        onPress={() => {
          createMissingExercises({
            templateExercises,
            serverExercises,
          });
        }}
      >
        <Feather name="plus" size={20} color="gray" />
        <Text className="text-white">Add Exercises</Text>
      </Button>
    </View>
  );
}
export function WorkoutScreen() {
  useKeepAwake();

  const [isRefetching, setIsRefetching] = useState(false);

  const { data: exercises } = useExercises();

  const { data: currentWorkout, refetch: refetchWorkout } = useCurrentWorkout();
  const { data: logs = [], refetch: refetchLogs } = useLogs(currentWorkout?.id!, { enabled: !!currentWorkout });

  const template = workouts.find((w) => w.id === currentWorkout?.template_id);

  if (!currentWorkout || !exercises || !template) {
    return null;
  }

  const allExercisesOnServer = template.exercises.every((exercise) => {
    return exercises?.find((e) => e.name === exercise.name);
  });

  if (!allExercisesOnServer) {
    return <ExercisesMissing templateExercises={template.exercises} serverExercises={exercises as any[]} />;
  }

  const templateWithExercises = {
    ...template,
    exercises:
      template?.exercises
        .map((exercise) => {
          const exerciseData = exercises?.find((e) => e.name === exercise.name);
          const exerciseLogs = logs.filter((l) => l.exercise === exerciseData?.id);

          if (!exerciseData) return null;

          return {
            ...exercise,
            id: exerciseData?.id,
            logs: exerciseLogs ?? [],
          };
        })
        .filter(Boolean) ?? [],
  };

  return (
    <View className="flex-1 bg-zinc-800">
      <WorkoutInfo workout={currentWorkout} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={async () => {
              setIsRefetching(true);

              await refetchWorkout();
              await refetchLogs();

              setIsRefetching(false);
            }}
          />
        }
      >
        <View className="p-4">
          {templateWithExercises?.exercises.map((exercise) => {
            return <Exercise currentWorkoutId={currentWorkout.id} exercise={exercise!} key={exercise!.id} />;
          })}
        </View>
      </ScrollView>
    </View>
  );
}
