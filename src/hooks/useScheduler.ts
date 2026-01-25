import { useEffect, useState } from "react";

export interface PayrollSchedule {
    id: string;
    name: string;
    frequency: "monthly" | "weekly" | "biweekly" | "one-time";
    dayOfMonth?: number; // 1-28 for monthly
    dayOfWeek?: number; // 0-6 for weekly (0=Sunday)
    nextRunAt: string; // ISO date string
    csvData?: string; // Raw CSV content
    recipients: Array<{
        address: string;
        amount: string;
        token: string;
    }>;
    enabled: boolean;
    createdAt: string;
}

const STORAGE_KEY = "transcend_scheduler";

export function useScheduler() {
    const [schedules, setSchedules] = useState<PayrollSchedule[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setSchedules(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load schedules", e);
            }
        }
    }, []);

    // Save to localStorage whenever schedules change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    }, [schedules]);

    const addSchedule = (
        schedule: Omit<PayrollSchedule, "id" | "createdAt">
    ) => {
        const newSchedule: PayrollSchedule = {
            ...schedule,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        setSchedules((prev) => [...prev, newSchedule]);
        return newSchedule;
    };

    const updateSchedule = (id: string, updates: Partial<PayrollSchedule>) => {
        setSchedules((prev) =>
            prev.map((schedule) =>
                schedule.id === id ? { ...schedule, ...updates } : schedule
            )
        );
    };

    const deleteSchedule = (id: string) => {
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    };

    const getDueSchedules = () => {
        const now = new Date();
        return schedules.filter((schedule) => {
            if (!schedule.enabled) return false;
            const nextRun = new Date(schedule.nextRunAt);
            return nextRun <= now;
        });
    };

    const getUpcomingSchedules = () => {
        const now = new Date();
        return schedules.filter((schedule) => {
            if (!schedule.enabled) return false;
            const nextRun = new Date(schedule.nextRunAt);
            return nextRun > now;
        });
    };

    return {
        schedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getDueSchedules,
        getUpcomingSchedules,
    };
}
