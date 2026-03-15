import React from 'react';
import {
    Library,
    FileText,
    Plus,
    Search,
    FileSpreadsheet,
    FileCode,
    Trash2,
    Download,
    Database,
    Zap,
    Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const Librarian: React.FC = () => {
    const artifacts = [
        { id: 1, name: 'product_catalog_2024.pdf', type: 'PDF', size: '2.4 MB', status: 'Indexed', date: '2024-03-12' },
        { id: 2, name: 'inventory_mapping_v2.xlsx', type: 'Excel', size: '1.1 MB', status: 'Indexed', date: '2024-03-14' },
        { id: 3, name: 'legacy_system_docs.docx', type: 'Word', size: '850 KB', status: 'Processing', date: '2024-03-15' },
        { id: 4, name: 'custom_logic_rules.txt', type: 'Text', size: '12 KB', status: 'Ready', date: '2024-03-10' },
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF': return <FileText className="h-5 w-5 text-rose-500" />;
            case 'Excel': return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
            case 'Word': return <FileCode className="h-5 w-5 text-blue-500" />;
            default: return <FileText className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="p-6 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/20">
                        <Library className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Librarian <span className="text-amber-500 not-italic">Archive</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">
                            Supplemental RAG context for schema intelligence and mapping.
                        </p>
                    </div>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-500/20 transition-all active:scale-95 group">
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Upload Context Artifact
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-amber-500" />
                        <Input
                            placeholder="SEARCH ARTIFACTS..."
                            className="h-16 pl-14 rounded-3xl bg-card border-none shadow-xl text-sm font-bold tracking-widest uppercase focus-visible:ring-amber-500/20"
                        />
                    </div>

                    <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/5">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Active Context Pool</CardTitle>
                                <Badge variant="outline" className="font-black text-[10px] uppercase bg-amber-500/5 text-amber-500 border-amber-500/10">
                                    {artifacts.length} Files Managed
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-2">
                            <ScrollArea className="h-[450px] pr-4 px-6 pb-6">
                                <div className="space-y-3">
                                    {artifacts.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-4 rounded-3xl bg-background/40 border border-white/5 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center transition-all group-hover:bg-amber-500/20 group-hover:scale-110">
                                                    {getTypeIcon(file.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm truncate max-w-[200px]">{file.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{file.type}</span>
                                                        <Separator orientation="vertical" className="h-2 opacity-50" />
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{file.size}</span>
                                                        <Separator orientation="vertical" className="h-2 opacity-50" />
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">{file.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Badge className={`text-[9px] font-black tracking-widest uppercase ${file.status === 'Indexed' ? 'bg-emerald-500/20 text-emerald-500' :
                                                        file.status === 'Processing' ? 'bg-amber-500/20 text-amber-500 animate-pulse' :
                                                            'bg-blue-500/20 text-blue-500'
                                                    }`}>
                                                    {file.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl"><Download className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <span className="font-black uppercase tracking-[0.3em] opacity-80 text-[10px]">RAG Telemetry</span>
                            <Cpu className="h-5 w-5 opacity-40" />
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase opacity-60">
                                    <span>Knowledge Recall</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full w-[84%]" />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <Zap className="h-4 w-4 text-white" />
                                    <span className="text-[10px] font-black uppercase">Live Context</span>
                                </div>
                                <p className="text-[9px] font-medium leading-relaxed opacity-80 italic">
                                    "LLM is currently using inventory_mapping_v2.xlsx to supplementation schema relation scores."
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-3">
                                <Database className="h-4 w-4" /> Cognitive Sync
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Tokens Processed</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black italic">142.4k</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black border-none uppercase tracking-tighter cursor-default">+12%</Badge>
                                </div>
                            </div>
                            <Separator className="opacity-5" />
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Vector Dimension</span>
                                <span className="text-lg font-black italic">1,536 (Ada-002)</span>
                            </div>
                        </CardContent>
                        <CardFooter className="p-0 pt-6">
                            <Button variant="outline" className="w-full rounded-2xl border-dashed border-muted hover:border-amber-500 hover:text-amber-500 text-[10px] font-black uppercase transition-all">Re-Index Registry</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Librarian;
