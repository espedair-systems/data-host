import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Table, Code2, Database, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Mappings: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative group/page">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <Badge className="bg-amber-500 text-black border-none rounded-b-xl font-black px-8 py-1 uppercase tracking-widest text-[10px] shadow-lg">
                    Data Translation
                </Badge>
            </div>
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-2xl bg-card/50 border border-white/5 hover:bg-primary/20 hover:text-primary transition-all shadow-xl backdrop-blur-md"
                            onClick={() => navigate('/scratchpad')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                                <Sparkles className="h-3 w-3" />
                                Value Normalization
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 italic uppercase leading-tight">
                                Registry <span className="text-amber-500/80 not-italic text-2xl font-black">Mappings</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pb-1">
                     <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Table className="h-4 w-4" />
                        Source Schema
                    </Button>
                    <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <ArrowRight className="h-4 w-4" />
                        Target Schema
                    </Button>
                </div>
            </header>

            <div className="flex-grow flex flex-col rounded-[2.5rem] border border-white/5 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group/canvas">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
                
                <div className="p-8 w-full max-w-5xl mx-auto space-y-6">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
                         <div className="space-y-3 bg-card/30 p-6 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-all">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 border border-white/5 rounded-xl px-4 flex items-center gap-3 bg-white/5">
                                    <Database className="h-3 w-3 text-muted-foreground/40" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Field_Alpha_{i}</span>
                                </div>
                            ))}
                         </div>

                         <div className="flex flex-col items-center gap-4">
                             <Zap className="h-6 w-6 text-amber-500 animate-pulse" />
                             <div className="h-24 w-[1px] bg-gradient-to-b from-amber-500 to-transparent" />
                         </div>

                         <div className="space-y-3 bg-card/30 p-6 rounded-3xl border border-white/5 hover:border-amber-500/20 transition-all">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-10 border border-white/5 rounded-xl px-4 flex items-center gap-3 bg-white/5">
                                    <Code2 className="h-3 w-3 text-muted-foreground/40" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Target_Entity_{i}</span>
                                </div>
                            ))}
                         </div>
                    </div>

                    <div className="text-center pt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Syncing Value Domains and Character Sets...</p>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
            
            <footer className="flex items-center justify-between px-6 py-4 bg-muted/5 rounded-3xl border border-white/5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                <div>Active Mappings: <span className="text-amber-400">42 Direct</span></div>
                <div>Transformation: <span className="text-amber-400">JSON_Path Standard</span></div>
            </footer>
        </div>
    );
};

export default Mappings;
