import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Binary,
    Layers,
    ChevronRight,
    Shield,
    LayoutDashboard,
    Search,
    Filter,
    Activity,
    Workflow
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BlueprintSchema {
    id: number;
    name: string;
    desc: string;
}

const TestPlatform: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [blueprintSchemas, setBlueprintSchemas] = useState<BlueprintSchema[]>([]);
    const [selectedSchemas, setSelectedSchemas] = useState<Record<string, string>>({
        erd1: 'blog_app',
        erd2: 'blog_app',
        erd3: 'blog_app',
        erd4: 'blog_app'
    });

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const res = await fetch('/api/blueprint/schemas');
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setBlueprintSchemas(data);
                }
            } catch (error) {
                console.error('Failed to fetch blueprint schemas:', error);
            }
        };
        fetchSchemas();
    }, []);

    const erds = [
        {
            id: 'erd1',
            name: 'Relational Flow',
            defaultSchema: 'blog_app',
            description: 'Full-fidelity relational modeling engine. Visualizes complete entity state, attribute types, and hierarchical relationship cascades.',
            color: 'bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            icon: <Layers className="h-6 w-6" />
        },
        {
            id: 'erd2',
            name: 'Compact Schema',
            defaultSchema: 'blog_app',
            description: 'A header-only variant of the relational engine. Optimized for high-level structural overviews without attribute-level noise.',
            color: 'bg-indigo-500/10',
            iconColor: 'text-indigo-500',
            icon: <Binary className="h-6 w-6" />
        },
        {
            id: 'erd3',
            name: 'Global Mesh',
            defaultSchema: 'blog_app',
            description: 'A global table graph visualizer. Maps entire database domains as interconnected nodes for ecosystem analysis.',
            color: 'bg-rose-500/10',
            iconColor: 'text-rose-500',
            icon: <Shield className="h-6 w-6" />
        },
        {
            id: 'erd4',
            name: 'Isolation Blueprint',
            defaultSchema: 'blog_app',
            description: 'A focused table graph engine. Isolates specific entities and their direct dependencies using centralized physics.',
            color: 'bg-sky-500/10',
            iconColor: 'text-sky-500',
            icon: <LayoutDashboard className="h-6 w-6" />
        },
        {
            id: 'data-flow',
            name: 'Linear Pipeline',
            defaultSchema: 'blog_app',
            description: 'Operational data flow visualizer. Maps directed acyclic graphs for ETL pipelines, streaming transformations, and metadata enrichment.',
            color: 'bg-purple-500/10',
            iconColor: 'text-purple-500',
            icon: <Workflow className="h-6 w-6" />
        }
    ];

    const filteredErds = useMemo(() => {
        return erds.filter(erd => 
            erd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            erd.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleErdClick = (erdId: string) => {
        const schema = selectedSchemas[erdId] || (erds.find(e => e.id === erdId)?.defaultSchema);
        if (erdId === 'data-flow') {
            navigate(`/scratchpad/data-flows?schema=${encodeURIComponent(schema || '')}`);
        } else {
            navigate(`/scratchpad/test/${erdId}?schema=${encodeURIComponent(schema || '')}`);
        }
    };

    const handleSchemaChange = (erdId: string, value: string) => {
        setSelectedSchemas(prev => ({ ...prev, [erdId]: value }));
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto p-6 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative">
                <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
                
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 hover:bg-transparent text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-widest gap-1 transition-colors"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Domain Registry
                    </Button>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                        <Activity className="h-3.5 w-3.5" />
                        System Architecture Library
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-[0.9]">
                            ERD <span className="text-muted-foreground/10 not-italic">Scratchpad</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg italic max-w-2xl font-medium leading-relaxed">
                        Experimental modeling library. Research domain relationships through high-fidelity blueprint engines.
                    </p>
                </div>
                
                <div className="flex flex-col gap-4 min-w-[320px]">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Filter engines..." 
                            className="bg-card/50 border-white/10 rounded-2xl pl-11 h-12 text-sm font-bold italic focus-visible:ring-primary/20 transition-all shadow-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-card/50 backdrop-blur-xl border border-white/5 p-2 rounded-2xl shadow-xl">
                        <Badge variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-3">
                            {filteredErds.length} Engines Loaded
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-50 hover:opacity-100">
                            <Filter className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="space-y-4">
                {filteredErds.map((erd) => (
                    <Card
                        key={erd.id}
                        className="group relative overflow-hidden border border-white/5 bg-card/40 hover:bg-card/80 transition-all duration-500 rounded-3xl shadow-xl hover:shadow-primary/5 hover:translate-x-2"
                    >
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                                <div className="flex items-center gap-6 min-w-[340px]">
                                    <div className={`p-4 rounded-2xl ${erd.color} border border-white/5 group-hover:scale-110 transition-transform duration-700 shadow-2xl`}>
                                        <div className={erd.iconColor}>{erd.icon}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="h-5 rounded-md px-1.5 font-black text-[8px] uppercase tracking-tighter border-white/10 text-muted-foreground/60 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                                                {erd.id.toUpperCase()}
                                            </Badge>
                                            <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
                                                {erd.name}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground/60 italic font-bold">
                                            v2.4.0 High-Performance Physics
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-grow max-w-xl">
                                    <p className="text-xs text-muted-foreground italic font-medium leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                                        {erd.description}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 min-w-[340px] lg:justify-end">
                                    <div className="w-full sm:w-[200px] space-y-1.5">
                                        <label className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Blueprint Schema</label>
                                        <Select
                                            value={selectedSchemas[erd.id] || erd.defaultSchema}
                                            onValueChange={(value) => handleSchemaChange(erd.id, value)}
                                        >
                                            <SelectTrigger className="w-full h-11 rounded-2xl bg-background/50 border-white/10 text-[11px] font-bold italic hover:bg-white/5 transition-all">
                                                <SelectValue placeholder="Select schema" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-white/10 bg-card/95 backdrop-blur-xl">
                                                {blueprintSchemas.length > 0 ? (
                                                    blueprintSchemas.map((s) => (
                                                        <SelectItem key={s.id} value={s.name} className="text-xs font-bold italic">
                                                            {s.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value={erd.defaultSchema} className="text-xs font-bold italic">
                                                        {erd.defaultSchema}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={() => handleErdClick(erd.id)}
                                        className="w-full sm:w-12 sm:h-12 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center relative group/btn"
                                    >
                                        <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                        <span className="sm:hidden ml-2 font-black uppercase text-[10px] tracking-widest">Launch</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredErds.length === 0 && (
                    <div className="py-20 text-center space-y-4 bg-muted/5 rounded-[3rem] border border-dashed border-white/5">
                        <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                        <p className="text-muted-foreground font-bold italic">No matching blueprint engines found in active registry.</p>
                        <Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-xl" onClick={() => setSearchQuery('')}>Clear search filter</Button>
                    </div>
                )}
            </div>


        </div>
    );
};

export default TestPlatform;
