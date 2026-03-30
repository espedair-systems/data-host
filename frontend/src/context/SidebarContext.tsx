import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextType {
    content: ReactNode | null;
    setContent: (content: ReactNode | null) => void;
    isHidden: boolean;
    setIsHidden: (hidden: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<ReactNode | null>(null);
    const [isHidden, setIsHidden] = useState(false);

    return (
        <SidebarContext.Provider value={{ content, setContent, isHidden, setIsHidden }}>
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
