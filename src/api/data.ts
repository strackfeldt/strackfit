export type Template = {
  id: number;
  name: string;
  exercises: Array<{
    name: string;
    note?: string;
    sets: number;
    minRest?: number;
    maxRest?: number;
    minReps?: number;
    maxReps: number;
    superset?: "a" | "b" | "c" | "d" | "e";
  }>;
};

const ULPPL: Template[] = [
  {
    id: 1,
    name: "Upper",
    exercises: [
      { name: "Bench Press", sets: 3, minRest: 120, maxRest: 180, minReps: 4, maxReps: 6 },
      { name: "Neutral Pull Up", sets: 3, minRest: 120, maxRest: 180, minReps: 6, maxReps: 8 },
      { name: "Handstand Push Up", sets: 3, minRest: 120, maxRest: 180, minReps: 8, maxReps: 10 },
      { name: "DB Row", sets: 3, minRest: 60, maxRest: 120, minReps: 10, maxReps: 12 },
      { name: "Lateral Raise", sets: 3, minRest: 60, maxRest: 120, minReps: 12, maxReps: 15 },
      { name: "BB Curl", sets: 3, minReps: 12, maxReps: 15, superset: "a" }, //                        Superset
      { name: "Skullcrusher", sets: 3, maxRest: 60, minReps: 12, maxReps: 15, superset: "a" }, //      Superset
      { name: "Hanging Leg Raise", sets: 4, minRest: 60, maxRest: 120, minReps: 15, maxReps: 15 },
    ],
  },
  {
    id: 2,
    name: "Lower",
    exercises: [
      { name: "Back Squat", sets: 4, minRest: 120, maxRest: 180, minReps: 4, maxReps: 4 },
      { name: "Stiff Leg Deadlift", sets: 3, maxRest: 150, minReps: 10, maxReps: 12 },
      { name: "Dumbbell Walking Lunge", sets: 2, maxRest: 120, minReps: 20, maxReps: 20 },
      { name: "Leg Curl", sets: 3, maxRest: 90, minReps: 15, maxReps: 15 },
      { name: "Leg Extension", sets: 3, maxRest: 90, minReps: 15, maxReps: 15 },
      { name: "Standing Calf Raise", sets: 4, maxRest: 90, minReps: 15, maxReps: 20 },
      { name: "Hanging Leg Raise", sets: 4, maxRest: 90, minReps: 15, maxReps: 15 },
    ],
  },
  {
    id: 3,
    name: "Push",
    exercises: [
      { name: "Machine Chest Press", sets: 4, maxRest: 150, minReps: 10, maxReps: 12 },
      { name: "DB Seated Press", sets: 3, maxRest: 120, minReps: 10, maxReps: 12 },
      { name: "Dips", sets: 2, maxRest: 120, minReps: 10, maxReps: 12 },
      { name: "Peck Deck", sets: 3, maxRest: 120, minReps: 12, maxReps: 15 },
      { name: "Overhead Tricep Extension", sets: 3, maxRest: 120, minReps: 12, maxReps: 15 },
      { name: "Cable Lateral Raise", sets: 3, maxRest: 120, minReps: 15, maxReps: 20 },
      { name: "Hanging Leg Raise", sets: 4, maxRest: 90, minReps: 15, maxReps: 20 },
    ],
  },
  {
    id: 4,
    name: "Pull",
    exercises: [
      { name: "Chin ups", sets: 4, maxRest: 150, minReps: 10, maxReps: 12 },
      { name: "Seated Cable Row", sets: 3, maxRest: 120, minReps: 10, maxReps: 12 },
      { name: "Lat Pulldown", sets: 2, maxRest: 120, minReps: 12, maxReps: 15 },
      { name: "BB Curl", sets: 3, maxRest: 120, minReps: 10, maxReps: 12 },
      { name: "Incline Curl", sets: 3, maxRest: 90, minReps: 12, maxReps: 15 },
      { name: "Ring Face Pull", sets: 3, maxRest: 90, minReps: 15, maxReps: 20 },
      { name: "Hanging Leg Raise", sets: 4, maxRest: 90, minReps: 15, maxReps: 20 },
    ],
  },
  {
    id: 5,
    name: "Legs",
    exercises: [
      { name: "Deadlift", sets: 2, maxRest: 180, minReps: 4, maxReps: 6 },
      { name: "Bulgarian Split Squats", sets: 2, maxRest: 180, minReps: 8, maxReps: 10 },
      { name: "Hip Thrust", sets: 4, maxRest: 180, minReps: 10, maxReps: 12 },
      { name: "Unilateral Leg Press", sets: 3, maxRest: 120, minReps: 12, maxReps: 15 },
      //
      //
      { name: "Hanging Leg Raise", sets: 4, maxRest: 90, minReps: 15, maxReps: 15 },
    ],
  },
];

export default ULPPL;
