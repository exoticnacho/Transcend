"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { PayrollSchedule, useScheduler } from "@/hooks/useScheduler";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    FaClock,
    FaCalendarAlt,
    FaBell,
    FaPlay,
    FaTrash,
    FaToggleOn,
    FaToggleOff,
    FaExclamationCircle,
} from "react-icons/fa";
import { formatDistance } from "date-fns";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export default function SchedulerPage() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <main className="flex flex-col min-h-screen bg-[#020202] text-white font-sans relative overflow-x-hidden">
                    <Navbar />

                    {/* Background */}
                    <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-orange-900/20 via-red-900/10 to-transparent pointer-events-none z-0" />
                    <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
                        <div className="w-full max-w-6xl">
                            <HeaderSection />
                            <SchedulerContent />
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto border-t border-orange-900/20 bg-[#020202]">
                        <Footer />
                    </div>
                </main>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

function HeaderSection() {
    return (
        <div className="mb-10 text-center border-b border-orange-500/20 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                <FaClock /> Payroll Scheduler
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                Scheduled{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-500 to-red-600">
                    Payrolls
                </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Set up automated reminders for recurring payroll distributions.
            </p>
        </div>
    );
}

function SchedulerContent() {
    const {
        schedules,
        updateSchedule,
        deleteSchedule,
        getDueSchedules,
        getUpcomingSchedules,
    } = useScheduler();

    const dueSchedules = getDueSchedules();
    const upcomingSchedules = getUpcomingSchedules();

    return (
        <div className="space-y-8">
            {/* Due Schedules Alert */}
            {dueSchedules.length > 0 && (
                <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <FaBell className="text-red-500 text-2xl" />
                        <h2 className="text-xl font-bold text-red-400">
                            {dueSchedules.length} Payroll{dueSchedules.length > 1 ? "s" : ""}{" "}
                            Due!
                        </h2>
                    </div>
                    <p className="text-gray-300 mb-4">
                        The following scheduled payrolls are ready to execute.
                    </p>
                    <div className="space-y-3">
                        {dueSchedules.map((schedule) => (
                            <DueScheduleCard
                                key={schedule.id}
                                schedule={schedule}
                                onExecute={() => {
                                    const isEnterprise = schedule.name.includes("(Enterprise)");
                                    const storageKey = isEnterprise
                                        ? "transcend_draft_payroll_enterprise"
                                        : "transcend_draft_payroll";
                                    const redirectUrl = isEnterprise ? "/enterprise" : "/dashboard";

                                    sessionStorage.setItem(
                                        storageKey,
                                        JSON.stringify(schedule.recipients)
                                    );
                                    window.location.href = redirectUrl;
                                }}
                                onDelete={() => deleteSchedule(schedule.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Schedules */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <FaCalendarAlt /> Upcoming Schedules
                </h2>

                {upcomingSchedules.length === 0 && dueSchedules.length === 0 && (
                    <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/5">
                        <FaClock className="mx-auto text-6xl text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-4">No scheduled payrolls</p>
                        <p className="text-sm text-gray-500">
                            Create schedules from the Dashboard or Enterprise pages.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {upcomingSchedules.map((schedule) => (
                        <ScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            onToggle={() =>
                                updateSchedule(schedule.id, { enabled: !schedule.enabled })
                            }
                            onDelete={() => {
                                if (confirm(`Delete schedule "${schedule.name}"?`)) {
                                    deleteSchedule(schedule.id);
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Inactive Schedules */}
            {schedules.filter((s) => !s.enabled).length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-500 mb-4 flex items-center gap-3">
                        Inactive Schedules
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {schedules
                            .filter((s) => !s.enabled)
                            .map((schedule) => (
                                <ScheduleCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    onToggle={() =>
                                        updateSchedule(schedule.id, { enabled: !schedule.enabled })
                                    }
                                    onDelete={() => {
                                        if (confirm(`Delete schedule "${schedule.name}"?`)) {
                                            deleteSchedule(schedule.id);
                                        }
                                    }}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface ScheduleCardProps {
    schedule: PayrollSchedule;
    onToggle: () => void;
    onDelete: () => void;
}

function ScheduleCard({ schedule, onToggle, onDelete }: ScheduleCardProps) {
    const nextRun = new Date(schedule.nextRunAt);
    const timeUntil = formatDistance(nextRun, new Date(), { addSuffix: true });

    return (
        <div
            className={`bg-[#0A0A0A] border rounded-2xl p-4 sm:p-6 transition-all ${schedule.enabled
                ? "border-orange-500/30 hover:border-orange-500/50"
                : "border-white/10 opacity-60"
                }`}
        >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{schedule.name}</h3>
                        <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs font-bold rounded-lg uppercase">
                            {schedule.frequency}
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Next run: {nextRun.toLocaleDateString()} at{" "}
                        {nextRun.toLocaleTimeString()} ({timeUntil})
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={onToggle}
                        className={`p-2 rounded-lg transition-all ${schedule.enabled
                            ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                            : "bg-white/5 text-gray-500 hover:bg-white/10"
                            }`}
                        title={schedule.enabled ? "Disable" : "Enable"}
                    >
                        {schedule.enabled ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Recipients
                </p>
                <div className="space-y-1">
                    {schedule.recipients.slice(0, 3).map((r, i) => (
                        <div key={i} className="text-sm text-gray-300 font-mono">
                            {r.address.slice(0, 10)}...{r.address.slice(-8)} → {r.amount}{" "}
                            {r.token}
                        </div>
                    ))}
                    {schedule.recipients.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                            +{schedule.recipients.length - 3} more
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface DueScheduleCardProps {
    schedule: PayrollSchedule;
    onExecute: () => void;
    onDelete: () => void;
}

function DueScheduleCard({
    schedule,
    onExecute,
    onDelete,
}: DueScheduleCardProps) {
    return (
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <FaExclamationCircle className="text-red-500 text-2xl" />
                <div>
                    <h4 className="font-bold text-white">{schedule.name}</h4>
                    <p className="text-sm text-gray-400">
                        {schedule.recipients.length} recipients
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onExecute}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                    <FaPlay /> Execute
                </button>
                <button
                    onClick={onDelete}
                    className="bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 font-bold px-4 py-2 rounded-lg transition-all"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
}
