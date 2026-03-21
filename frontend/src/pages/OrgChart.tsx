import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Network, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const OrgChart: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative group/page">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <Badge className="bg-indigo-500 text-white border-none rounded-b-xl font-black px-8 py-1 uppercase tracking-widest text-[10px] shadow-lg">
                    System Topology
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
                            <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                                <Users className="h-3 w-3" />
                                Organizational Hierarchy
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 italic uppercase leading-tight">
                                Org <span className="text-indigo-500/80 not-italic text-2xl font-black">Chart</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pb-1">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                        <input 
                            placeholder="SEARCH ENTITIES..." 
                            className="h-12 w-64 bg-card/30 border border-white/5 rounded-2xl pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                    <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </header>

            <div className="flex-grow flex items-center justify-center rounded-[2.5rem] border border-white/5 bg-muted/5 backdrop-blur-sm relative overflow-hidden group/canvas">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
                
                {/* Mockup Org Nodes */}
                <div className="relative z-10 flex flex-col items-center gap-12">
                    <div className="p-1 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-transparent border border-white/10 animate-in zoom-in-95 duration-700">
                        <Card className="bg-slate-900/80 border-none shadow-2xl rounded-[1.8rem] w-64">
                            <CardContent className="p-6 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto ring-4 ring-indigo-500/10">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Administrator</div>
                                    <div className="text-lg font-black tracking-tighter">System Core</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex gap-8">
                        {[1, 2].map((i) => (
                            <Card key={i} className="bg-card/40 border-white/5 shadow-xl rounded-3xl w-48 backdrop-blur-md opacity-60 group-hover/canvas:opacity-100 transition-opacity duration-1000">
                                <CardContent className="p-4 text-center space-y-2">
                                    <div className="h-8 w-8 rounded-full bg-white/5 text-muted-foreground flex items-center justify-center mx-auto">
                                        <Network className="h-4 w-4" />
                                    </div>
                                    <div className="text-xs font-black tracking-tight">Department Alpha-{i}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center opacity-30 mt-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Visualization Core...</p>
                    </div>
                </div>

                {/* Grid Background */}
                <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>
            
            <footer className="flex items-center justify-between px-6 py-4 bg-muted/5 rounded-3xl border border-white/5 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500/50" />
                    Topology View Alpha 0.1
                </div>
                <div>Sync Status: <span className="text-indigo-400">Registry Primary</span></div>
            </footer>
        </div>
    );
};

export default OrgChart;
