import React, { createContext, useContext, useState } from 'react';

export interface CommandHistoryItem {
    text: string;
    timestamp: string;
    robotId: string;
}

interface CommandHistoryContextType {
    history: CommandHistoryItem[];
    addCommand: (command: string, robotId: string) => void;
    clearHistory: () => void;
}

const CommandHistoryContext = createContext<CommandHistoryContextType | undefined>(undefined);

export function CommandHistoryProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<CommandHistoryItem[]>([]);

    const addCommand = (command: string, robotId: string) => {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('vi-VN');
        const newItem: CommandHistoryItem = { text: command, timestamp, robotId };

        // Giữ tối đa 10 lệnh trong lịch sử
        setHistory(prev => [newItem, ...prev].slice(0, 10));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <CommandHistoryContext.Provider value={{ history, addCommand, clearHistory }}>
            {children}
        </CommandHistoryContext.Provider>
    );
}

export function useCommandHistory() {
    const context = useContext(CommandHistoryContext);
    if (context === undefined) {
        throw new Error('useCommandHistory must be used within CommandHistoryProvider');
    }
    return context;
}
