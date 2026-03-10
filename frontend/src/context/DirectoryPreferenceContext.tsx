import React, { createContext, useContext, useState, useEffect } from 'react';
import directoryData from '../data/directory.json';

interface DirectoryPreferenceContextType {
    preferredCategories: string[];
    setPreferredCategories: (categories: string[]) => void;
    allCategories: string[];
}

const DirectoryPreferenceContext = createContext<DirectoryPreferenceContextType | undefined>(undefined);

export const DirectoryPreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Extract all unique tags/categories
    const allCategories = React.useMemo(() => {
        const tags = new Set<string>();
        directoryData.forEach((item: any) => {
            item.tags?.forEach((tag: string) => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, []);

    const [preferredCategories, setPreferredCategories] = useState<string[]>(() => {
        const saved = localStorage.getItem('directory_preferred_categories');
        return saved ? JSON.parse(saved) : allCategories;
    });

    useEffect(() => {
        localStorage.setItem('directory_preferred_categories', JSON.stringify(preferredCategories));
    }, [preferredCategories]);

    return (
        <DirectoryPreferenceContext.Provider value={{ preferredCategories, setPreferredCategories, allCategories }}>
            {children}
        </DirectoryPreferenceContext.Provider>
    );
};

export const useDirectoryPreferences = () => {
    const context = useContext(DirectoryPreferenceContext);
    if (!context) {
        throw new Error('useDirectoryPreferences must be used within a DirectoryPreferenceProvider');
    }
    return context;
};
