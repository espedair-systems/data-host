import React from 'react';
import { Link } from 'react-router-dom';
import {
    UploadCloud,
    FileJson,
    ChevronRight,
    CheckCircle,
    FileUp,
    Globe,
    Network
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const IngestionPage: React.FC = () => {
    return (
        <div className="p-6 space-y-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Schema Ingestion</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                        <UploadCloud className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Schema Ingestion</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate and register new data definitions within the federated registry.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden group">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center gap-3">
                            <FileUp className="h-5 w-5 text-indigo-500" />
                            <CardTitle className="text-xl font-black tracking-tight uppercase text-xs">Direct Upload</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Local file synchronization</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div
                            className="border-2 border-dashed border-muted-foreground/20 rounded-[2rem] p-12 text-center cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all group/dropzone relative overflow-hidden"
                            onClick={() => toast.info("Opening file browser...")}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/dropzone:opacity-100 transition-opacity" />
                            <div className="relative z-10 space-y-4">
                                <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center group-hover/dropzone:scale-110 group-hover/dropzone:bg-primary/10 transition-all duration-500 shadow-sm border border-black/5">
                                    <FileJson className="h-10 w-10 text-primary/60 group-hover/dropzone:text-primary transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Drop definition here</h3>
                                    <p className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest leading-loose">
                                        or browse your filesystem for <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded border">*.schema.json</code>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-lg bg-card/60 backdrop-blur-sm group">
                    <CardHeader className="bg-muted/30">
                        <div className="flex items-center gap-3">
                            <Network className="h-5 w-5 text-emerald-500" />
                            <CardTitle className="text-xl font-black tracking-tight uppercase text-xs">Manual Entry</CardTitle>
                        </div>
                        <CardDescription className="text-xs font-bold uppercase tracking-tight text-muted-foreground/50">Remote source registration</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="moduleName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Module Namespace</Label>
                            <Input
                                id="moduleName"
                                placeholder="e.g. data-governance-hub"
                                className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-primary font-bold text-sm rounded-xl px-5"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sourceUrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Metadata Source URL</Label>
                            <div className="relative group/input">
                                <Input
                                    id="sourceUrl"
                                    placeholder="https://api.v2.source.io/v1/schema"
                                    className="bg-muted/30 border-none h-12 focus-visible:ring-1 focus-visible:ring-primary font-mono text-xs rounded-xl pl-10 pr-5"
                                />
                                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <Button
                                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-black/5 flex items-center gap-3"
                                onClick={() => toast.success("Module Registered", { description: "Remote schema is being indexed for consistency checks." })}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Finalize Registration
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <footer className="pt-8 flex items-center justify-center gap-3 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
                <Network className="h-3 w-3" />
                Registration Protocol v4 Active
            </footer>
        </div>
    );
};

export default IngestionPage;
