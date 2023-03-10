export type Template = {
  id: number;
  name: string;
  exercises: Array<{
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

export const workouts: Template[] = [
  // {
  //   id: 1,
  //   name: "Legs 1",
  //   exercises: [],
  // },
  {
    id: 2,
    name: "Push 1",
    exercises: [
      {
        name: "Bench Press",
        sets: 3,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        name: "DB Seated Press",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        name: "Dips",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        name: "Peck Deck",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Skullcrusher",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
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
        name: "Neutral Pull Up",
        sets: 4,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        name: "DB Row",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        name: "BB Curl",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        name: "Lat Pulldown",
        sets: 2,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Preacher Curl",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
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
    exercises: [
      {
        name: "Machine Chest Press",
        sets: 4,
        rest: 150,
        reps: { min: 10, max: 12 },
      },
      {
        name: "Machine OHP",
        sets: 3,
        rest: 150,
        reps: { min: 10, max: 12 },
      },
      {
        name: "Chest Fly",
        sets: 3,
        rest: 120,
        reps: { min: 15, max: 20 },
      },
      {
        name: "Overhead Tricep Extension",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Cable Lateral Raise",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Tricep Pushdown",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 20 },
      },
      {
        name: "Hangin Leg Raise",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 15 },
      },
    ],
  },
  {
    id: 5,
    name: "Pull 2",
    exercises: [
      {
        name: "Chin ups",
        sets: 4,
        rest: 150,
        reps: { min: 10, max: 12 },
      },
      {
        name: "Seated Cable Row",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        name: "BB Curl",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        name: "Ring Row",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Incline Curl",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
        name: "Ring Face Pull",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 20 },
      },
      {
        name: "Hangin Leg Raise",
        sets: 3,
        rest: 90,
        reps: { min: 15, max: 15 },
      },
    ],
  },
];
