import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SchemaDashboard from '../components/SchemaDashboard';
import SelectionDashboard from '../components/SelectionDashboard';
import GuidelineEditor from '../components/GuidelineEditor';
import TrainingEditor from '../components/TrainingEditor';
import {
    Database,
    ShieldCheck,
    Zap,
    Settings,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Site: React.FC = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'view';

    const renderContent = () => {
        switch (mode) {
            case 'guidelines':
                return (
                    <SelectionDashboard
                        configUrl="/api/site/selection"
                        apiUrl="/api/guidelines"
                        title="Guidelines Explorer"
                        subtitle="Discover documentation modules, structural rules, and system guides"
                    />
                );
            case 'categories':
                return (
                    <GuidelineEditor />
                );
            case 'training-categories':
                return (
                    <TrainingEditor />
                );
            case 'training':
                return (
                    <SelectionDashboard
                        configUrl="/api/site/training-selection"
                        apiUrl="/api/training"
                        title="Training Explorer"
                        subtitle="Exploring educational MDX modules for data services"
                    />
                );
            case 'schema': {
                const selectedSchema = searchParams.get('schema');
                if (selectedSchema) {
                    return (
                        <div className="p-8 animate-in fade-in zoom-in-95 duration-700">
                            <Card className="border-slate-200 dark:border-slate-800 bg-card/40 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl relative group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <CardContent className="py-24 flex flex-col items-center gap-10 text-center relative z-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150" />
                                        <div className="relative p-10 rounded-[2.5rem] bg-card border border-slate-200 dark:border-slate-800 text-primary shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
                                            <Database className="h-20 w-20" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 max-w-2xl">
                                        <h1 className="text-5xl font-black tracking-tighter uppercase italic gradient-text">
                                            {selectedSchema}
                                        </h1>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 flex items-center justify-center gap-3">
                                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                            Schema Integrity Protocol Active
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                                        {[
                                            { label: "Isolated Preview", icon: <Eye className="h-3 w-3" />, color: "bg-blue-500/10 text-blue-600" },
                                            { label: "Data Management", icon: <Settings className="h-3 w-3" />, color: "bg-purple-500/10 text-purple-600" },
                                            { label: "API Synchronization", icon: <Zap className="h-3 w-3" />, color: "bg-amber-500/10 text-amber-600" }
                                        ].map((chip, i) => (
                                            <Badge key={i} variant="outline" className={cn("px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[9px] border-none shadow-sm gap-2 animate-in slide-in-from-bottom-2 duration-500", chip.color)} style={{ animationDelay: `${i * 100}ms` }}>
                                                {chip.icon}
                                                {chip.label}
                                            </Badge>
                                        ))}
                                    </div>

                                    <p className="text-xs font-bold text-muted-foreground/40 italic mt-8 max-w-md border-t border-slate-100 dark:border-slate-900 pt-8 group-hover:text-muted-foreground/60 transition-colors">
                                        Select components or datasets for this specific schema in the explorer to begin orchestration.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    );
                }
                return (
                    <SchemaDashboard />
                );
            }
            case 'view':
            default:
                return (
                    <div className="w-full h-full relative group overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                        <iframe
                            src="/"
                            title="Internal Site Preview"
                            className="w-full h-full border-none block relative z-0 grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0"
                        />
                        <div className="absolute bottom-6 right-6 z-20 animate-in slide-in-from-right-4 duration-1000">
                            <Badge variant="outline" className="bg-card/80 backdrop-blur-md border-slate-200 dark:border-slate-800 text-muted-foreground/60 font-black tracking-widest uppercase text-[8px] py-1.5 px-4 rounded-full shadow-lg">
                                Live Preview Module
                            </Badge>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-[calc(100vh-64px)] overflow-auto bg-slate-50 dark:bg-[#020617] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
            <div className="relative z-10 h-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default Site;
