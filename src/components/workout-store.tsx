import * as SecureStorage from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { pb } from "../lib/pb";

const initialState = {
  startedAt: null,
  name: null,
  templateId: null,
  users: null,
  logs: [],
};

const useWorkoutStore = create(
  persist<{
    startedAt: Date | null;
    name: string | null;
    templateId: string | null;
    users: Array<{
      id: string;
      name: string;
    }> | null;

    logs: any[];

    actions: {
      start: (data: {
        name: string;
        templateId: string;
        users: Array<{
          id: string;
          name: string;
        }>;
      }) => void;
      stop: () => void;
      finish: () => void;

      addLog: (log: any) => void;
    };
  }>(
    (set) => ({
      ...initialState,

      actions: {
        start: (data) =>
          set({
            startedAt: new Date(),
            name: data.name,
            templateId: data.templateId,
            users: data.users,
          }),

        stop: () => set(initialState),

        finish: () =>
          set((state) => {
            const workouts = state.users!.map((user) => {
              const logs = state.logs.filter((log) => log.userId === user.id);

              return {
                name: state.name,
                template_id: state.templateId,
                started_at: state.startedAt,
                ended_at: new Date(),
                user: user.id,
                logs,
              };
            });

            for (const workout of workouts) {
              if (!workout.logs.length) {
                continue;
              }

              pb.collection("workouts")
                .create(
                  {
                    name: workout.name,
                    template_id: workout.template_id,
                    started_at: workout.started_at,
                    ended_at: workout.ended_at,
                    user: workout.user,
                  },
                  { $autoCancel: false }
                )
                .then((res) => {
                  for (const log of workout.logs) {
                    pb.collection("logs").create(
                      {
                        workout: res.id,
                        exercise: log.exercise,
                        set_nr: log.set_nr,
                        weight: log.weight,
                        date: log.date,
                        reps: log.reps,
                      },
                      { $autoCancel: false }
                    );
                  }
                });
            }

            return initialState;
          }),

        addLog: (log) =>
          set((state) => {
            const existingLog = state.logs.find(
              (l) => l.userId === log.userId && l.exerciseId === log.exerciseId && l.set_nr === log.set_nr
            );

            if (existingLog) {
              return {
                ...state,
                logs: state.logs.map((l) => {
                  if (l.id === existingLog.id) {
                    return log;
                  }

                  return l;
                }),
              };
            }

            log.id = "temp_" + state.logs.length + 1;

            const logs = [...state.logs, log];

            return {
              ...state,
              logs,
            };
          }),
      },
    }),
    {
      name: "workout",
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: async (key) => {
          const value = await SecureStorage.getItemAsync(key);

          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await SecureStorage.setItemAsync(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await SecureStorage.deleteItemAsync(key);
        },
      })),
      merge: (persistedState, currentState) => {
        return {
          ...(persistedState as any),
          actions: currentState.actions,
        };
      },
    }
  )
);

export const useWorkoutActions = () => useWorkoutStore((state) => state.actions);

export const useCurrentWorkout = () =>
  useWorkoutStore((state) =>
    state.startedAt
      ? {
          name: state.name!,
          templateId: state.templateId!,
          users: state.users!,
          startedAt: state.startedAt!,
          logs: state.logs,
        }
      : null
  );

export const useCurrentWorkoutLogs = (userId: string) =>
  useWorkoutStore((state) => state.logs)?.filter((log: any) => log.userId === userId) ?? [];
