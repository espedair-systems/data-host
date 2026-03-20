import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Download, Share2, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DatabaseSchema from '@/components/graph/DatabaseSchema';

const TestErd2: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const focusTable = searchParams.get('table');
    const schemaParam = searchParams.get('schema');
    
    const [schema, setSchema] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchema = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                // If a specific schema is requested, use the blueprint API
                // Otherwise fallback to the blog schema or master schema
                let endpoint = '';
                if (schemaParam) {
                    endpoint = `/api/blueprint/schemas/${encodeURIComponent(schemaParam)}`;
                } else {
                    endpoint = '/api/site/published-data/blog/schema.json';
                }

                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
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
    }, [schemaParam]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6 animate-in fade-in duration-700 relative group/page">
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse duration-[10s]" />
            <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse duration-[8s] delay-1000" />
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-2xl bg-card/50 border border-white/5 hover:bg-primary/20 hover:text-primary transition-all shadow-xl backdrop-blur-md"
                            onClick={() => navigate('/platforms/test')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] opacity-70">
                                <Cpu className="h-3 w-3" />
                                Neural Context Mapping
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 italic uppercase leading-tight">
                                {focusTable ? (
                                    <>
                                        {focusTable} <span className="text-primary/80 not-italic text-2xl font-black">Identity</span>
                                    </>
                                ) : (
                                    <>
                                        {schemaParam || 'Blog'} <span className="text-primary/80 not-italic text-2xl font-black">Blueprint</span>
                                    </>
                                )}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pb-1">
                    <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest backdrop-blur-md">
                        React Flow v12
                    </Badge>
                    <div className="h-10 w-[1px] bg-white/5 mx-2 hidden md:block" />
                    <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Download className="h-4 w-4" />
                        Export SQL
                    </Button>
                    <Button className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6 gap-2 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all">
                        <Share2 className="h-4 w-4" />
                        Share Schema
                    </Button>
                </div>
            </header>

            <div className="flex-grow relative min-h-[500px] group/canvas">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-[2.5rem] border border-white/5">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing React Flow...</p>
                        </div>
                    </div>
                ) : schema ? (
                    <DatabaseSchema schema={schema} focusTable={focusTable || undefined} compact={true} />
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

export default TestErd2;
