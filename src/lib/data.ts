export type Template = {
  id: string;
  name: string;
  exercises: Array<{
    name: string;
    rest: number;
    sets: Array<Set>;
  }>;
};

export type Set = {
  type?: "warmup" | "dropset";
  reps: number;
  weight?: number;
};

const templates: Template[] = [
  {
    id: "34acea5a-dd77-43e6-92e6-50bacdff2c18",
    name: "Tag 1",
    exercises: [
      {
        name: "Machine Chest Press",
        rest: 60,
        sets: [{ reps: 10, type: "warmup" }, { reps: 8 }, { reps: 10 }],
      },
      {
        name: "Barbell Romanian Deadlift",
        rest: 60,
        sets: [{ reps: 10, type: "warmup" }, { reps: 10 }, { reps: 10 }],
      },
      {
        name: "Lat Pulldown",
        rest: 60,
        sets: [{ reps: 10, type: "warmup" }, { reps: 10 }, { reps: 10 }],
      },
      {
        name: "Cable Lateral Raise",
        rest: 60,
        sets: [{ reps: 10 }, { reps: 10, type: "dropset" }],
      },
      {
        name: "Dumbbell Walking Lunge",
        rest: 60,
        sets: [{ reps: 10 }, { reps: 10, type: "dropset" }],
      },
    ],
  },
  {
    id: "18fc3678-3cfe-462e-ab39-8a76b31d1fc6",
    name: "Tag 2",
    exercises: [
      {
        name: "Machine Leg Press",
        rest: 60,
        sets: [{ reps: 12, type: "warmup" }, { reps: 8, type: "warmup" }, { reps: 6 }, { reps: 12 }],
      },
      {
        name: "Machine Incline Chest Press",
        rest: 60,
        sets: [{ reps: 10, type: "warmup" }, { reps: 10 }, { reps: 10 }],
      },
      {
        name: "Machine Seated Leg Curl",
        rest: 60,
        sets: [{ reps: 12 }, { reps: 12, type: "dropset" }],
      },
      {
        name: "Machine Seated Row",
        rest: 60,
        sets: [{ reps: 12 }, { reps: 12 }],
      },
      {
        name: "Dumbbell Bicep Curl",
        rest: 60,
        sets: [{ reps: 12 }, { reps: 12, type: "dropset" }],
      },
    ],
  },
];

export default templates;
