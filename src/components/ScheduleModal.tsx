// src/components/ScheduleModal.tsx
"use client";

import { useState } from "react";
import { FaClock, FaTimes, FaCalendarAlt, FaCheck } from "react-icons/fa";
import CustomDatePicker from "./CustomDatePicker";
import CustomTimePicker from "./CustomTimePicker";

interface ScheduleModalProps {
    onSchedule: (data: {
        name: string;
        frequency: "monthly" | "weekly" | "one-time";
        nextRunAt: string;
        dayOfMonth?: number;
        dayOfWeek?: number;
    }) => void;
    onClose: () => void;
    recipientCount: number;
    theme?: "red" | "yellow"; // Dashboard = red, Enterprise = yellow
}

export default function ScheduleModal({
    onSchedule,
    onClose,
    recipientCount,
    theme = "red",
}: ScheduleModalProps) {
    const [name, setName] = useState("");
    const [frequency, setFrequency] = useState<
        "monthly" | "weekly" | "one-time"
    >("one-time");
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [selectedTime, setSelectedTime] = useState("09:00");
    const [dayOfMonth, setDayOfMonth] = useState(1);
    const [dayOfWeek, setDayOfWeek] = useState(1); // Monday

    const themeColors = {
        red: {
            primary: "from-red-600 to-red-700",
            primaryHover: "from-red-500 to-red-600",
            border: "border-red-500/30",
            bg: "bg-red-500/10",
            text: "text-red-400",
            glow: "shadow-[0_0_30px_rgba(220,38,38,0.3)]",
        },
        yellow: {
            primary: "from-yellow-600 to-yellow-500",
            primaryHover: "from-yellow-500 to-yellow-400",
            border: "border-yellow-500/30",
            bg: "bg-yellow-500/10",
            text: "text-yellow-400",
            glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
        },
    };

    const colors = themeColors[theme];

    const getNextRunPreview = () => {
        const date = new Date(`${selectedDate}T${selectedTime}`);
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError("Please enter a schedule name");
            return;
        }

        // Validate that selected datetime is not in the past
        const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();

        if (selectedDateTime <= now) {
            setError("Schedule time must be in the future");
            return;
        }

        const nextRunAt = selectedDateTime.toISOString();

        onSchedule({
            name: name.trim(),
            frequency,
            nextRunAt,
            dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
            dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in overflow-y-auto no-scrollbar">
            {/* Modal Container: Flex Col with Max Height and Hidden Overflow */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl relative flex flex-col max-h-[85vh] my-auto animate-scale-up overflow-hidden shrink-0">
                {/* Header Gradient */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.primary}`}
                />

                {/* --- FIXED HEADER --- */}
                <div className="p-5 border-b border-white/5 shrink-0 relative bg-[#0A0A0A] z-20">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
                    >
                        <FaTimes size={14} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.primary} flex items-center justify-center ${colors.glow} shrink-0`}
                        >
                            <FaClock size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Schedule Payment</h2>
                            <p className="text-gray-400 text-xs">
                                Automate {recipientCount} Recipient
                                {recipientCount > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- SCROLLABLE CONTENT --- */}
                <div className="p-5 overflow-y-auto custom-scrollbar grow">
                    <form
                        id="schedule-form"
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Schedule Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Label
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Monthly Payroll"
                                className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-white/30 outline-none transition-colors placeholder-gray-600"
                                required
                            />
                        </div>

                        {/* Frequency Selector */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Frequency
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: "one-time", label: "Once" },
                                    { value: "weekly", label: "Weekly" },
                                    { value: "monthly", label: "Monthly" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setFrequency(
                                                option.value as "monthly" | "weekly" | "one-time"
                                            )
                                        }
                                        className={`px-1 py-2 rounded-lg font-bold text-xs transition-all border ${frequency === option.value
                                            ? `bg-gradient-to-r ${colors.primary} border-transparent text-white ${colors.glow}`
                                            : "bg-[#111] border-white/5 text-gray-500 hover:text-gray-300"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* Date & Time Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <CustomDatePicker
                                label="Date"
                                value={selectedDate}
                                onChange={setSelectedDate}
                                minDate={new Date().toISOString().split("T")[0]}
                            />

                            <CustomTimePicker
                                label="Time"
                                value={selectedTime}
                                onChange={setSelectedTime}
                            />
                        </div>

                        {/* Dynamic Frequency Options */}
                        {(frequency === "monthly" || frequency === "weekly") && (
                            <div className="bg-[#111] border border-white/5 rounded-xl p-3 animate-fade-in">
                                {frequency === "monthly" && (
                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-2">
                                            <span>Day {dayOfMonth}</span>
                                            <span className="text-white font-bold">
                                                {dayOfMonth}
                                                {dayOfMonth === 1
                                                    ? "st"
                                                    : dayOfMonth === 2
                                                        ? "nd"
                                                        : dayOfMonth === 3
                                                            ? "rd"
                                                            : "th"}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="28"
                                            value={dayOfMonth}
                                            onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                                            className="w-full accent-white h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}

                                {frequency === "weekly" && (
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-2">
                                            Repeats On
                                        </label>
                                        <div className="flex justify-between gap-1">
                                            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setDayOfWeek(idx)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${dayOfWeek === idx
                                                        ? `bg-white text-black`
                                                        : "bg-black/40 text-gray-600 hover:text-gray-400"
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Preview Card */}
                        <div
                            className={`border ${colors.border} ${colors.bg} rounded-xl p-3 flex items-center justify-between`}
                        >
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                                    Next Run
                                </p>
                                <p className={`text-xs font-bold ${colors.text}`}>
                                    {getNextRunPreview()}
                                </p>
                            </div>
                            <div
                                className={`px-2 py-1 rounded text-[10px] font-bold border ${colors.border} ${colors.text}`}
                            >
                                {frequency === "one-time" ? "Single" : "Recurring"}
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- FIXED FOOTER --- */}
                <div className="p-5 border-t border-white/5 bg-[#0A0A0A] shrink-0 z-20">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-2 animate-fade-in">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <p className="text-xs text-red-400 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-[#1a1a1a] hover:bg-[#222] text-gray-400 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="schedule-form"
                            className={`bg-gradient-to-r ${colors.primary} hover:${colors.primaryHover} text-white font-bold py-3 rounded-xl transition-all ${colors.glow} flex items-center justify-center gap-2 text-sm shadow-lg`}
                        >
                            <FaCheck />
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
