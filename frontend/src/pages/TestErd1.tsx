import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Download, Share2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DatabaseSchema from '@/components/graph/DatabaseSchema';

const TestErd1: React.FC = () => {
    const navigate = useNavigate();
    const [schema, setSchema] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                // In a real app, this would be an API call
                // Here we fetch the full 'Blog' schema directly
                const response = await fetch('/api/site/published-data/blog/schema.json');
                if (response.ok) {
                    const data = await response.json();
                    setSchema(data);
                }
            } catch (error) {
                console.error('Failed to fetch schema:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchema();
    }, []);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all"
                            onClick={() => navigate('/platforms/test')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                            <Layers className="h-3 w-3" />
                            Visual Blueprint
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tighter">ERD1: Blog Engine</h1>
                        <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold text-[10px] uppercase tracking-tighter">React Flow Engine</Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-4 gap-2">
                        <Download className="h-4 w-4" />
                        Export SQL
                    </Button>
                    <Button className="rounded-xl font-bold text-xs h-10 px-4 gap-2 shadow-lg shadow-primary/20">
                        <Share2 className="h-4 w-4" />
                        Share Schema
                    </Button>
                </div>
            </header>

            <div className="flex-grow relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-white/5">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing React Flow...</p>
                        </div>
                    </div>
                ) : schema ? (
                    <DatabaseSchema schema={schema} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-white/5">
                        <div className="text-center space-y-4">
                            <Database className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">Blog Schema Not Found</p>
                            <Button variant="secondary" onClick={() => navigate('/platforms/test')}>Return to Sandbox</Button>
                        </div>
                    </div>
                )}
            </div>

            <footer className="flex items-center justify-between px-6 py-4 bg-muted/10 rounded-3xl border border-white/5 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                <div>Node Type: High-Fidelity Table Definitions</div>
                <div>Engine: React Flow v12.10.1 // Dagre Layout</div>
                <div className="flex items-center gap-2 text-emerald-500/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive Mode
                </div>
            </footer>
        </div>
    );
};

export default TestErd1;
