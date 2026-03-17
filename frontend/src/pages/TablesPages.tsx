import React, { useEffect, useState } from 'react';
import {
    Table,
    Search,
    RefreshCcw,
    Database,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TableAsset {
    name: string;
    hasSchema: boolean;
    lastModified: string;
    inDatabase: boolean;
    tableCount: number;
    relationCount: number;
}

interface TableStatus {
    name: string;
    inFS: boolean;
    inDatabase: boolean;
}

interface Collection {
    id: string;
    title: string;
    emoji: string;
    tables: string[];
}

const TablesPages: React.FC = () => {
    const [assets, setAssets] = useState<TableAsset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [tables, setTables] = useState<TableStatus[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        console.log('[DEBUG] TablesPages: Fetching assets...');
        try {
            const response = await fetch('/api/site/table-assets');
            console.log('[DEBUG] TablesPages: Status:', response.status);
            if (!response.ok) throw new Error('Failed to fetch assets');
            const data = await response.json();
            console.log('[DEBUG] TablesPages: Data received:', data);
            setAssets(data);
        } catch (error) {
            console.error('[DEBUG] TablesPages: Error:', error);
            toast.error('Failed to load table assets');
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async (assetName: string) => {
        setLoading(true);
        setSelectedAsset(assetName);
        setSelectedCollection('all');
        try {
            // Fetch tables status
            const statusRes = await fetch(`/api/site/table-assets/${assetName}/tables`);
            const tablesData: TableStatus[] = statusRes.ok ? await statusRes.json() : [];

            // Fetch collections
            const collRes = await fetch(`/api/site/published-data/${assetName}/collections.json`);
            const collData: Collection[] = collRes.ok ? await collRes.json() : [];

            setTables(tablesData);
            setCollections(collData);
            setCurrentPage(1);
        } catch (error) {
            toast.error('Failed to load tables for ' + assetName);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const tableCollectionMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        collections.forEach(c => {
            c.tables.forEach(tName => {
                map[tName] = c.title;
            });
        });
        return map;
    }, [collections]);

    const filteredTables = tables.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(tableSearch.toLowerCase());
        const matchesCollection = selectedCollection === 'all' || tableCollectionMap[t.name] === selectedCollection;
        return matchesSearch && matchesCollection;
    });

    const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
    const paginatedTables = filteredTables.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (selectedAsset) {
        return (
            <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedAsset(null)}
                            className="rounded-xl hover:bg-blue-500/10 hover:text-blue-500"
                        >
                            <ChevronRight className="h-6 w-6 rotate-180" />
                        </Button>
                        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            <Database className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                                {selectedAsset} <span className="text-blue-500 not-italic">Registry</span>
                            </h1>
                            <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">
                                Showing {filteredTables.length} tables found in this schema.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => fetchTables(selectedAsset)}
                            className="rounded-2xl border-blue-500/20 hover:bg-blue-500/10 h-11"
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sync Tables
                        </Button>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCollection === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setSelectedCollection('all'); setCurrentPage(1); }}
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4"
                        >
                            All Tables
                        </Button>
                        {collections.map(c => (
                            <Button
                                key={c.id}
                                variant={selectedCollection === c.title ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setSelectedCollection(c.title); setCurrentPage(1); }}
                                className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4"
                            >
                                {c.emoji} {c.title}
                            </Button>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="relative group w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                            <Input
                                placeholder="FILTER TABLES..."
                                value={tableSearch}
                                onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                                className="pl-12 h-12 rounded-2xl bg-card border-none shadow-lg text-xs font-bold tracking-widest uppercase"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-card p-1 rounded-2xl border border-muted/20 shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="rounded-xl"
                            >
                                Previous
                            </Button>
                            <span className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="rounded-xl"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-white/5">
                        <div className="col-span-5">Table Name</div>
                        <div className="col-span-3 text-center">Collection</div>
                        <div className="col-span-2 text-center">Documentation</div>
                        <div className="col-span-2 text-center">Database</div>
                    </div>

                    <div className="space-y-1">
                        {paginatedTables.map((table) => (
                            <div key={table.name} className="grid grid-cols-12 gap-4 items-center bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl p-3 px-8 transition-all hover:bg-blue-500/5 hover:border-blue-500/20 group">
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Table className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span className="text-[13px] font-black uppercase italic tracking-tighter text-foreground truncate" title={table.name}>
                                        {table.name}
                                    </span>
                                </div>

                                <div className="col-span-3 text-center">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter bg-muted/30 px-3 py-1 rounded-md">
                                        {tableCollectionMap[table.name] || 'UNASSIGNED'}
                                    </span>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <Badge variant="outline" className={`font-black text-[9px] uppercase border-none h-6 px-3 ${table.inFS ? 'bg-blue-500/10 text-blue-500' : 'bg-muted/40 text-muted-foreground/40'}`}>
                                        {table.inFS ? 'Generated' : 'Missing'}
                                    </Badge>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <Badge variant="outline" className={`font-black text-[9px] uppercase border-none h-6 px-3 ${table.inDatabase ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/40 text-muted-foreground/40'}`}>
                                        {table.inDatabase ? 'Active' : 'Pending'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    {paginatedTables.length === 0 && (
                        <div className="py-20 text-center space-y-4 bg-muted/5 rounded-[2.5rem]">
                            <AlertCircle className="h-12 w-12 text-muted-foreground/20 mx-auto" />
                            <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest italic">No tables found matching your filters</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 shadow-sm border border-blue-500/20">
                        <Table className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Tables <span className="text-blue-500 not-italic">Pages Registry</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium italic tracking-tight">
                            Matched content between registry and local schema data.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchAssets}
                        className="rounded-2xl border-blue-500/20 hover:bg-blue-500/10 h-12 px-6 font-black uppercase text-xs tracking-widest transition-all"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Sync Registry
                    </Button>
                </div>
            </header>

            <div className="space-y-6">
                <div className="relative group max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
                    <Input
                        placeholder="SEARCH TABLES..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-16 pl-14 rounded-3xl bg-card border-none shadow-xl text-sm font-bold tracking-widest uppercase focus-visible:ring-blue-500/20"
                    />
                </div>

                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <div className="col-span-4">Schema Name</div>
                        <div className="col-span-2 text-center">Entities</div>
                        <div className="col-span-3 text-center">Status</div>
                        <div className="col-span-2 text-center">Last Modified</div>
                        <div className="col-span-1"></div>
                    </div>

                    {filteredAssets.map((asset) => (
                        <div key={asset.name} className="grid grid-cols-12 gap-4 items-center bg-card/40 backdrop-blur-sm border border-white/5 rounded-3xl p-4 px-8 transition-all hover:bg-blue-500/5 hover:border-blue-500/20 group">
                            <div className="col-span-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Database className="h-5 w-5 text-blue-500" />
                                </div>
                                <span className="text-sm font-black uppercase italic tracking-tighter text-foreground">{asset.name}</span>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="text-lg font-black text-foreground">{asset.tableCount}</span>
                                <span className="text-[8px] font-black uppercase text-muted-foreground/40 ml-1.5">Tables</span>
                            </div>

                            <div className="col-span-3 flex justify-center">
                                <Badge variant="outline" className={`font-black text-[9px] uppercase h-7 px-3 rounded-lg ${asset.inDatabase ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    {asset.inDatabase ? 'Active in DB' : 'Filesystem Only'}
                                </Badge>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                    {new Date(asset.lastModified).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => fetchTables(asset.name)}
                                    className="rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {filteredAssets.length === 0 && !loading && (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter opacity-40">No Matches Found</h2>
                            <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Check your registry and data-host directories</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TablesPages;
