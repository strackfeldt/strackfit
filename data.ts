
export type Template = {
  id: number;
  name: string;
  exercises: Array<{
    id: number;
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
  {
    id: 1,
    name: "Legs 1",
    exercises: [],
  },
  {
    id: 2,
    name: "Push 1",
    exercises: [
      {
        id: 1,
        name: "Bench Press",
        sets: 3,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        id: 2,
        name: "DB Seated Press",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        id: 3,
        name: "Dips",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        id: 4,
        name: "Peck Deck",
        sets: 3,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        id: 5,
        name: "Skullcrusher",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
        id: 6,
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
        id: 1,
        name: "Neutral Pull Up",
        sets: 4,
        rest: 150,
        reps: { min: 6, max: 8 },
      },
      {
        id: 2,
        name: "DB Row",
        sets: 3,
        rest: 120,
        reps: { min: 10, max: 12 },
      },
      {
        id: 3,
        name: "BB Curl",
        sets: 3,
        rest: 120,
        reps: { min: 8, max: 12 },
      },
      {
        id: 4,
        name: "Lat Pulldown",
        sets: 2,
        rest: 120,
        reps: { min: 12, max: 15 },
      },
      {
        id: 5,
        name: "Preacher Curl",
        sets: 3,
        rest: 90,
        reps: { min: 12, max: 15 },
      },
      {
        id: 6,
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
    exercises: [],
  },
  {
    id: 5,
    name: "Pull 2",
    exercises: [],
  },
];
