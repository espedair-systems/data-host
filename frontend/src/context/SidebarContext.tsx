import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextType {
    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<ReactNode | null>(null);

    return (
        <SidebarContext.Provider value={{ content, setContent }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
