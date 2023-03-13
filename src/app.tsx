import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import clsx from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import de from "date-fns/locale/de";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Vibration,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { create } from "zustand";
import workouts, { Template } from "./api/data";
import {
  isOptimistic,
  useCancelWorkout,
  useCreateLog,
  useCreateMissingExercises,
  useCurrentUser,
  useCurrentWorkout,
  useExercises,
  useFinishWorkout,
  useLogin,
  useLogout,
  useLogs,
  useStartWorkout,
  useWorkouts,
} from "./api/hooks";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function parseValue(value: string) {
  if (value.includes(",")) {
    const clean = value.replace(",", ".");

    return parseFloat(clean);
  }

  return parseInt(value);
}

const useTimer = create<{
  timer: Date | null;
  minLength: number | null;
  maxLength: number | null;
  start: (maxLength: number, minLength?: number) => void;
  stop: () => void;
}>((set) => ({
  timer: null,
  minLength: null,
  maxLength: null,
  start: (maxLength, minLength) => {
    set({ timer: new Date(), maxLength, minLength });
  },
  stop: () => {
    set({ timer: null, maxLength: null, minLength: null });
  },
}));

function Button({ children, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-100 dark:bg-neutral-900 dark:active:bg-black text-white font-bold p-3 rounded-lg items-center justify-center flex-row space-x-1.5"
    >
      {children}
    </TouchableOpacity>
  );
}

function HomeScreen() {
  const { mutate } = useStartWorkout();

  const { data } = useWorkouts();

  return (
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-800 p-2  flex-row flex-wrap">
      {workouts.map((workout) => {
        const lastPerformed = data?.find((w) => w.template_id === workout.id)?.started_at;

        return (
          <View key={workout.id} className="w-1/2 p-2">
            <TouchableOpacity
              className="p-4 bg-white dark:bg-black rounded-lg h-32"
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
              <Text className="dark:text-white font-medium">{workout.name}</Text>
              <Text numberOfLines={3} className="text-xs text-neutral-400 mt-2">
                {workout.exercises.map((ex) => ex.name).join(", ")}
              </Text>

              <View className="flex-row items-center gap-1.5 mt-auto">
                <Feather name="clock" size={16} color="gray" />
                <Text className="text-xs text-neutral-400">
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

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsScreen() {
  const logout = useLogout();

  return (
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-800 p-4">
      <Button
        className="p-4 bg-white rounded-lg dark:bg-black"
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
        <Text className="dark:text-white">Logout</Text>
      </Button>
    </View>
  );
}

function WorkoutCalendar({ workouts }: { workouts: any[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const startDay = startOfMonth(selectedDate);
  const endDay = endOfMonth(selectedDate);

  const startWeek = startOfWeek(startDay, { locale: de });
  const endWeek = endOfWeek(endDay, { locale: de });

  const range = eachDayOfInterval({ start: startWeek, end: endWeek });

  return (
    <View>
      <View className="flex flex-row justify-between rounded-lg overflow-hidden mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <View key={`${day}-${index}`} className="p-4 bg-white dark:bg-black w-[calc(100/7)%]">
            <Text className="text-xs font-medium dark:text-white">{day}</Text>
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
                isPrevMonth || isNextMonth ? "bg-neutral-100 dark:bg-black" : "bg-white dark:bg-black"
              }`}
            >
              {hasWorkout && <View className="w-6 h-6 rounded-lg bg-teal-500 absolute" />}
              <Text className={`text-xs font-medium ${hasWorkout && "text-white"} dark:text-white`}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function HistoryScreen() {
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
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-800">
      <View className="p-4">
        <WorkoutCalendar workouts={data} />
      </View>

      <ScrollView className="p-4">
        {data?.map((workout) => (
          <View key={workout.id} className="p-4 bg-white dark:bg-black rounded-lg mb-4">
            <Text className="dark:text-white">{workout.name}</Text>
            <Text className="dark:text-white">{workoutLength(workout)}</Text>
            <Text className="dark:text-white">{new Date(workout.created).toLocaleString("de")}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Exercise({
  currentWorkoutId,
  exercise,
}: {
  currentWorkoutId: string;
  exercise: Omit<Template["exercises"][number], "id"> & { id: string; logs: any[] };
}) {
  const { mutate } = useCreateLog();

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
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-medium dark:text-white text-lg">{exercise.name}</Text>
        {exercise.superset && (
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
        )}
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-1">
          <Text className="font-medium dark:text-white">{exercise.sets}</Text>
          <Text className="text-neutral-500 dark:text-neutral-400">Sets</Text>
        </View>

        <View className="flex-row gap-1">
          <Text className="font-medium dark:text-white">{repDisplay}</Text>
          <Text className="text-neutral-500 dark:text-neutral-400">Reps</Text>
        </View>

        <View className="flex-row gap-1">
          <Text className="font-medium dark:text-white">{restDisplay}</Text>
          <Text className="text-neutral-500 dark:text-neutral-400">Rest</Text>
        </View>

        <View>
          {allDone ? (
            <Feather name="check" size={20} color="gray" />
          ) : (
            <Text className="text-neutral-500 dark:text-neutral-400">
              {exercise.logs?.length} / {exercise.sets}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-4">
        {exercise.logs?.map((log, index) => (
          <View className={`flex-row justify-between ${isOptimistic(log) ? "opacity-40" : ""}`} key={log.id}>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">#</Text>
              <Text className="font-medium dark:text-white">{index + 1}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">Reps</Text>
              <Text className="font-medium dark:text-white w-10 text-center">{log.reps}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">Weight</Text>
              <Text className="font-medium dark:text-white w-10 text-center">{log.weight}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">RPE</Text>
              <Text className="font-medium dark:text-white w-10 text-center">{log.rpe}</Text>
            </View>
          </View>
        ))}
      </View>

      {!allDone && (
        <View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">#</Text>
              <Text className="font-medium dark:text-white">{exercise.logs.length + 1}</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">Reps</Text>
              <TextInput
                keyboardType="number-pad"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800 dark:text-white"
                value={reps}
                onChangeText={setReps}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">Weight</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800 dark:text-white"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">RPE</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800 dark:text-white"
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
    </View>
  );
}

function WorkoutInfo({ workout }: { workout: any }) {
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const startedAt = new Date(workout.started_at);

      setTimeInSeconds(Math.floor((new Date().getTime() - startedAt.getTime()) / 1000));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const hoursSinceStart = Math.floor(timeInSeconds / 3600);
  const minutesSinceStart = Math.floor((timeInSeconds % 3600) / 60);
  const secondsSinceStart = Math.floor(timeInSeconds % 60);

  const timers = [60, 90, 120, 180];

  function formatMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  }

  return (
    <View className="px-4 pt-3 pb-4 border-b border-neutral-700">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl dark:text-white font-bold">{workout.name}</Text>
          <Text className="font-medium text-xs dark:text-neutral-300">
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
            className="p-2 bg-neutral-100 dark:bg-black flex-1 rounded-lg flex-row items-center justify-center"
            onPress={() => {
              useTimer.getState().start(timer);
            }}
          >
            <Feather name="play" size={12} color="gray" />
            <Text className="ml-0.5 text-neutral-800 dark:text-neutral-300 font-medium">{formatMinutes(timer)}</Text>
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
  const [sound, setSound] = useState<Audio.Sound>();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(require("../assets/boxing-bell-cut.mp3"));
    setSound(sound);

    Vibration.vibrate(1000, false);
    await sound.playAsync();
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const soundPlayed = useRef(false);

  useEffect(() => {
    if (!timer) {
      return;
    }

    setModalVisible(true);
    soundPlayed.current = false;

    const interval = setInterval(() => {
      const newTime = Math.floor((new Date().getTime() - timer.getTime()) / 1000);

      if (!soundPlayed.current && maxLength && newTime >= maxLength) {
        playSound();
        soundPlayed.current = true;
      }

      setTimeInSeconds(newTime);
    }, 300);

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
        <Text className="font-medium dark:text-neutral-300">
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
        <View className="flex-1 justify-end items-center bg-neutral-700/40">
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
              <Text className="font-medium text-2xl dark:text-neutral-300 absolute">
                {hoursSinceStart > 0 && `${hoursSinceStart}:`}
                {minutesSinceStart < 10 ? `0${minutesSinceStart}` : minutesSinceStart}:
                {secondsSinceStart < 10 ? `0${secondsSinceStart}` : secondsSinceStart}
              </Text>

              <CircularProgressBar currentTime={timeInSeconds} maxLength={maxLength} minLength={minLength} />
            </View>

            <View className="mb-8">
              <Button
                // className="p-2 bg-neutral-100 rounded-lg flex-row items-center justify-center gap-1 mt-4 dark:bg-neutral-800"
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
    <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-800">
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
        // className="p-2 bg-neutral-100 dark:bg-black rounded-lg flex-row items-center justify-center"
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

function WorkoutScreen() {
  useKeepAwake();

  const { data: currentWorkout } = useCurrentWorkout();
  const { data: exercises } = useExercises();
  const { data: logs = [], isFetching, refetch } = useLogs(currentWorkout?.id!, { enabled: !!currentWorkout });

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
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-800">
      <WorkoutInfo workout={currentWorkout} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
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

function WorkoutStack() {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();
  const { mutate: cancelWorkout } = useCancelWorkout();
  const { mutate: finishWorkout } = useFinishWorkout();

  if (!currentWorkout || isLoading) return null;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={"Workout"}
        component={WorkoutScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert("Cancel Workout", "Are you sure you want to cancel this workout?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      cancelWorkout(currentWorkout?.id);
                    },
                  },
                ]);
              }}
            >
              <Text className="text-red-600">Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => {
                Alert.alert("Finish Workout", "Are you sure you want to finish this workout?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {
                      finishWorkout(currentWorkout?.id);
                    },
                  },
                ]);
              }}
            >
              <Text className="dark:text-white">Finish</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function Router() {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();

  const scheme = useColorScheme();

  if (isLoading) return null;

  const isWorkingOut = !!currentWorkout;

  return (
    <SafeAreaView className="flex-1">
      <NavigationContainer
        theme={
          scheme === "dark"
            ? {
                ...DarkTheme,
                colors: {
                  ...DarkTheme.colors,
                  card: "#000",
                },
              }
            : DefaultTheme
        }
      >
        <StatusBar style="auto" />

        {isWorkingOut ? (
          <WorkoutStack />
        ) : (
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: "#14b8a6",
              lazy: false,
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="HomeStack"
              component={HomeStack}
              options={{
                // headerShown: false,
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => <Feather name="activity" color={color} size={size} />,
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
              }}
            />
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
}

function AuthScreen() {
  const { mutate: login } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-neutral-200 dark:bg-black justify-center p-4">
      <View className="flex-row justify-center items-center gap-2">
        <Feather name="user" size={40} color="gray" />
        <Text className="text-2xl font-medium dark:text-white">Login</Text>
      </View>

      <View className="dark:text-white mt-4">
        <TextInput
          className="rounded-lg bg-neutral-100  p-4 border dark:bg-neutral-800 dark:text-white"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
      </View>

      <View className="dark:text-white mt-4">
        <TextInput
          className="rounded-lg bg-neutral-100  p-4 border dark:bg-neutral-800 dark:text-white"
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

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const qc = new QueryClient();

export default function App() {
  const user = useCurrentUser();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={qc}>
      <KeyboardAvoidingView
        className="flex-1 dark:bg-black"
        enabled
        behavior="padding"
        // keyboardVerticalOffset={100}
      >
        {user ? <Router /> : <AuthScreen />}
      </KeyboardAvoidingView>
    </QueryClientProvider>
  );
}
