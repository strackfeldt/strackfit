import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Admin, Record } from "pocketbase";
import { useEffect, useState } from "react";
import { pb } from "./pb";

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
    mutationFn: (data: { username: string; password: string }) => {
      return pb.collection("users").authWithPassword(data.username.toLocaleLowerCase(), data.password);
    },
  });
}
export function useLogout() {
  return () => pb.authStore.clear();
}

export function useWorkouts() {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: () =>
      pb.collection("workouts").getFullList({ sort: "-started_at", filter: `user = "${pb.authStore.model?.id}"` }),
  });
}

export function usePreviousWorkout(userId: string, templateId: string) {
  return useQuery({
    queryKey: ["previousWorkout", { userId, templateId }],
    queryFn: () =>
      pb
        .collection("workouts")
        .getList(1, 1, {
          filter: `user = "${userId}" && template_id = "${templateId}"`,
          sort: "-started_at",
        })
        .then((res) => {
          if (res.items.length) return res.items[0];
          return null;
        })
        .catch((err) => {
          if (err.code === 404) return null;
        }),
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
