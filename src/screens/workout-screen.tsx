import Feather from "@expo/vector-icons/Feather";
import clsx from "clsx";
import { useKeepAwake } from "expo-keep-awake";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Button } from "../components/button";
import { useTimer } from "../components/use-timer";
import workouts, { Template } from "../data/data";
import {
  isOptimistic,
  useCreateLog,
  useCreateMissingExercises,
  useCurrentWorkout,
  useExercises,
  useLogs,
} from "../data/hooks";

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

  const repDisplay =
    !exercise.minReps || exercise.minReps === exercise.maxReps
      ? exercise.maxReps
      : `${exercise.minReps}-${exercise.maxReps}`;

  const restDisplay = !exercise.maxRest
    ? 0
    : !exercise.minRest || exercise.minRest === exercise.maxRest
    ? formatRest(exercise.maxRest)
    : `${formatRest(exercise.minRest)}-${formatRest(exercise.maxRest)}`;

  let supersetIndicator = undefined;
  let supersetIndicatorTagColor = undefined;

  if (exercise.superset === "a") {
    supersetIndicator = "border-2 border-teal-700";
    supersetIndicatorTagColor = "bg-teal-700 text-teal-100";
  } else if (exercise.superset === "b") {
    supersetIndicator = "border-2 border-red-500";
    supersetIndicatorTagColor = "bg-red-700 text-red-100";
  } else if (exercise.superset === "c") {
    supersetIndicator = "border-2 border-yellow-500";
    supersetIndicatorTagColor = "bg-yellow-700 text-yellow-100";
  } else if (exercise.superset === "d") {
    supersetIndicator = "border-2 border-blue-500";
    supersetIndicatorTagColor = "bg-blue-700 text-blue-100";
  } else if (exercise.superset === "e") {
    supersetIndicator = "border-2 border-purple-500";
    supersetIndicatorTagColor = "bg-purple-700 text-purple-100";
  }

  return (
    <View className={clsx("p-4 bg-white dark:bg-black rounded-lg mb-2", supersetIndicator)} key={exercise.id}>
      <TouchableOpacity
        onPress={() => {
          setOpen(!open);
        }}
      >
        <View className="flex-row justify-between items-center">
          <Text className="font-medium dark:text-white text-lg">{exercise.name}</Text>
          {/* {exercise.superset && (
              <View className="inline-flex rounded-full overflow-hidden">
                <Text
                  className={clsx(
                    "bg-teal-700 py-0.5 px-2 rounded-full text-[10px] font-medium text-gray-100",
                    supersetIndicatorTagColor
                  )}
                >
                  Superset
                </Text>
              </View>
            )} */}
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
              <Text className="font-medium dark:text-white">{exercise.sets}</Text>
              <Text className="text-zinc-500 dark:text-zinc-400">Sets</Text>
            </View>

            <View className="flex-row gap-1">
              <Text className="font-medium dark:text-white">{repDisplay}</Text>
              <Text className="text-zinc-500 dark:text-zinc-400">Reps</Text>
            </View>

            <View className="flex-row gap-1">
              <Text className="font-medium dark:text-white">{restDisplay}</Text>
              <Text className="text-zinc-500 dark:text-zinc-400">Rest</Text>
            </View>

            <View>
              {allDone ? (
                <Feather name="check" size={20} color="gray" />
              ) : (
                <Text className="text-zinc-500 dark:text-zinc-400">
                  {exercise.logs?.length} / {exercise.sets}
                </Text>
              )}
            </View>
          </View>

          <View className="mt-4">
            {exercise.logs?.map((log, index) => (
              <View className={`flex-row justify-between ${isOptimistic(log) ? "opacity-40" : ""}`} key={log.id}>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-500 dark:text-zinc-400">#</Text>
                  <Text className="font-medium dark:text-white">{index + 1}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-500 dark:text-zinc-400">Reps</Text>
                  <Text className="font-medium dark:text-white w-10 text-center">{log.reps}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-500 dark:text-zinc-400">Weight</Text>
                  <Text className="font-medium dark:text-white w-10 text-center">{log.weight}</Text>
                </View>
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-500 dark:text-zinc-400">RPE</Text>
                  <Text className="font-medium dark:text-white w-10 text-center">{log.rpe}</Text>
                </View>
              </View>
            ))}
          </View>

          {!allDone && (
            <View>
              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row gap-2 items-center">
                  <Text className="text-zinc-500 dark:text-zinc-400">#</Text>
                  <Text className="font-medium dark:text-white">{exercise.logs.length + 1}</Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="dark:text-white">Reps</Text>
                  <TextInput
                    keyboardType="number-pad"
                    className="rounded-lg bg-zinc-100 p-1 w-10 text-center dark:bg-zinc-800 dark:text-white"
                    value={reps}
                    onChangeText={setReps}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="dark:text-white">Weight</Text>
                  <TextInput
                    keyboardType="numeric"
                    className="rounded-lg bg-zinc-100 p-1 w-10 text-center dark:bg-zinc-800 dark:text-white"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>

                <View className="flex-row items-center gap-2">
                  <Text className="dark:text-white">RPE</Text>
                  <TextInput
                    keyboardType="numeric"
                    className="rounded-lg bg-zinc-100 p-1 w-10 text-center dark:bg-zinc-800 dark:text-white"
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
                  <Text className="dark:text-white">Add Set</Text>
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
          <Text className="text-2xl dark:text-white font-bold">{workout.name}</Text>
          <Text className="font-medium text-xs dark:text-zinc-300">
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
            className="p-2 bg-zinc-100 dark:bg-black flex-1 rounded-lg flex-row items-center justify-center"
            onPress={() => {
              useTimer.getState().start(timer);
            }}
          >
            <Feather name="play" size={12} color="gray" />
            <Text className="ml-0.5 text-zinc-800 dark:text-zinc-300 font-medium">{formatMinutes(timer)}</Text>
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
    // try {
    //   // await Audio.setAudioModeAsync({
    //   //   staysActiveInBackground: true,
    //   // });
    //   const { sound } = await Audio.Sound.createAsync(require("../assets/boxing-bell-cut.mp3"));
    //   await sound.playAsync();
    //   await sound.unloadAsync();
    // } catch (error) {
    //   console.log(error);
    // }
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
        <Text className="font-medium dark:text-zinc-300">
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
          <View className="rounded-t-2xl p-4 bg-white dark:bg-black w-full">
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
              <Text className="font-medium text-2xl dark:text-zinc-300 absolute">
                {hoursSinceStart > 0 && `${hoursSinceStart}:`}
                {minutesSinceStart < 10 ? `0${minutesSinceStart}` : minutesSinceStart}:
                {secondsSinceStart < 10 ? `0${secondsSinceStart}` : secondsSinceStart}
              </Text>

              <CircularProgressBar currentTime={timeInSeconds} maxLength={maxLength} minLength={minLength} />
            </View>

            <View className="mb-8">
              <Button
                // className="p-2 bg-zinc-100 rounded-lg flex-row items-center justify-center gap-1 mt-4 dark:bg-zinc-800"
                onPress={() => {
                  setModalVisible(false);
                  useTimer.getState().stop();
                }}
              >
                <Feather name="square" size={20} color="gray" />
                <Text className="dark:text-white">Stop Timer</Text>
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
    <View className="flex-1 justify-center items-center bg-white dark:bg-zinc-800">
      <Text className="text-lg font-bold mb-2 dark:text-white">Some exercises are missing</Text>
      <View className="mb-4">
        {templateExercises
          .filter((t) => !serverExercises.find((s) => s.name === t.name))
          .map((t) => (
            <Text key={t.id} className="text-sm dark:text-white">
              {t.name}
            </Text>
          ))}
      </View>
      <Button
        // className="p-2 bg-zinc-100 dark:bg-black rounded-lg flex-row items-center justify-center"
        onPress={() => {
          createMissingExercises({
            templateExercises,
            serverExercises,
          });
        }}
      >
        <Feather name="plus" size={20} color="gray" />
        <Text className="dark:text-white">Add Exercises</Text>
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
    <View className="flex-1 bg-zinc-200 dark:bg-zinc-800">
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
