// src/components/CustomDatePicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CustomDatePickerProps {
    label: string;
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    minDate?: string;
}

export default function CustomDatePicker({
    label,
    value,
    onChange,
    minDate,
}: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse current value or use today
    const dateObj = value ? new Date(value) : new Date();
    const [currentMonth, setCurrentMonth] = useState(dateObj);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
    };

    const daysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getDayOfWeek = (year: number, month: number, day: number) => {
        return new Date(year, month, day).getDay();
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        // Adjust for timezone offset to ensure correct formatting
        const offsetDate = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
        onChange(offsetDate.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = getDayOfWeek(year, month, 1);
        const days = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        const min = minDate ? new Date(minDate) : null;
        if (min) min.setHours(0, 0, 0, 0);

        for (let day = 1; day <= totalDays; day++) {
            const currentDayDate = new Date(year, month, day);
            const isSelected = value === formatDate(currentDayDate);

            let isDisabled = false;
            if (min) {
                if (currentDayDate < min) isDisabled = true;
            }

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isSelected
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                            : isDisabled
                                ? 'text-gray-700 cursor-not-allowed'
                                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }
                `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-[#111] border ${isOpen ? 'border-red-500/50' : 'border-white/10'} hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm flex items-center justify-between transition-all group`}
            >
                <span className="font-medium">
                    {new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    })}
                </span>
                <FaCalendarAlt className={`text-gray-500 group-hover:text-red-500 transition-colors ${isOpen ? 'text-red-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-[#050505] border border-white/10 rounded-2xl p-4 shadow-2xl w-[280px] animate-scale-up">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <FaChevronLeft size={12} />
                        </button>
                        <span className="text-sm font-bold text-white">
                            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <button type="button" onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <FaChevronRight size={12} />
                        </button>
                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                            <span key={`${day}-${idx}`} className="text-[10px] font-bold text-gray-500 uppercase">{day}</span>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1 place-items-center">
                        {renderCalendarDays()}
                    </div>
                </div>
            )}
        </div>
    );
}
