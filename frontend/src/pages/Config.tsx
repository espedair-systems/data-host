import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings, Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Config: React.FC = () => {
    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Config</span>
            </nav>

            <header className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Settings className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuration Management</h1>
                    <p className="text-muted-foreground">Adjust system-wide parameters and registry behavior.</p>
                </div>
            </header>

            <Card className="border-2 border-dashed bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                    <div className="p-6 rounded-full bg-background/50 mb-6 border-2 border-dashed">
                        <Construction className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Under Construction</h2>
                    <p className="text-muted-foreground max-w-sm">
                        The configuration management portal is currently being architected.
                        Direct file editing is supported via the backend API.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Config;
