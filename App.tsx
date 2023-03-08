import Feather from "@expo/vector-icons/Feather";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  focusManager,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useKeepAwake } from "expo-keep-awake";
import * as SecureStore from "expo-secure-store";
import PocketBase, { Admin, BaseAuthStore, Record } from "pocketbase";

class AsyncAuthStore extends BaseAuthStore {
  storageKey: string;
  queue: Array<() => Promise<any>>;

  /**
   * @param {String} storageKey
   */
  constructor(storageKey = "pb_auth") {
    super();

    this.storageKey = storageKey;
    this.queue = [];

    this._enqueue(async () => {
      const raw = await SecureStore.getItemAsync(this.storageKey);
      if (raw) {
        const decoded = JSON.parse(raw);
        this.save(decoded.token, decoded.model);
      }
    });
  }

  /**
   * @inheritdoc
   */
  save(token: string, model: any) {
    super.save(token, model);

    this._enqueue(() => {
      return SecureStore.setItemAsync(
        this.storageKey,
        JSON.stringify({ token, model })
      );
    });
  }

  /**
   * @inheritdoc
   */
  clear() {
    super.clear();

    this._enqueue(() => {
      return SecureStore.deleteItemAsync(this.storageKey);
    });
  }

  /**
   * Appends an async function to the queue.
   */
  _enqueue(asyncCallback: () => Promise<any>) {
    this.queue.push(asyncCallback);

    if (this.queue.length === 1) {
      this._dequeue();
    }
  }

  /**
   * Starts the queue processing.
   */
  _dequeue() {
    if (!this.queue.length) {
      return;
    }

    this.queue[0]().finally(() => {
      this.queue.shift();

      if (!this.queue.length) {
        return;
      }

      this._dequeue();
    });
  }
}

const pb = new PocketBase("https://strackfit.fly.dev/", new AsyncAuthStore());

type Template = {
  id: number;
  name: string;
  exercises: Array<{
    id: number;
    name: string;
    note?: string;
    sets: number;
    rest: number;
    reps: {
      min: number;
      max: number;
    };
  }>;
};

type Workout = {
  id: number;
  templateId: number;
  startDate: Date;
  endDate?: Date;
};

type Log = {
  workoutId: number;
  exerciseId: number;
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number;
  date: Date;
};

const workouts: Template[] = [
  {
    id: 1,
    name: "Legs 1",
    exercises: [],
  },
  {
    id: 2,
    name: "Push 1",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 3,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        id: 2,
        name: "DB Seated Press",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        id: 3,
        name: "Dips",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        id: 4,
        name: "Peck Deck",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        id: 5,
        name: "Skullcrusher",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
        id: 6,
        name: "Lateral Raise",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 15 },
      },
    ],
  },
  {
    id: 3,
    name: "Pull 1",
    exercises: [
      {
        id: 1,
        name: "Neutral Pull Up",
        sets: 4,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        id: 2,
        name: "DB Row",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        id: 3,
        name: "BB Curl",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        id: 4,
        name: "Lat Pulldown",
        sets: 2,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        id: 5,
        name: "Preacher Curl",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
        id: 6,
        name: "Ring Face Pull",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 15 },
      },
    ],
  },
  {
    id: 4,
    name: "Push 2",
    exercises: [],
  },
  {
    id: 5,
    name: "Pull 2",
    exercises: [],
  },
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeScreen() {
  const { mutate } = useStartWorkout();

  return (
    <View className="flex-1 bg-gray-200 gap-2 p-4">
      {workouts.map((workout) => (
        <TouchableOpacity
          className="p-4 bg-white rounded"
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
                    mutate(workout);
                  },
                },
              ]
            );
          }}
        >
          <Text>{workout.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function useLogout() {
  return () => pb.authStore.clear();
}

function SettingsScreen() {
  const logout = useLogout();

  return (
    <View className="flex-1 bg-gray-200 items-center justify-center">
      {/* <Text className="">Settings Screen</Text> */}
      <TouchableOpacity
        className="p-4 bg-white rounded"
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
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: () => pb.collection("workouts").getFullList(),
  });
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
      <View className="flex flex-row justify-between rounded overflow-hidden mb-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <View
            key={`${day}-${index}`}
            className="p-4 bg-white w-[calc(100/7)%]"
          >
            <Text className="text-xs font-medium">{day}</Text>
          </View>
        ))}
      </View>
      <View className="flex flex-row justify-between flex-wrap rounded overflow-hidden">
        {range.map((date) => {
          const day = format(date, "d");
          const isPrevMonth = isBefore(date, startDay);
          const isNextMonth = isAfter(date, endDay);

          const hasWorkout = workouts.some((workout) => {
            const workoutDate = new Date(workout?.started_at);
            return isSameDay(workoutDate, date);
          });

          console.log(`${date.getMonth()} ${day}`);

          return (
            <View
              key={`${date.getMonth()} ${day}`}
              className={`p-4 items-center justify-center w-[calc(100/7)%] ${
                isPrevMonth || isNextMonth ? "bg-gray-100" : "bg-white"
              }`}
            >
              {hasWorkout && (
                <View className="w-6 h-6 rounded-full bg-teal-500 absolute" />
              )}
              <Text
                className={`text-xs font-medium ${hasWorkout && "text-white"}`}
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
  console.log(data);

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
    <View className="flex-1 bg-gray-200 p-4">
      <WorkoutCalendar workouts={data} />
      <ScrollView className="mt-6">
        {data?.map((workout) => (
          <View key={workout.id} className="p-4 bg-white rounded">
            <Text>{workout.name}</Text>
            <Text>{workoutLength(workout)}</Text>
            <Text>{new Date(workout.created).toLocaleString("de")}</Text>
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

  const template = workouts.find((w) => w.id === currentWorkout?.template_id);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={"Workout"}
        component={WorkoutScreen}
        options={{
          title: template?.name,
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
              <Text>Finish</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function useLogs(workoutId: string, exerciseId: string) {
  return useQuery({
    queryKey: ["wokout", workoutId, "logs", exerciseId],
    queryFn: () => {
      return pb.collection("logs").getFullList({
        filter: `workout = "${workoutId}" && exercise = "${exerciseId}"`,
        sort: "created",
      });
    },
  });
}

function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: {
      workoutId: string;
      exerciseId: string;
      weight: number;
      reps: number;
      rpe: number;
    }) => {
      return pb.collection("logs").create({
        workout: data.workoutId,
        exercise: data.exerciseId,
        weight: data.weight,
        reps: data.reps,
        rpe: data.rpe,
      });
    },
    {
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["wokout", data.workoutId, "logs", data.exerciseId],
        });

        const previousLogs = queryClient.getQueryData([
          "wokout",
          data.workoutId,
          "logs",
          data.exerciseId,
        ]);

        queryClient.setQueryData(
          ["wokout", data.workoutId, "logs", data.exerciseId],
          (old: any = []) => {
            return [
              ...old,
              {
                id: "temp",
                workout: data.workoutId,
                exercise: data.exerciseId,
                weight: data.weight,
                reps: data.reps,
                rpe: data.rpe,
              },
            ];
          }
        );

        return { previousLogs };
      },
      onError: (err, newTodo, context: any) => {
        queryClient.setQueryData(
          ["wokout", newTodo.workoutId, "logs", newTodo.exerciseId],
          context.previousLogs
        );
      },
      onSuccess: (data, vars) => {
        queryClient.invalidateQueries([
          "wokout",
          vars.workoutId,
          "logs",
          vars.exerciseId,
        ]);
      },
    }
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

  console.log({ exercise, logs });

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
    <View className="p-4 bg-white rounded mb-2" key={exercise.id}>
      <View className="flex-row justify-between items-center">
        <Text className="font-medium">{exercise.name}</Text>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-1">
          <Text className="font-medium">{exercise.sets}</Text>
          <Text className="text-gray-500">Sets</Text>
        </View>

        <View className="flex-row gap-1">
          <Text className="font-medium">{repDisplay}</Text>
          <Text className="text-gray-500">Reps</Text>
        </View>

        <View className="flex-row gap-1">
          <Text className="font-medium">{formatRest(exercise.rest)}</Text>
          <Text className="text-gray-500">Rest</Text>
        </View>

        <View>
          {allDone ? (
            <Feather name="check" size={20} color="gray" />
          ) : (
            <Text className="text-gray-500">
              {logs?.length} / {exercise.sets}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-4">
        {logs?.map((log, index) => (
          <View className="flex-row justify-between" key={log.id}>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-500">#</Text>
              <Text className="font-medium">{index + 1}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-500">Reps</Text>
              <Text className="font-medium w-10 text-center">{log.reps}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-500">Weight</Text>
              <Text className="font-medium w-10 text-center">{log.weight}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-500">RPE</Text>
              <Text className="font-medium w-10 text-center">{log.rpe}</Text>
            </View>
          </View>
        ))}
      </View>

      {!allDone && (
        <View>
          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row gap-2 items-center">
              <Text className="text-gray-500">#</Text>
              <Text className="font-medium">{logs.length + 1}</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Text>Reps</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded bg-gray-100 p-1 w-10 text-center"
                value={reps}
                onChangeText={setReps}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text>Weight</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded bg-gray-100 p-1 w-10 text-center"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Text>RPE</Text>
              <TextInput
                keyboardType="numeric"
                className="rounded bg-gray-100 p-1 w-10 text-center"
                value={rpe}
                onChangeText={setRpe}
              />
            </View>
          </View>

          <View className="mt-4">
            <TouchableOpacity
              className="p-2 bg-gray-100 rounded flex-row items-center justify-center gap-1"
              onPress={() => {
                if (!weight || !reps || !rpe) return;

                // TODO: Add log

                mutate({
                  exerciseId: exercise.id,
                  workoutId: currentWorkoutId,
                  weight: Number(weight),
                  reps: Number(reps),
                  rpe: Number(rpe),
                });

                // useWorkoutStore.getState().addLog({
                //   setNumber:
                //     logs.filter((log) => log.exerciseId === exercise.id)
                //       .length + 1,
                //   exerciseId: exercise.id,
                //   workoutId: useWorkoutStore.getState().workout?.id!,
                //   weight: Number(weight),
                //   reps: Number(reps),
                //   rpe: Number(rpe),
                //   date: new Date(),
                // });

                setWeight("");
                setReps("");
                setRpe("");
              }}
            >
              <Feather name="plus" size={20} color="gray" />
              <Text>Add Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: async () => {
      return await pb
        .collection("exercises")
        .getFullList()
        .catch((err) => {
          if (err.code === 404) return [];
        });
    },
  });
}

function useCreateMissingExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateExercises,
      serverExercises,
    }: {
      templateExercises: any[];
      serverExercises: any[];
    }) => {
      return Promise.all(
        templateExercises.map((exercise) => {
          const exerciseData = serverExercises.find(
            (e) => e.name === exercise.name
          );

          if (!exerciseData) {
            pb.collection("exercises").create({
              name: exercise.name,
            });
          }
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["exercises"]);
    },
  });
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
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold mb-4">
        Some exercises are missing
      </Text>
      <TouchableOpacity
        className="p-2 bg-gray-100 rounded flex-row items-center justify-center gap-1"
        onPress={() => {
          createMissingExercises({
            templateExercises,
            serverExercises,
          });
        }}
      >
        <Feather name="plus" size={20} color="gray" />
        <Text>Add Exercises</Text>
      </TouchableOpacity>
    </View>
  );
}

function WorkoutScreen() {
  useKeepAwake();

  const { data: currentWorkout, isLoading } = useCurrentWorkout();
  const { data: exercises } = useExercises();

  const template = workouts.find((w) => w.id === currentWorkout?.template_id);

  if (isLoading || !currentWorkout || !template) {
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
        .map(({ id, ...exercise }) => {
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
    <ScrollView className="flex-1 bg-gray-200">
      <View className="p-4">
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

function useCurrentWorkout() {
  // useEffect(() => {
  //   pb.collection("exercises").subscribe("*", function (e) {
  //     query.refetch();
  //   });

  //   return () => {
  //     pb.collection("exercises").unsubscribe("*");
  //   };
  // }, []);

  const query = useQuery({
    queryKey: ["currentWorkout"],
    queryFn: () => {
      return pb
        .collection("workouts")
        .getFirstListItem("ended_at = null")
        .catch((err) => {
          if (err.status === 404) {
            return null;
          }
          throw err;
        });
    },
  });

  return query;
}

function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: Template) => {
      return pb.collection("workouts").create({
        template_id: template.id,
        started_at: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentWorkout"]);
    },
  });
}

function useCancelWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: string) => {
      return pb.collection("workouts").delete(workoutId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentWorkout"]);
    },
  });
}

function useFinishWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutId: string) => {
      return pb.collection("workouts").update(workoutId, {
        ended_at: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentWorkout"]);
    },
  });
}

function useCurrentUser() {
  const [user, setUser] = useState<Record | Admin | null>(pb.authStore.model);

  useEffect(() => {
    pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, []);

  return user;
}

function Router() {
  const { data: currentWorkout, isLoading } = useCurrentWorkout();

  console.log({ currentWorkout: !!currentWorkout });

  if (isLoading) return null;

  const isWorkingOut = !!currentWorkout;

  return (
    <SafeAreaView className="flex-1">
      <NavigationContainer>
        <StatusBar style="dark" />

        {isWorkingOut ? (
          <WorkoutStack />
        ) : (
          <Tab.Navigator>
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

function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => {
      return pb.admins.authWithPassword(
        data.email.toLocaleLowerCase(),
        data.password
      );
    },
  });
}

function AuthScreen() {
  const { mutate: login } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="flex-1 bg-gray-200">
      <View className="flex-1 justify-center items-center">
        <View className="flex-row items-center gap-2">
          <Feather name="user" size={40} color="gray" />
          <Text className="text-2xl font-medium">Login</Text>
        </View>

        <View className="mt-4">
          <TextInput
            className="rounded bg-gray-100 w-64 p-4 border"
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-4">
          <TextInput
            className="rounded bg-gray-100 w-64 p-4 border"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mt-4">
          <TouchableOpacity
            className="p-2 bg-teal-500 rounded flex-row items-center justify-center gap-1 w-64"
            onPress={() => {
              login({ email, password });
            }}
          >
            <Feather name="log-in" size={20} color="white" />
            <Text className="text-white">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    console.log(" focus ");

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
        className="flex-1"
        enabled
        behavior="padding"
        // keyboardVerticalOffset={100}
      >
        {user ? <Router /> : <AuthScreen />}
      </KeyboardAvoidingView>
    </QueryClientProvider>
  );
}
