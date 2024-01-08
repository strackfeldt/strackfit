import Feather from "@expo/vector-icons/Feather";
import clsx from "clsx";
import { useKeepAwake } from "expo-keep-awake";
import React, { useState } from "react";
import { Alert, Button as NButton, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "../components/button";
import { useCurrentWorkout, useCurrentWorkoutLogs, useWorkoutActions } from "../components/workout-store";
import { useCreateMissingExercises, useExercises, useLogs, usePreviousWorkout } from "../lib/api";
import workouts, { Template } from "../lib/data";

export function WorkoutScreenWrapper() {
  const currentWorkout = useCurrentWorkout();

  if (!currentWorkout) return null;

  return <WorkoutScreen currentWorkout={currentWorkout} />;
}

function WorkoutScreen({ currentWorkout }: { currentWorkout: Exclude<ReturnType<typeof useCurrentWorkout>, null> }) {
  useKeepAwake();

  const { data: exercises } = useExercises();

  const { stop, finish } = useWorkoutActions();

  const template = workouts.find((w) => w.id === currentWorkout?.templateId);

  if (!exercises || !template) {
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

          if (!exerciseData) return null;

          return {
            ...exercise,
            id: exerciseData?.id,
            logs: currentWorkout.logs?.filter((log) => log.exerciseId === exerciseData.id) ?? [],
            previousLogs: [],
          };
        })
        .filter((exercise): exercise is Exclude<typeof exercise, null> => {
          return !!exercise;
        }) ?? [],
  };

  return (
    <>
      <View className="px-4 py-2 pt-0 border-b border-zinc-800">
        <Text className="text-xl font-bold text-white">{currentWorkout.name}</Text>
      </View>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View>
          {templateWithExercises?.exercises.map((exercise) => {
            return <Exercise currentWorkout={currentWorkout} exercise={exercise} key={exercise.id} />;
          })}
        </View>

        <View className="space-y-4">
          <View>
            <NButton
              onPress={() => {
                Alert.alert("Are you sure?", "This will cancel the workout", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      stop();
                    },
                  },
                ]);
              }}
              title="Cancel Workout"
              color="red"
            />
          </View>
          <View>
            <NButton
              onPress={() => {
                Alert.alert("Are you sure?", "This will finish the workout", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: () => {
                      finish();
                    },
                  },
                ]);
              }}
              title="Finish Workout"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

function Exercise({
  exercise,
  currentWorkout,
}: {
  exercise: Omit<Template["exercises"][number], "id"> & { id: string; logs: any[]; previousLogs: any[] };
  currentWorkout: Exclude<ReturnType<typeof useCurrentWorkout>, null>;
}) {
  const allDone = exercise.logs.length >= exercise.sets.length;

  return (
    <View className="mb-12" key={exercise.id}>
      <View className="flex-row items-center px-4 py-2 bg-zinc-900">
        <Text className="text-sm font-bold text-white">{exercise.name}</Text>
      </View>

      <View className="px-4 py-2 mt-1">
        {currentWorkout.users?.map((user, index) => {
          return (
            <View className={index === 0 ? "" : "mt-12"} key={user.id}>
              <UserLogs exercise={exercise} user={user} templateId={currentWorkout.templateId} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function UserLogs({
  templateId,
  exercise,
  user,
}: {
  templateId: string;
  exercise: {
    id: string;
    sets: any[];
  };
  user: any;
}) {
  const previousWorkout = usePreviousWorkout(user.id, templateId);

  const logs = useCurrentWorkoutLogs(user.id);

  const prevlogs = useLogs(previousWorkout?.data?.id!, {
    enabled: !!previousWorkout?.data,
  });

  return (
    <>
      <View className="flex-row">
        <View className="bg-zinc-900 px-2 py-px rounded">
          <Text className="text-white wtext-sm text-center font-medium">{user.name}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-2 mb-1 border-b border-zinc-800 pb-2">
        <Text className="text-white w-4 text-xs text-center font-bold">#</Text>
        <Text className="text-white w-10 text-xs text-center font-bold">Target</Text>
        <Text className="text-white w-16 text-xs text-center font-bold">Prev</Text>
        <Text className="text-white w-10 text-xs text-center font-bold">KG</Text>
        <Text className="text-white w-10 text-xs text-center font-bold">Reps</Text>
        <Text className="text-white w-4 text-xs text-center font-bold">
          <Feather name="check" size={12} />
        </Text>
      </View>

      {exercise.sets.map((set, index) => {
        const previousLog = prevlogs.data?.find((log) => log.exercise === exercise.id && log.set_nr === index + 1);
        const currentLog = logs?.find((log) => log.exercise === exercise.id && log.set_nr === index + 1);

        const disabled = !currentLog && index !== logs?.filter((l) => l.exercise === exercise.id).length;

        return (
          <SetDataInput
            setNr={index + 1}
            disabled={disabled}
            key={index}
            set={set}
            userId={user.id}
            exerciseId={exercise.id}
            currentLog={currentLog}
            previousLog={previousLog}
          />
        );
      })}
    </>
  );
}

function SetDataInput({
  disabled,
  set,
  currentLog,
  previousLog,
  userId,
  exerciseId,
  setNr,
}: {
  disabled?: boolean;
  set: any;
  currentLog?: any;
  previousLog: any;
  exerciseId: string;
  userId: string;
  setNr: number;
}) {
  const { addLog } = useWorkoutActions();

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  function limitLength(setter: any) {
    return (text: string) => {
      if (text.length > 6) return;

      setter(text);
    };
  }

  return (
    <>
      <View className="flex-row justify-between mt-2">
        <View className="flex-row items-center justify-center w-4">
          {set.type === "warmup" ? (
            <Feather name="wind" size={10} color="orange" />
          ) : set.type === "dropset" ? (
            <Feather name="corner-down-left" size={10} color="indigo" />
          ) : (
            <Text className="text-xs font-bold text-white">{setNr}</Text>
          )}
        </View>

        <View className="flex-row items-center justify-center w-10">
          <Text className="text-xs font-bold text-center text-white">{set.reps}</Text>
        </View>

        <View className="flex-row justify-center items-center w-16">
          {previousLog ? (
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={disabled}
              onPress={() => {
                setWeight(previousLog.weight.toString());
                setReps(previousLog.reps.toString());
              }}
            >
              <Text className="text-[10px] font-bold text-white">
                {previousLog.reps}x{previousLog.weight}KG
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-xs font-bold text-white">-</Text>
          )}
        </View>

        <View className="flex-row items-center justify-center w-10">
          {disabled ? (
            <Text className="text-xs font-bold text-center text-white">-</Text>
          ) : (
            <TextInput
              value={weight}
              onChangeText={limitLength(setWeight)}
              keyboardType="numeric"
              className="w-10 h-5 text-xs font-bold rounded bg-zinc-800 text-center text-white"
            />
          )}
        </View>
        <View className="flex-row items-center justify-center w-10">
          {disabled ? (
            <Text className="text-xs font-bold text-center text-white">-</Text>
          ) : (
            <TextInput
              value={reps}
              onChangeText={limitLength(setReps)}
              keyboardType="numeric"
              className="w-10 h-5 text-xs font-bold rounded bg-zinc-800  text-center text-white"
            />
          )}
        </View>

        <View className="flex-row items-center justify-center w-4">
          {(!currentLog || currentLog.weight !== parseValue(weight) || currentLog.reps !== parseInt(reps)) && (
            <TouchableOpacity
              className={clsx("w-5 h-5 rounded bg-zinc-800 flex items-center justify-center", disabled && "opacity-50")}
              onPress={() => {
                if (!weight || !reps) return;

                addLog({
                  userId: userId,
                  set_nr: setNr,
                  reps: parseInt(reps),
                  weight: parseValue(weight),
                  exercise: exerciseId,
                  date: new Date().toISOString(),
                });
              }}
            >
              <Feather name={currentLog ? "refresh-cw" : "check"} size={10} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
    <View className="flex-1 justify-center bg-zinc-800 p-16">
      <Text className="mb-3 text-center text-lg font-bold text-white">Some exercises are missing</Text>

      <View className="mb-6">
        {templateExercises
          .filter((t) => !serverExercises.find((s) => s.name === t.name))
          .map((t) => (
            <Text key={t.name} className="text-sm text-white text-center">
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

function parseValue(value: string) {
  if (value.includes(",")) {
    const clean = value.replace(",", ".");

    return parseFloat(clean);
  } else if (value.includes(".")) {
    return parseFloat(value);
  }

  return parseInt(value);
}
