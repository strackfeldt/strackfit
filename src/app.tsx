import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
import { useKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { create } from "zustand";
import { Template, workouts } from "./api/data";
import {
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

function Button({ children, onPress, style }: any) {
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
        const lastPerformed = data?.find(
          (w) => w.template_id === workout.id
        )?.started_at;

        return (
          <View key={workout.id} className="w-1/2 p-2">
            <TouchableOpacity
              className="p-4 bg-white dark:bg-black rounded-lg h-32"
              key={workout.id}
              onPress={() => {
                Alert.alert(
                  "Start Workout",
                  `Are you sure you want to start ${workout.name}?`,
                  [
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
                  ]
                );
              }}
            >
              <Text className="dark:text-white font-medium">
                {workout.name}
              </Text>
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
          <View
            key={`${day}-${index}`}
            className="p-4 bg-white dark:bg-black w-[calc(100/7)%]"
          >
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
                isPrevMonth || isNextMonth
                  ? "bg-neutral-100 dark:bg-black"
                  : "bg-white dark:bg-black"
              }`}
            >
              {hasWorkout && (
                <View className="w-6 h-6 rounded-lg bg-teal-500 absolute" />
              )}
              <Text
                className={`text-xs font-medium ${
                  hasWorkout && "text-white"
                } dark:text-white`}
              >
                {day}
              </Text>
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

    const diffInMinutes = Math.floor(
      (end.getTime() - start.getTime()) / 1000 / 60
    );

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  if (!data) return null;

  return (
    <View className="flex-1 bg-neutral-200 dark:bg-neutral-800 p-4">
      <WorkoutCalendar workouts={data} />

      <ScrollView className="mt-6">
        {data?.map((workout) => (
          <View
            key={workout.id}
            className="p-4 bg-white dark:bg-black rounded-lg mb-4"
          >
            <Text className="dark:text-white">{workout.name}</Text>
            <Text className="dark:text-white">{workoutLength(workout)}</Text>
            <Text className="dark:text-white">
              {new Date(workout.created).toLocaleString("de")}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
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
                Alert.alert(
                  "Cancel Workout",
                  "Are you sure you want to cancel this workout?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: () => {
                        cancelWorkout(currentWorkout?.id);
                      },
                    },
                  ]
                );
              }}
            >
              <Text className="text-red-600">Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => {
                Alert.alert(
                  "Finish Workout",
                  "Are you sure you want to finish this workout?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: () => {
                        finishWorkout(currentWorkout?.id);
                      },
                    },
                  ]
                );
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

function Exercise({
  currentWorkoutId,
  exercise,
}: {
  currentWorkoutId: string;
  exercise: Omit<Template["exercises"][number], "id"> & { id: string };
}) {
  const { data: logs = [] } = useLogs(currentWorkoutId, exercise.id);
  const { mutate } = useCreateLog();

  const allDone = logs.length >= exercise.sets;

  const repDisplay =
    exercise.reps.min === exercise.reps.max
      ? exercise.reps.min
      : `${exercise.reps.min}-${exercise.reps.max}`;

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

  return (
    <View
      className="p-4 bg-white dark:bg-black rounded-lg mb-2"
      key={exercise.id}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-medium dark:text-white text-lg">
          {exercise.name}
        </Text>
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
          <Text className="font-medium dark:text-white">
            {formatRest(exercise.rest)}
          </Text>
          <Text className="text-neutral-500 dark:text-neutral-400">Rest</Text>
        </View>

        <View>
          {allDone ? (
            <Feather name="check" size={20} color="gray" />
          ) : (
            <Text className="text-neutral-500 dark:text-neutral-400">
              {logs?.length} / {exercise.sets}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-4">
        {logs?.map((log, index) => (
          <View className="flex-row justify-between" key={log.id}>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">#</Text>
              <Text className="font-medium dark:text-white">{index + 1}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">
                Reps
              </Text>
              <Text className="font-medium dark:text-white w-10 text-center">
                {log.reps}
              </Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">
                Weight
              </Text>
              <Text className="font-medium dark:text-white w-10 text-center">
                {log.weight}
              </Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">
                RPE
              </Text>
              <Text className="font-medium dark:text-white w-10 text-center">
                {log.rpe}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {!allDone && (
        <View>
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row gap-2 items-center">
              <Text className="text-neutral-500 dark:text-neutral-400">#</Text>
              <Text className="font-medium dark:text-white">
                {logs.length + 1}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">Reps</Text>
              <TextInput
                keyboardType="number-pad"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800"
                value={reps}
                onChangeText={setReps}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">Weight</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text className="dark:text-white">RPE</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded-lg bg-neutral-100 p-1 w-10 text-center dark:bg-neutral-800"
                value={rpe}
                onChangeText={setRpe}
              />
            </View>
          </View>

          <View className="mt-8">
            <Button
              onPress={() => {
                if (!weight || !reps || !rpe) return;

                useTimer.getState().start(exercise.rest);

                function parseValue(value: string) {
                  if (value.includes(",")) {
                    const clean = value.replace(",", ".");

                    return parseFloat(clean);
                  }

                  return parseInt(value);
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

      setTimeInSeconds(
        Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hoursSinceStart = Math.floor(timeInSeconds / 3600);
  const minutesSinceStart = Math.floor((timeInSeconds % 3600) / 60);
  const secondsSinceStart = Math.floor(timeInSeconds % 60);

  const timers = [60, 90, 120, 180];

  function formatMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
    }`;
  }

  return (
    <View className="mb-4">
      <View className="flex-row justify-between">
        <View>
          <Text className="text-2xl dark:text-white font-bold">
            {workout.name}
          </Text>
          <Text className="font-medium text-xs dark:text-neutral-300">
            {hoursSinceStart > 0 && `${hoursSinceStart}:`}
            {minutesSinceStart < 10
              ? `0${minutesSinceStart}`
              : minutesSinceStart}
            :
            {secondsSinceStart < 10
              ? `0${secondsSinceStart}`
              : secondsSinceStart}
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
            <Text className="ml-0.5 text-neutral-800 dark:text-neutral-300 font-medium">
              {formatMinutes(timer)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function CircularProgressBar({ progress }: { progress: number }) {
  const scheme = useColorScheme();

  const size = 200;
  const center = size / 2;
  const radius = center - 10;
  const dashArray = 2 * Math.PI * radius;
  const dashOffset = dashArray * ((100 - progress) / 100);
  const done = progress >= 100;

  return (
    <Svg height={size} width={size} className="rotate-180">
      <Circle
        cx={center}
        cy={center}
        fill="transparent"
        r={radius}
        stroke={done ? "#00B000" : scheme === "dark" ? "#444" : "#ddd"}
        strokeWidth={10}
      />
      {!done && (
        <Circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="#07c"
          strokeWidth={10}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

const useTimer = create<{
  timer: Date | null;
  length: number;
  start: (length: number) => void;
  stop: () => void;
}>((set) => ({
  timer: null,
  length: 0,
  start: (length) => {
    set({ timer: new Date(), length: length });
  },
  stop: () => {
    set({ timer: null, length: 0 });
  },
}));

function Timer() {
  const { timer, length } = useTimer();

  const [modalVisible, setModalVisible] = useState(false);
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!timer) {
      return;
    }

    setModalVisible(true);

    intervalRef.current = setInterval(() => {
      const startedAt = timer;

      setTimeInSeconds(
        Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
      );
    }, 1000);

    return () => {
      setTimeInSeconds(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer]);

  const hoursSinceStart = Math.floor(timeInSeconds / 3600);
  const minutesSinceStart = Math.floor((timeInSeconds % 3600) / 60);
  const secondsSinceStart = Math.floor(timeInSeconds % 60);

  return (
    <>
      {timer && (
        <Button
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Text className="font-medium dark:text-neutral-300">
            {hoursSinceStart > 0 && `${hoursSinceStart}:`}
            {minutesSinceStart < 10
              ? `0${minutesSinceStart}`
              : minutesSinceStart}
            :
            {secondsSinceStart < 10
              ? `0${secondsSinceStart}`
              : secondsSinceStart}
          </Text>
        </Button>
      )}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <SafeAreaView className="flex-1 justify-center items-center  bg-black/40">
          <View className="h-96 rounded-lg p-4 bg-white dark:bg-black w-10/12">
            <View className="flex-row justify-end">
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Feather name="x" size={20} color="gray" />
              </Button>
            </View>

            <View className="flex-1 items-center justify-center">
              <Text className="font-medium text-2xl dark:text-neutral-300 absolute">
                {hoursSinceStart > 0 && `${hoursSinceStart}:`}
                {minutesSinceStart < 10
                  ? `0${minutesSinceStart}`
                  : minutesSinceStart}
                :
                {secondsSinceStart < 10
                  ? `0${secondsSinceStart}`
                  : secondsSinceStart}
              </Text>

              <CircularProgressBar
                progress={!timeInSeconds ? 0 : (timeInSeconds / length) * 100}
              />
            </View>

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
        </SafeAreaView>
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
      <Text className="text-lg font-bold mb-4 dark:text-white">
        Some exercises are missing
      </Text>
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

  const { data: currentWorkout, isLoading } = useCurrentWorkout();
  const { data: exercises, isLoading: exLoading } = useExercises();

  const template = workouts.find((w) => w.id === currentWorkout?.template_id);

  if (isLoading || exLoading || !currentWorkout || !template) {
    return null;
  }

  const allExercisesOnServer = template.exercises.every((exercise) => {
    return exercises?.find((e) => e.name === exercise.name);
  });

  if (!allExercisesOnServer) {
    return (
      <ExercisesMissing
        templateExercises={template.exercises}
        serverExercises={exercises as any[]}
      />
    );
  }

  const templateWithExercises = {
    ...template,
    exercises:
      template?.exercises
        .map((exercise) => {
          const exerciseData = exercises?.find((e) => e.name === exercise.name);

          if (!exerciseData) return null;

          return {
            ...exercise,
            id: exerciseData?.id,
          };
        })
        .filter(Boolean) ?? [],
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-200 dark:bg-neutral-800"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4">
        <WorkoutInfo workout={currentWorkout} />

        {templateWithExercises?.exercises.map((exercise) => {
          return (
            <Exercise
              currentWorkoutId={currentWorkout.id}
              exercise={exercise!}
              key={exercise!.id}
            />
          );
        })}
      </View>
    </ScrollView>
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
            }}
          >
            <Tab.Screen
              name="HomeStack"
              component={HomeStack}
              options={{
                headerShown: false,
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="home" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Feather name="activity" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Feather name="settings" color={color} size={size} />
                ),
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
