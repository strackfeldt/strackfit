import { addSeconds } from "date-fns";
import * as Notifications from "expo-notifications";
import { create } from "zustand";

export const useTimer = create<{
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
    const endTime = addSeconds(new Date(), maxLength);

    Notifications.scheduleNotificationAsync({
      content: {
        title: "Timer ended 🏋️‍♀️",
        body: "Time for your next set!",
        vibrate: [0, 500, 500, 500],
      },
      trigger: { date: endTime },
      identifier: "timer-end",
    });

    set({ timer: new Date(), maxLength, minLength });
  },
  stop: () => {
    Notifications.cancelScheduledNotificationAsync("timer-end");

    set({ timer: null, maxLength: null, minLength: null });
  },
}));
