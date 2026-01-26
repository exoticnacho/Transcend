"use client";

import { useEffect, useState } from "react";
import { isAddress } from "viem";

export interface AddressBookEntry {
    id: string;
    label: string;
    address: string;
    defaultToken?: string;
    notes?: string;
    createdAt: string;
}

const STORAGE_KEY = "transcend_address_book";

export function useAddressBook() {
    const [entries, setEntries] = useState<AddressBookEntry[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setEntries(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load address book", e);
            }
        }
    }, []);

    // Save to localStorage whenever entries change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }, [entries]);

    const addEntry = (entry: Omit<AddressBookEntry, "id" | "createdAt">) => {
        if (!isAddress(entry.address)) {
            throw new Error("Invalid address");
        }

        const newEntry: AddressBookEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        setEntries((prev) => [...prev, newEntry]);
        return newEntry;
    };

    const updateEntry = (id: string, updates: Partial<AddressBookEntry>) => {
        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, ...updates } : entry
            )
        );
    };

    const deleteEntry = (id: string) => {
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
    };

    const getEntryByAddress = (address: string) => {
        return entries.find(
            (entry) => entry.address.toLowerCase() === address.toLowerCase()
        );
    };

    const getEntryByLabel = (label: string) => {
        return entries.find(
            (entry) => entry.label.toLowerCase() === label.toLowerCase()
        );
    };

    return {
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntryByAddress,
        getEntryByLabel,
    };
}
