import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { create } from "zustand";

type WorkoutTemplate = {
  id: number;
  name: string;
  exercises: Array<{
    id: number;
    name: string;
    note?: string;
    sets: number;
    reps: {
      min: number;
      max: number;
    };
  }>;
};

const workouts = [
  {
    id: 1,
    name: "Day 1",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 4,
        reps: {
          min: 8,
          max: 10,
        },
      },
      {
        id: 2,
        name: "Neutral Pull Up",
        note: "10-12 reps",
        sets: 4,
        reps: {
          min: 10,
          max: 12,
        },
      },
      {
        id: 3,
        name: "BB Curl",
        note: "12-15 reps",
        sets: 3,
        reps: {
          min: 12,
          max: 15,
        },
      },
    ],
  },
  {
    id: 2,
    name: "Day 2",
    exercises: [],
  },
  {
    id: 3,
    name: "Day 3",
    exercises: [],
  },
  {
    id: 4,
    name: "Day 4",
    exercises: [],
  },
  {
    id: 5,
    name: "Arms (optional)",
    exercises: [],
  },
] satisfies WorkoutTemplate[];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-gray-200 gap-2 p-4">
      {workouts.map((workout) => (
        <TouchableOpacity
          className="p-4 bg-white rounded"
          key={workout.id}
          onPress={() => navigation.navigate("Details", { workout })}
        >
          <Text>{workout.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DetailsScreen({ route, navigation }: { route: any; navigation: any }) {
  const setWorkout = useWorkoutStore((state) => state.setWorkout);

  const workout: WorkoutTemplate = route.params?.workout;

  useEffect(() => {
    if (!workout) navigation.navigate("Home");
  }, []);

  if (!workout) return null;

  return (
    <View className="flex-1 bg-gray-200 items-center justify-center">
      <TouchableOpacity
        className="p-4 bg-white rounded"
        onPress={() => {
          setWorkout({
            id: 1,
            templateId: workout.id,
            template: workout,
            startDate: new Date(),
          });
        }}
      >
        <Text>Start {workout.name}</Text>
      </TouchableOpacity>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View className="flex-1 bg-gray-200 items-center justify-center">
      <Text className="">Settings Screen</Text>
    </View>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

type Workout = {
  id: number;
  templateId: number;
  template: WorkoutTemplate;
  startDate: Date;
  endDate?: Date;
};

type Log = {
  workoutId: number;
  exerciseId: number;
  setNumber: number;
  reps: number;
  weight: number;
  date: Date;
};

const useWorkoutStore = create<{
  workout: Workout | null;
  logs: Log[];

  setWorkout: (workout: Workout | null) => void;
  addLog: (log: Log) => void;
  removeLog: (log: Log) => void;
}>((set) => ({
  workout: null,
  logs: [],
  setWorkout: (workout) => set({ workout }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  removeLog: (log) =>
    set((state) => ({
      logs: state.logs.filter((l) => {
        return (
          l.workoutId !== log.workoutId &&
          l.exerciseId !== log.exerciseId &&
          l.setNumber !== log.setNumber
        );
      }),
    })),
}));

function WorkoutStack() {
  const workout = useWorkoutStore((state) => state.workout);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={"Workout"}
        component={WorkoutScreen}
        options={{
          title: workout?.template.name,
          headerLeft: () => (
            <TouchableOpacity
              className="p-4"
              onPress={() => useWorkoutStore.getState().setWorkout(null)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="p-4">
              <Text>Finish</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="Exercise"
        component={ExerciseScreen}
        options={({ route }: { route: any }) => ({
          title: route.params.exercise.name,
        })}
      />
    </Stack.Navigator>
  );
}

function WorkoutScreen({ navigation }: { navigation: any }) {
  const { workout, logs } = useWorkoutStore((state) => ({
    workout: state.workout,
    logs: state.logs,
  }));

  return (
    <ScrollView className="flex-1 bg-gray-200 p-4 gap-2">
      {workout?.template.exercises.map((exercise, index) => {
        const allDone =
          logs.filter((log) => log.exerciseId === exercise.id).length >=
          exercise.sets;

        return (
          <TouchableOpacity
            className="p-4 bg-white rounded flex-row justify-between items-center"
            key={exercise.id}
            onPress={() => {
              navigation.navigate("Exercise", { exercise });
            }}
          >
            <Text className="font-medium">{exercise.name}</Text>

            <View>
              {allDone ? (
                <Feather name="check" size={20} color="gray" />
              ) : (
                <Feather name="chevron-right" size={20} color="gray" />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ExerciseScreen({ route }: { route: any }) {
  const { workout, logs } = useWorkoutStore((state) => ({
    workout: state.workout,
    logs: state.logs,
  }));

  const exercise = route.params.exercise;

  const currentSet =
    logs.filter((log) => log.exerciseId === exercise.id).length + 1;

  const [weight, setWeight] = useState("0");
  const [reps, setReps] = useState("0");

  return (
    <View className="bg-gray-200 p-4 flex-1 gap-2 items-center">
      <View className="p-4 bg-white rounded max-w-xs w-full">
        <View className="flex-row items-center justify-between">
          <Text>Set</Text>
          <Text>{currentSet}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text>Weight</Text>
          <TextInput
            className="w-10 h-6 border px-1 text-center rounded border-gray-300 bg-gray-100"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text>Reps</Text>
          <TextInput
            className="w-10 h-6 border px-1 text-center rounded border-gray-300 bg-gray-100"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
        </View>

        <TouchableOpacity
          className="p-2 bg-blue-500 rounded mt-4"
          onPress={() => {
            useWorkoutStore.getState().addLog({
              exerciseId: exercise.id,
              weight: parseInt(weight),
              reps: parseInt(reps),
              setNumber: currentSet,
              workoutId: workout!.id,
              date: new Date(),
            });
          }}
        >
          <Text className="text-white text-center">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const workingOut = useWorkoutStore((state) => state.workout) !== null;

  return (
    <View className="flex-1">
      <NavigationContainer>
        <StatusBar style="dark" />
        {workingOut ? (
          <WorkoutStack />
        ) : (
          <Tab.Navigator
          // tabBar={(props) => <MyTabBar {...props} />}
          // screenOptions={{
          //   tabBarStyle: { position: "absolute" },
          // }}
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
    </View>
  );
}
