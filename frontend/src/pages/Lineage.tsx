import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, History, Database, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const Lineage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative group/page">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <Badge className="bg-emerald-500 text-white border-none rounded-b-xl font-black px-8 py-1 uppercase tracking-widest text-[10px] shadow-lg">
                    Data Governance
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
                            <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                                <History className="h-3 w-3" />
                                End-to-End Tracing
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 italic uppercase leading-tight">
                                Data <span className="text-emerald-500/80 not-italic text-2xl font-black">Lineage</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pb-1">
                     <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Database className="h-4 w-4" />
                        Sources
                    </Button>
                    <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Share2 className="h-4 w-4" />
                        Export Map
                    </Button>
                </div>
            </header>

            <div className="flex-grow flex items-center justify-center rounded-[2.5rem] border border-white/5 bg-muted/5 backdrop-blur-sm relative overflow-hidden group/canvas">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.05)_0%,transparent_70%)]" />
                
                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-4xl px-12">
                     <div className="flex items-center gap-6 w-full opacity-60">
                        <Card className="flex-1 bg-card/20 border-white/10 rounded-[2rem] h-20 flex items-center px-6 gap-4">
                             <Database className="h-6 w-6 text-blue-400" />
                             <div className="text-[10px] font-black uppercase tracking-widest">PostgreSQL_Production</div>
                        </Card>
                        <div className="h-[2px] w-12 bg-emerald-500/20" />
                        <Card className="flex-1 bg-card/20 border-white/10 rounded-[2rem] h-20 flex items-center px-6 gap-4 border-emerald-500/30 ring-4 ring-emerald-500/5">
                             <Zap className="h-6 w-6 text-amber-400 animate-pulse" />
                             <div className="text-[10px] font-black uppercase tracking-widest">Normalizer_Service</div>
                        </Card>
                        <div className="h-[2px] w-12 bg-emerald-500/20" />
                        <Card className="flex-1 bg-card/20 border-white/10 rounded-[2rem] h-20 flex items-center px-6 gap-4">
                             <Layers className="h-6 w-6 text-purple-400" />
                             <div className="text-[10px] font-black uppercase tracking-widest">S3_Data_Lake</div>
                        </Card>
                    </div>

                    <div className="text-center mt-12 space-y-4">
                        <History className="h-16 w-16 text-emerald-500/20 mx-auto" />
                        <h3 className="text-xl font-black italic tracking-tight text-white/40 uppercase">Reconstructing Lineage Graph...</h3>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
            
            <footer className="flex items-center justify-between px-6 py-4 bg-muted/5 rounded-3xl border border-white/5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                <div>Tracing Depth: <span className="text-emerald-400">Layer 4 Recursive</span></div>
                <div>Integrity Score: <span className="text-emerald-400">99.8%</span></div>
            </footer>
        </div>
    );
};

export default Lineage;
