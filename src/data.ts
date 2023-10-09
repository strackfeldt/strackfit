export type Template = {
  id: number;
  name: string;
  exercises: Array<{
    name: string;
    note?: string;
    sets: number;
    minRest?: number;
    maxRest?: number;
    reps?: number;
  }>;
};

const templates: Template[] = [
  {
    id: 1,
    name: "Full Body 1",
    exercises: [
      { name: "Back Squat", sets: 3, reps: 6, minRest: 120, maxRest: 180 },
      { name: "Romanian Deadlift", sets: 3, reps: 12, minRest: 90, maxRest: 120 },
      { name: "Barbell Bench Press", sets: 3, reps: 8, minRest: 120, maxRest: 180 },
      { name: "Lat Pulldown", sets: 3, reps: 10, minRest: 60, maxRest: 90 },
      { name: "Dips", sets: 3, reps: 8, minRest: 60, maxRest: 90 },
      { name: "Heyperextension", sets: 3, reps: 20, minRest: 60, maxRest: 90 },
      { name: "DB Curls", sets: 3, reps: 8, minRest: 60, maxRest: 90 },
    ],
  },
  {
    id: 2,
    name: "Full Body 2",
    exercises: [
      { name: "Deadlift", sets: 3, reps: 5, minRest: 120, maxRest: 180 },
      { name: "Push Press", sets: 3, reps: 8, minRest: 120, maxRest: 180 },
      { name: "Helms Row", sets: 3, reps: 12, minRest: 90, maxRest: 120 },
      { name: "Leg Extension", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
      { name: "Cable Fly", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
      { name: "Reverse Fly", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
      { name: "Dumbbell Skull Crusher", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
    ],
  },
  {
    id: 3,
    name: "Full Body 3",
    exercises: [
      { name: "Pull Up", sets: 3, reps: 10, minRest: 120, maxRest: 180 },
      { name: "Dumbbell Walking Lunge", sets: 3, reps: 10, minRest: 90, maxRest: 120 },
      { name: "Dumbbell Incline Press", sets: 3, reps: 10, minRest: 90, maxRest: 120 },
      { name: "Barbell Hip Thrust", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
      { name: "Seated Face Pull", sets: 3, reps: 12, minRest: 60, maxRest: 90 },
      { name: "Dumbbell Lateral Raise", sets: 3, reps: 10, minRest: 60, maxRest: 90 },
      { name: "Leg Curl", sets: 3, reps: 10, minRest: 60, maxRest: 90 },
    ],
  },
];

export default templates;
