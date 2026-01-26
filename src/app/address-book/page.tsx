"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
    AddressBookEntry,
    useAddressBook,
} from "@/hooks/useAddressBook";
import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/utils/config";
import {
    FaAddressBook,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCheck,
    FaTimes,
    FaUser,
} from "react-icons/fa";
import { isAddress } from "viem";

const NoSSRWagmiWrapper = dynamic(
    () => Promise.resolve(({ children }: { children: React.ReactNode }) => {
        const [queryClient] = useState(() => new QueryClient());
        return (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </WagmiProvider>
        );
    }),
    { ssr: false }
);

export default function AddressBookPage() {
    return (
        <NoSSRWagmiWrapper>
            <main className="flex flex-col min-h-screen bg-[#020202] text-white font-sans relative overflow-x-hidden">
                <Navbar />

                {/* Background */}
                <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-purple-900/20 via-indigo-900/10 to-transparent pointer-events-none z-0" />
                <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
                    <div className="w-full max-w-6xl">
                        <HeaderSection />
                        <AddressBookContent />
                    </div>
                </div>

                <div className="relative z-10 mt-auto border-t border-purple-900/20 bg-[#020202]">
                    <Footer />
                </div>
            </main>
        </NoSSRWagmiWrapper>
    );
}

function HeaderSection() {
    return (
        <div className="mb-10 text-center border-b border-purple-500/20 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">
                <FaAddressBook /> Saved Recipients
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                Address{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-600">
                    Book
                </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Save and manage frequently used wallet addresses for quick payroll access.
            </p>
        </div>
    );
}

function AddressBookContent() {
    const { entries, addEntry, updateEntry, deleteEntry } = useAddressBook();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Add Button */}
            <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                    {entries.length} recipient{entries.length !== 1 ? "s" : ""} saved
                </p>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                    <FaPlus /> Add Recipient
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <AddEntryForm
                    onSave={(entry) => {
                        addEntry(entry);
                        setShowAddForm(false);
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Entries List */}
            <div className="grid grid-cols-1 gap-4">
                {entries.length === 0 && !showAddForm && (
                    <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/5">
                        <FaAddressBook className="mx-auto text-6xl text-gray-600 mb-4" />
                        <p className="text-gray-400 mb-4">No recipients saved yet</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-purple-400 hover:text-purple-300 font-bold"
                        >
                            Add your first recipient →
                        </button>
                    </div>
                )}

                {entries.map((entry) =>
                    editingId === entry.id ? (
                        <AddEntryForm
                            key={entry.id}
                            initialEntry={entry}
                            onSave={(updated) => {
                                updateEntry(entry.id, updated);
                                setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                        />
                    ) : (
                        <EntryCard
                            key={entry.id}
                            entry={entry}
                            onEdit={() => setEditingId(entry.id)}
                            onDelete={() => {
                                if (confirm(`Delete ${entry.label}?`)) {
                                    deleteEntry(entry.id);
                                }
                            }}
                        />
                    )
                )}
            </div>
        </div>
    );
}

interface EntryCardProps {
    entry: AddressBookEntry;
    onEdit: () => void;
    onDelete: () => void;
}

function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-purple-500/30 transition-all group">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 w-full">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                        <FaUser size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">{entry.label}</h3>
                        <p className="text-gray-400 font-mono text-sm break-all mb-2">
                            {entry.address}
                        </p>
                        {entry.defaultToken && (
                            <span className="inline-block bg-yellow-900/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold">
                                Default: {entry.defaultToken}
                            </span>
                        )}
                        {entry.notes && (
                            <p className="text-gray-500 text-sm mt-2 italic">
                                "{entry.notes}"
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-500 rounded-lg transition-all"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </div>
    );
}

interface AddEntryFormProps {
    initialEntry?: AddressBookEntry;
    onSave: (entry: Omit<AddressBookEntry, "id" | "createdAt">) => void;
    onCancel: () => void;
}

function AddEntryForm({ initialEntry, onSave, onCancel }: AddEntryFormProps) {
    const [label, setLabel] = useState(initialEntry?.label || "");
    const [address, setAddress] = useState(initialEntry?.address || "");
    const [defaultToken, setDefaultToken] = useState(
        initialEntry?.defaultToken || ""
    );
    const [notes, setNotes] = useState(initialEntry?.notes || "");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!label.trim()) {
            setError("Label is required");
            return;
        }

        if (!isAddress(address)) {
            setError("Invalid wallet address");
            return;
        }

        onSave({
            label: label.trim(),
            address,
            defaultToken: defaultToken || undefined,
            notes: notes.trim() || undefined,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 space-y-4"
        >
            <h3 className="text-lg font-bold text-white mb-4">
                {initialEntry ? "Edit Recipient" : "Add New Recipient"}
            </h3>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Label / Name *
                </label>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Alice - Marketing"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Wallet Address *
                </label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Default Token (Optional)
                </label>
                <input
                    type="text"
                    value={defaultToken}
                    onChange={(e) => setDefaultToken(e.target.value)}
                    placeholder="e.g. USDT, DAI"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Notes (Optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none"
                />
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <FaCheck /> Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    <FaTimes /> Cancel
                </button>
            </div>
        </form>
    );
}
