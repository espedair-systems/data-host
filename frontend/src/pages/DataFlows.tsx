import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DataFlows: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white p-12 space-y-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <Badge className="bg-amber-500 text-black border-none rounded-b-xl font-black px-8 py-1 uppercase tracking-widest text-xs shadow-lg">
                    Work in Progress
                </Badge>
            </div>
            
            <header className="flex items-center gap-6">
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/20 hover:text-primary transition-all backdrop-blur-md"
                    onClick={() => navigate('/scratchpad')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                   <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                        <Workflow className="h-3 w-3" />
                        Interactive Pipelines
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-tight">
                        Data <span className="text-primary/80 not-italic">Flow</span> Dashboard
                    </h1>
                </div>
            </header>

            <div className="flex-grow flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <div className="text-center space-y-4">
                    <Workflow className="h-20 w-20 text-muted-foreground/20 mx-auto animate-pulse" />
                    <p className="text-2xl font-black text-muted-foreground italic">Rendering Operational Pipeline Engine...</p>
                    <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
                        This experimental module targets directed acyclic graphs for ETL pipelines and data transformation visualization.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataFlows;
