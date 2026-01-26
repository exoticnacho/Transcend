"use client";

import { useState, useMemo } from "react";
import { FaAddressBook, FaCheck, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import { useAddressBook, AddressBookEntry } from "@/hooks/useAddressBook";

interface AddressBookModalProps {
    onClose: () => void;
    onImport: (selectedEntries: AddressBookEntry[]) => void;
}

export default function AddressBookModal({ onClose, onImport }: AddressBookModalProps) {
    const { entries } = useAddressBook();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Filter entries based on search
    const filteredEntries = useMemo(() => {
        return entries.filter(entry =>
            entry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [entries, searchTerm]);

    // Handle checkbox toggle
    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Handle "Select All"
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredEntries.length) {
            setSelectedIds(new Set());
        } else {
            const allIds = new Set(filteredEntries.map(e => e.id));
            setSelectedIds(allIds);
        }
    };

    const handleImportConfirm = () => {
        const selected = entries.filter(e => selectedIds.has(e.id));
        onImport(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl animate-scale-up overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-[#0A0A0A] shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <FaAddressBook size={18} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Import Recipients</h2>
                                <p className="text-gray-400 text-xs">Select contacts from your address book</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all">
                            <FaTimes />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder-gray-600"
                        />
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2 bg-[#050505]">
                    {filteredEntries.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No contacts found.</p>
                        </div>
                    ) : (
                        filteredEntries.map(entry => (
                            <div
                                key={entry.id}
                                onClick={() => toggleSelection(entry.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all group ${selectedIds.has(entry.id)
                                        ? 'bg-purple-900/10 border-purple-500/50'
                                        : 'bg-[#0A0A0A] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                {/* Checkbox Element */}
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedIds.has(entry.id)
                                        ? 'bg-purple-500 border-purple-500 text-white'
                                        : 'border-gray-600 group-hover:border-purple-400'
                                    }`}>
                                    {selectedIds.has(entry.id) && <FaCheck size={10} />}
                                </div>

                                <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center text-gray-400 shrink-0">
                                    <FaUser size={14} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold truncate ${selectedIds.has(entry.id) ? 'text-purple-300' : 'text-gray-200'}`}>
                                            {entry.label}
                                        </h4>
                                        {entry.defaultToken && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-400 border border-white/5">
                                                {entry.defaultToken}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono truncate">{entry.address}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-white/5 bg-[#0A0A0A] shrink-0 flex items-center justify-between">
                    <button
                        onClick={toggleSelectAll}
                        className="text-xs font-bold text-gray-400 hover:text-purple-400 transition-colors"
                    >
                        {selectedIds.size === filteredEntries.length && filteredEntries.length > 0 ? "Deselect All" : "Select All"}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleImportConfirm}
                            disabled={selectedIds.size === 0}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
                        >
                            <FaAddressBook />
                            Import ({selectedIds.size})
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
