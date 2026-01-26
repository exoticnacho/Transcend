import { useEffect, useState } from "react";

export interface PayrollSchedule {
    id: string;
    name: string;
    frequency: "monthly" | "weekly" | "one-time";
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
    // Helper to read from storage
    const loadSchedules = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored) as PayrollSchedule[];
            } catch (e) {
                console.error("Failed to load schedules", e);
                return [];
            }
        }
        return [];
    };

    const [schedules, setSchedules] = useState<PayrollSchedule[]>([]);

    // Initial load and event listeners
    useEffect(() => {
        setSchedules(loadSchedules());

        const handleStorageChange = () => {
            setSchedules(loadSchedules());
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("scheduler:update", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("scheduler:update", handleStorageChange);
        };
    }, []);

    const saveAndDispatch = (newSchedules: PayrollSchedule[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedules));
        setSchedules(newSchedules);
        window.dispatchEvent(new Event("scheduler:update"));
    };

    const addSchedule = (
        schedule: Omit<PayrollSchedule, "id" | "createdAt">
    ) => {
        const newSchedule: PayrollSchedule = {
            ...schedule,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        const current = loadSchedules();
        const updated = [...current, newSchedule];
        saveAndDispatch(updated);

        return newSchedule;
    };

    const updateSchedule = (id: string, updates: Partial<PayrollSchedule>) => {
        const current = loadSchedules();
        const updated = current.map((schedule) =>
            schedule.id === id ? { ...schedule, ...updates } : schedule
        );
        saveAndDispatch(updated);
    };

    const deleteSchedule = (id: string) => {
        const current = loadSchedules();
        const updated = current.filter((schedule) => schedule.id !== id);
        saveAndDispatch(updated);
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
