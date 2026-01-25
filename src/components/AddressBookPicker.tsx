import { useAddressBook } from "@/hooks/useAddressBook";
import { useState } from "react";
import { FaUser, FaTimes, FaSearch } from "react-icons/fa";

interface AddressBookPickerProps {
    onSelect: (address: string, label: string) => void;
    onClose: () => void;
}

export default function AddressBookPicker({
    onSelect,
    onClose,
}: AddressBookPickerProps) {
    const { entries } = useAddressBook();
    const [search, setSearch] = useState("");

    const filteredEntries = entries.filter(
        (entry) =>
            entry.label.toLowerCase().includes(search.toLowerCase()) ||
            entry.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0A0A0A] border border-purple-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>

                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaUser className="text-purple-500" />
                    Select from Address Book
                </h3>

                {/* Search */}
                <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or address..."
                        className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500 outline-none text-sm"
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                    {filteredEntries.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {search ? "No matching recipients" : "No saved recipients yet"}
                        </div>
                    )}

                    {filteredEntries.map((entry) => (
                        <button
                            key={entry.id}
                            onClick={() => {
                                onSelect(entry.address, entry.label);
                                onClose();
                            }}
                            className="w-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 text-left transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 shrink-0">
                                    <FaUser size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {entry.label}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono truncate">
                                        {entry.address}
                                    </p>
                                    {entry.defaultToken && (
                                        <span className="inline-block mt-1 bg-yellow-900/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {entry.defaultToken}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 text-center">
                        {filteredEntries.length} recipient
                        {filteredEntries.length !== 1 ? "s" : ""} available
                    </p>
                </div>
            </div>
        </div>
    );
}
