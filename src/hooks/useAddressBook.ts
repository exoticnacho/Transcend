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
    // Helper to read from storage
    const loadEntries = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored) as AddressBookEntry[];
            } catch (e) {
                console.error("Failed to load address book", e);
                return [];
            }
        }
        return [];
    };

    const [entries, setEntries] = useState<AddressBookEntry[]>([]);

    // Initial load and event listeners for cross-tab sync
    useEffect(() => {
        setEntries(loadEntries());

        const handleStorageChange = () => {
            setEntries(loadEntries());
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("addressbook:update", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("addressbook:update", handleStorageChange);
        };
    }, []);

    const saveAndDispatch = (newEntries: AddressBookEntry[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
        setEntries(newEntries);
        window.dispatchEvent(new Event("addressbook:update"));
    };

    const addEntry = (entry: Omit<AddressBookEntry, "id" | "createdAt">) => {
        if (!isAddress(entry.address)) {
            throw new Error("Invalid address");
        }

        const newEntry: AddressBookEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        const current = loadEntries();
        const updated = [...current, newEntry];
        saveAndDispatch(updated);

        return newEntry;
    };

    const updateEntry = (id: string, updates: Partial<AddressBookEntry>) => {
        const current = loadEntries();
        const updated = current.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
        );
        saveAndDispatch(updated);
    };

    const deleteEntry = (id: string) => {
        const current = loadEntries();
        const updated = current.filter((entry) => entry.id !== id);
        saveAndDispatch(updated);
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
