import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Admin, Record } from "pocketbase";
import { useEffect, useState } from "react";
import { pb } from "./pb";

const TEMP_ID = "__temp__";

export function isOptimistic(record: Record) {
  return record.id === TEMP_ID;
}

export function useCurrentUser() {
  const [user, setUser] = useState<Record | Admin | null>(pb.authStore.model);

  useEffect(() => {
    pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
  }, []);

  return user;
}
export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => {
      return pb.admins.authWithPassword(data.email.toLocaleLowerCase(), data.password);
    },
  });
}
export function useLogout() {
  return () => pb.authStore.clear();
}
export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: () => pb.collection("workouts").getFullList({ sort: "-started_at" }),
  });
}
export function useCurrentWorkout() {
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
export function useStartWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: { id: number; name: string }) => {
      return pb.collection("workouts").create({
        name: template.name,
        template_id: template.id,
        started_at: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["currentWorkout"]);
    },
  });
}
export function useCancelWorkout() {
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
export function useFinishWorkout() {
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
export function useExercises() {
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
export function useCreateMissingExercises() {
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
          const exerciseData = serverExercises.find((e) => e.name === exercise.name);

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
export function useLogs(workoutId: string, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["wokout", workoutId, "logs"],
    queryFn: () => {
      return pb.collection("logs").getFullList({
        filter: `workout = "${workoutId}"`,
        sort: "created",
      });
    },
    enabled: opts?.enabled,
  });
}
export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { workoutId: string; exerciseId: string; weight: number; reps: number; rpe: number }) => {
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
          queryKey: ["wokout", data.workoutId, "logs"],
        });

        const previousLogs = queryClient.getQueryData(["wokout", data.workoutId, "logs"]);

        queryClient.setQueryData(["wokout", data.workoutId, "logs"], (old: any = []) => {
          return [
            ...old,
            {
              id: TEMP_ID,
              workout: data.workoutId,
              exercise: data.exerciseId,
              weight: data.weight,
              reps: data.reps,
              rpe: data.rpe,
            },
          ];
        });

        return { previousLogs };
      },
      onError: (err, newTodo, context: any) => {
        queryClient.setQueryData(["wokout", newTodo.workoutId, "logs"], context.previousLogs);
      },
      onSuccess: (data, vars) => {
        queryClient.invalidateQueries(["wokout", vars.workoutId, "logs"]);
      },
    }
  );
}
