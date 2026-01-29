import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MatrixTask, MatrixQuadrant } from "../types";

interface MatrixState {
    tasks: MatrixTask[];
    addTask: (title: string, quadrant: MatrixQuadrant) => void;
    removeTask: (id: string) => void;
    toggleTask: (id: string) => void;
}

export const useMatrixStore = create<MatrixState>()(
    persist(
        (set) => ({
            tasks: [
                { id: "1", title: "Review Chemistry Lab", quadrant: "do", completed: false, createdAt: Date.now() },
                { id: "2", title: "Internal Assessment", quadrant: "schedule", completed: false, createdAt: Date.now() },
                { id: "3", title: "Update Study Log", quadrant: "optimize", completed: false, createdAt: Date.now() },
                { id: "4", title: "Sort Emails", quadrant: "eliminate", completed: false, createdAt: Date.now() },
            ],
            addTask: (title, quadrant) =>
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        {
                            id: Math.random().toString(36).substring(7),
                            title,
                            quadrant,
                            completed: false,
                            createdAt: Date.now(),
                        },
                    ],
                })),
            removeTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),
            toggleTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                    ),
                })),
        }),
        {
            name: "matrix-storage",
        }
    )
);
