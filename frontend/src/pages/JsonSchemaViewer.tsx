import React, { useEffect, useState } from 'react';
import {
    FileJson,
    Search,
    RefreshCcw,
    Code2,
    Copy,
    Check,
    FileCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface SchemaFile {
    name: string;
    size: number;
}

const JsonSchemaViewer: React.FC = () => {
    const [schemas, setSchemas] = useState<SchemaFile[]>([]);
    const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
    const [schemaContent, setSchemaContent] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSchemas();
    }, []);

    const fetchSchemas = async () => {
        setLoading(true);
        try {
            // Mocking the list for now based on directory scan
            const files = [
                { name: 'services.schema.json', size: 13996 },
                { name: 'collections.schema.json', size: 1762 }
            ];
            setSchemas(files);
            if (files.length > 0) {
                handleSelectSchema(files[0].name);
            }
        } catch (error) {
            toast.error('Failed to load schema list');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSchema = async (name: string) => {
        setSelectedSchema(name);
        setLoading(true);
        try {
            // We'll use the existing /api/site/master-schema for services.schema.json
            // and we'll need a new endpoint for others, but for now we'll mock or use a generic one
            const url = name === 'services.schema.json'
                ? '/api/site/master-schema'
                : `/api/site/schema-definition/${name}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch schema content');
            const data = await response.json();
            setSchemaContent(JSON.stringify(data, null, 2));
        } catch (error) {
            toast.error(`Failed to load ${name}`);
            setSchemaContent('// Error loading schema content');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(schemaContent);
        setCopied(true);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredSchemas = schemas.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-sm border border-indigo-500/20">
                        <FileCode className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            JSON <span className="text-indigo-500 not-italic">Schema Registry</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">
                            Core validation definitions and structural blueprints.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchSchemas}
                        className="rounded-xl border-indigo-500/20 hover:bg-indigo-500/10"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                        <Input
                            placeholder="Find schema..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-xl bg-card border-none shadow-lg text-xs font-bold tracking-widest uppercase focus-visible:ring-indigo-500/20"
                        />
                    </div>

                    <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/5">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Library Manifest</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div className="space-y-1">
                                {filteredSchemas.map((schema) => (
                                    <button
                                        key={schema.name}
                                        onClick={() => handleSelectSchema(schema.name)}
                                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${selectedSchema === schema.name
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileJson className={`h-4 w-4 ${selectedSchema === schema.name ? 'text-white' : 'text-indigo-500'}`} />
                                            <span className="text-xs font-bold truncate max-w-[150px]">{schema.name}</span>
                                        </div>
                                        <Badge variant="outline" className={`text-[8px] font-black border-none ${selectedSchema === schema.name ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                                            {(schema.size / 1024).toFixed(1)} KB
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-none shadow-2xl bg-[#0d1117] rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col h-[700px]">
                        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between bg-card/10 backdrop-blur-sm border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                    <Code2 className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-black text-white uppercase tracking-widest">{selectedSchema || 'No Schema Selected'}</CardTitle>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter mt-0.5">Raw Identity Definition</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                className="rounded-xl text-muted-foreground hover:text-white hover:bg-white/10"
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                <span className="ml-2 text-[10px] font-black uppercase">Copy Source</span>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow relative">
                            <ScrollArea className="h-full w-full">
                                <pre className="p-8 text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto selection:bg-indigo-500/30">
                                    {schemaContent}
                                </pre>
                            </ScrollArea>
                            {loading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                    <RefreshCcw className="h-10 w-10 text-indigo-500 animate-spin" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default JsonSchemaViewer;
