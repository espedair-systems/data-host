import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Construction,
    ChevronRight,
    Share2,
    Database,
    Zap,
    Network
} from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

const MapPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const detailsPath = searchParams.get('details');
    const moduleName = detailsPath?.split('/').pop() || 'Module';

    return (
        <div className="p-6 h-[calc(100vh-100px)] flex flex-col space-y-6 max-w-6xl mx-auto animate-in fade-in duration-700">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground font-medium shrink-0">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/schema" className="hover:text-foreground transition-colors">Schema</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold capitalize">{moduleName} Map</span>
            </nav>

            <Card className="flex-grow border-2 border-dashed bg-muted/20 flex flex-col items-center justify-center p-12 text-center rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <CardContent className="relative z-10 flex flex-col items-center space-y-8 max-w-2xl">
                    <div className="relative">
                        <div className="p-6 rounded-[2rem] bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5 animate-bounce-slow">
                            <Construction className="h-16 w-16" />
                        </div>
                        <div className="absolute -top-2 -right-2 p-2 rounded-full bg-background border shadow-sm">
                            <Zap className="h-4 w-4 text-primary fill-primary/20" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
                            {moduleName} Relationship Engine
                        </h1>
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                            Feature Under Development
                        </p>
                    </div>

                    <p className="text-muted-foreground font-medium leading-relaxed">
                        We are currently architecting the graph orchestration layer for <strong className="text-foreground">{moduleName}</strong>.
                        This node will soon feature interactive directed-acyclic graphs (DAGs) representing upstream/downstream
                        lineage and complex relational constraints.
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        <div className="p-4 rounded-2xl bg-card border shadow-sm flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <Share2 className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-black uppercase text-muted-foreground/60">Stage 1</div>
                                <div className="text-xs font-bold">Node Mapping</div>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-card border shadow-sm flex items-center gap-3 grayscale opacity-50">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <Network className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-black uppercase text-muted-foreground/60">Stage 2</div>
                                <div className="text-xs font-bold">Relational Logic</div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <div className="absolute bottom-10 left-10 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Database className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">Schema v4.2.1-alpha</span>
                </div>
            </Card>
        </div>
    );
};

export default MapPage;
