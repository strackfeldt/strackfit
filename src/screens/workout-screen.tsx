import Feather from "@expo/vector-icons/Feather";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import clsx from "clsx";
import { useKeepAwake } from "expo-keep-awake";
import React, { useState } from "react";
import { Alert, Button as NButton, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "../components/button";
import { useCurrentWorkout, useCurrentWorkoutLogs, useWorkoutActions } from "../components/workout-store";
import { useCreateMissingExercises, useExercises, useLogs, usePreviousWorkout } from "../lib/api";
import workouts, { Template } from "../lib/data";

export function WorkoutSheet() {
  const currentWorkout = useCurrentWorkout();

  if (!currentWorkout) return null;

  return (
    <BottomSheet
      index={1}
      snapPoints={[80, "98%"]}
      backgroundStyle={{
        backgroundColor: "black",
      }}
      handleIndicatorStyle={{
        backgroundColor: "rgb(161 161 170)",
      }}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} />}
    >
      <WorkoutScreen currentWorkout={currentWorkout} />
    </BottomSheet>
  );
}

export function WorkoutPage() {
  const currentWorkout = useCurrentWorkout();

  if (!currentWorkout) return null;

  return <WorkoutScreen currentWorkout={currentWorkout} />;
}

export function WorkoutScreen({
  currentWorkout,
}: {
  currentWorkout: Exclude<ReturnType<typeof useCurrentWorkout>, null>;
}) {
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
      <View className="p-4 pt-0 border-b border-zinc-800">
        <Text className="text-2xl font-bold text-white">{currentWorkout.name}</Text>
      </View>
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {templateWithExercises?.exercises.map((exercise) => {
            return <Exercise currentWorkout={currentWorkout} exercise={exercise} key={exercise.id} />;
          })}
        </View>

        <View className="gap-y-4 p-4">
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
    <View className="mb-2 bg-zinc-900/20 rounded-lg p-2" key={exercise.id}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-white">{exercise.name}</Text>
      </View>

      {currentWorkout.users?.map((user, index) => {
        return (
          <View className={index === 0 ? "mt-6" : "mt-12 mb-4"} key={user.id}>
            <UserLogs exercise={exercise} user={user} currentWorkout={currentWorkout} />
          </View>
        );
      })}
    </View>
  );
}

function UserLogs({
  exercise,
  user,
  currentWorkout,
}: {
  exercise: {
    id: string;
    sets: any[];
  };
  user: any;
  currentWorkout: Exclude<ReturnType<typeof useCurrentWorkout>, null>;
}) {
  const previousWorkout = usePreviousWorkout(user.id);

  const logs = useCurrentWorkoutLogs(user.id);

  const prevlogs = useLogs(previousWorkout?.data?.id!, {
    enabled: !!previousWorkout?.data,
  });

  return (
    <>
      <View className="flex-row justify-between items-center mt-2 mb-1 border-b border-zinc-800 pb-2">
        <View className="bg-zinc-700 p-px rounded">
          <Text className="text-white w-8 text-[10px] text-center font-medium">{user.name}</Text>
        </View>
        <Text className="text-white w-8 text-[10px] text-center font-medium">Target</Text>
        <Text className="text-white w-16 text-[10px] text-center font-medium">Prev</Text>
        <Text className="text-white w-10 text-[10px] text-center font-medium">KG</Text>
        <Text className="text-white w-10 text-[10px] text-center font-medium">Reps</Text>
        <Text className="text-white w-4 text-[10px] text-center font-medium">
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
            currentWorkoutId={currentWorkout.templateId}
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
  currentWorkoutId,
  setNr,
}: {
  disabled?: boolean;
  set: any;
  currentLog?: any;
  previousLog: any;
  exerciseId: string;
  currentWorkoutId: string;
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
      <View className={clsx("flex-row justify-between mt-2", disabled && "")}>
        <View className="flex-row items-center justify-center w-8">
          {set.type === "warmup" ? (
            <Feather name="wind" size={10} color="orange" />
          ) : set.type === "dropset" ? (
            <Feather name="corner-down-left" size={10} color="indigo" />
          ) : (
            <Text className="text-xs font-bold text-white">{setNr}</Text>
          )}
        </View>

        <View className="flex-row items-center justify-center w-8">
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
              <Text className="text-xs font-bold text-white">
                {previousLog.reps}x{previousLog.weight}kg
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
              className="w-10 h-5 text-[10px] font-bold rounded bg-zinc-800 text-center text-white"
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
              className="w-10 h-5 text-[10px] font-bold rounded bg-zinc-800  text-center text-white"
            />
          )}
        </View>

        <View className="flex-row items-center justify-center w-4">
          {(!currentLog || currentLog.weight !== parseValue(weight) || currentLog.reps !== parseInt(reps)) && (
            <TouchableOpacity
              className={clsx("w-5 h-5 rounded bg-zinc-800 flex items-center justify-center", disabled && "opacity-50")}
              onPress={() => {
                if (!weight || !reps) return;

                // console.log("add log", {
                //   userId: userId,
                //   set_nr: setNr,
                //   reps: parseInt(reps),
                //   weight: parseValue(weight),
                //   exercise: exerciseId,
                //   date: new Date().toISOString(),
                // });

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
