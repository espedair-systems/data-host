import React from 'react';
import { Layers, Filter, CheckCircle2, ListFilter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CuratePage: React.FC = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold tracking-tight mb-1">
                    <Layers className="h-5 w-5" />
                    <span className="text-xs uppercase tracking-widest">Curation Engine</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Data Curation</h1>
                <p className="text-muted-foreground text-lg">Refine and validate data assets from source to published metadata.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <ListFilter className="h-5 w-5 text-indigo-500" />
                                Review Queue
                            </CardTitle>
                            <CardDescription>Assets pending validation before publication.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg gap-2">
                            <Filter className="h-3.5 w-3.5" /> Filter
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-6 border-t hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">customer_segmentation_v{i}</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Schema: Marketing_L0</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-3 uppercase font-black text-[9px]">Pending</Badge>
                                        <Button size="sm" className="rounded-lg px-4 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-md bg-primary text-primary-foreground overflow-hidden relative">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Validation Health</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold opacity-70">Integrity Score</span>
                                <span className="text-2xl font-black italic tracking-tighter">94.2%</span>
                            </div>
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white w-[94.2%]" />
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg">
                                Run Global Validation
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Recent Successes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-bold text-muted-foreground truncate italic">payment_gateway_logs published</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CuratePage;
