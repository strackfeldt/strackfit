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
                name: "DB Romanian Deadlift",
                rest: 60,
                sets: [
                    //
                    { reps: 12 },
                    { reps: 12 },
                    { reps: 12 },
                ],
            },
            {
                name: "DB Split Squat",
                rest: 60,
                sets: [
                    //
                    { reps: 12 },
                    { reps: 12 },
                    { reps: 12 },
                ],
            },
            {
                name: "Bad Girl",
                rest: 60,
                sets: [
                    //
                    { reps: 20 },
                    { reps: 20 },
                    { reps: 20, type: "dropset" },
                ],
            },
            {
                name: "Machine Chest Press",
                rest: 60,
                sets: [
                    //
                    { reps: 12 },
                    { reps: 12 },
                    { reps: 12 },
                ],
            },
            {
                name: "Lat Pulldown",
                rest: 60,
                sets: [
                    //
                    { reps: 15 },
                    { reps: 15 },
                    { reps: 15, type: "dropset" },
                ],
            },
            {
                name: "Peck Deck",
                rest: 60,
                sets: [
                    //
                    { reps: 15 },
                    { reps: 15, type: "dropset" },
                ],
            },
        ],
    },
    {
        id: "18fc3678-3cfe-462e-ab39-8a76b31d1fc6",
        name: "Tag 2",
        exercises: [
            {
                name: "Romanian Deadlift",
                rest: 60,
                sets: [
                    //
                    { reps: 8 },
                    { reps: 8 },
                    { reps: 8 },
                ],
            },
            {
                name: "Squat",
                rest: 60,
                sets: [
                    //
                    { reps: 10 },
                    { reps: 10 },
                    { reps: 10 },
                ],
            },
            {
                name: "Hip Thrust",
                rest: 60,
                sets: [
                    //
                    { reps: 15 },
                    { reps: 15 },
                    { reps: 15, type: "dropset" },
                ],
            },
            {
                name: "DB Incline Chest Press",
                rest: 60,
                sets: [
                    //
                    { reps: 10 },
                    { reps: 10 },
                    { reps: 10 },
                ],
            },
            {
                name: "Cable Seated Row",
                rest: 60,
                sets: [
                    //
                    { reps: 12 },
                    { reps: 12 },
                    { reps: 12, type: "dropset" },
                ],
            },
            {
                name: "Face Pull",
                rest: 60,
                sets: [
                    //
                    { reps: 15 },
                    { reps: 15 },
                ],
            },
        ],
    },
];

export default templates;
