import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    description?: string;
}

const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, description = 'This page is currently under development.' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
            <div className="p-6 rounded-full bg-amber-500/10 text-amber-500">
                <Construction className="h-16 w-16" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight">{title}</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {description}
                </p>
            </div>
            <div className="w-12 h-1 bg-amber-500/20 rounded-full" />
        </div>
    );
};

export default PlaceholderPage;
