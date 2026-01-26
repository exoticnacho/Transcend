// src/components/CustomTimePicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FaClock } from "react-icons/fa";

interface CustomTimePickerProps {
    label: string;
    value: string; // HH:mm
    onChange: (value: string) => void;
}

export default function CustomTimePicker({ label, value, onChange }: CustomTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hours, minutes] = value ? value.split(':') : ['09', '00'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHour = e.target.value;
        onChange(`${newHour}:${minutes}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMinute = e.target.value;
        onChange(`${hours}:${newMinute}`);
    };

    const predefinedTimes = ["09:00", "12:00", "17:00", "20:00"];

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
                <span className="font-mono font-medium tracking-wide text-base">
                    {value}
                </span>
                <FaClock className={`text-gray-500 group-hover:text-red-500 transition-colors ${isOpen ? 'text-red-500' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-[#050505] border border-white/10 rounded-2xl p-4 shadow-2xl w-full sm:w-[220px] animate-scale-up">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                            <label className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Hour</label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={hours}
                                onChange={(e) => {
                                    let v = parseInt(e.target.value);
                                    if (v < 0) v = 0;
                                    if (v > 23) v = 23;
                                    onChange(`${v.toString().padStart(2, '0')}:${minutes}`);
                                }}
                                className="w-16 h-12 bg-[#111] border border-white/10 rounded-xl text-center text-xl font-bold focus:border-red-500/50 outline-none"
                            />
                        </div>
                        <span className="text-2xl font-bold text-gray-600 -mb-4">:</span>
                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                            <label className="text-[10px] text-gray-500 uppercase mb-1 font-bold">Min</label>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => {
                                    let v = parseInt(e.target.value);
                                    if (v < 0) v = 0;
                                    if (v > 59) v = 59;
                                    onChange(`${hours}:${v.toString().padStart(2, '0')}`);
                                }}
                                className="w-16 h-12 bg-[#111] border border-white/10 rounded-xl text-center text-xl font-bold focus:border-red-500/50 outline-none"
                            />
                        </div>
                    </div>

                    {/* Quick Select */}
                    <div className="grid grid-cols-2 gap-2">
                        {predefinedTimes.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => {
                                    onChange(t);
                                    setIsOpen(false);
                                }}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold border border-white/5 hover:bg-white/10 hover:text-white transition-all ${value === t ? 'bg-red-900/20 text-red-500 border-red-500/30' : 'bg-[#111] text-gray-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
