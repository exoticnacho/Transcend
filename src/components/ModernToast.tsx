// src/components/ModernToast.tsx
"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

interface ModernToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
    duration?: number;
}

export default function ModernToast({ message, show, onClose, duration = 3000 }: ModernToastProps) {
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
        if (show) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show && !isVisible) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-[200] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-[#0A0A0A] border border-green-500/30 rounded-2xl p-4 shadow-2xl flex items-center gap-4 min-w-[300px] relative overflow-hidden backdrop-blur-md">
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600" />
                <div className="absolute inset-0 bg-green-500/5" />

                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <FaCheckCircle className="text-green-500" size={20} />
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-bold text-white mb-0.5">Success!</h4>
                    <p className="text-xs text-gray-400">{message}</p>
                </div>

                <button
                    onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
                    className="p-1 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                >
                    <FaTimes size={12} />
                </button>
            </div>
        </div>
    );
}
