import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Table as TableIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    RefreshCw,
    Filter,
    Layers,
    Database,
    Columns,
    Activity,
    AlertCircle,
    ArrowUpDown,
    MoreHorizontal
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

interface TableDataResponse {
    columns: string[];
    rows: any[][];
    total: number;
    limit: number;
    offset: number;
}

const TableDataPage: React.FC = () => {
    const { table } = useParams<{ table: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<TableDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [limit] = useState(50);
    const [offset, setOffset] = useState(0);

    const fetchData = async () => {
        if (!table) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/site/tables/${table}/data?limit=${limit}&offset=${offset}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to fetch table data');
            }
            const result = await res.json();
            setData(result);
        } catch (err: any) {
            console.error('Error fetching table data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [table, limit, offset]);

    if (!table) return <div>No table specified</div>;

    const totalPages = data ? Math.ceil(data.total / limit) : 0;
    const currentPage = Math.floor(offset / limit) + 1;

    const handlePrevPage = () => {
        if (offset >= limit) {
            setOffset(offset - limit);
        }
    };

    const handleNextPage = () => {
        if (data && offset + limit < data.total) {
            setOffset(offset + limit);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium italic">
                <Link to="/" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Registry</Link>
                <ChevronRight className="h-3 w-3" />
                <Link to="/curate/tables" className="hover:text-foreground transition-colors uppercase tracking-widest text-[10px]">Curation</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-black uppercase tracking-widest text-[10px] italic">{table}</span>
            </nav>

            {/* Header section with Glassmorphism */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[40px] bg-primary/5 border border-primary/10 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(-1)}
                        className="rounded-2xl bg-background/50 border border-slate-200 dark:border-slate-800 hover:bg-primary/10 hover:border-primary/20 transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="p-4 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 animate-pulse-slow">
                        <TableIcon className="h-10 w-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                                {table.split('.').pop()} <span className="text-muted-foreground/30 not-italic">Data</span>
                            </h1>
                            <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest italic">
                                Read Only
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 font-medium italic flex items-center gap-2">
                             <Database className="h-3.5 w-3.5 opacity-40" />
                             Namespace: <span className="text-foreground font-bold font-mono">{table}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Button 
                        variant="outline" 
                        onClick={() => fetchData()}
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 border-slate-200 dark:border-slate-800 bg-background/50 hover:bg-muted transition-all"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button 
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Export JSON
                    </Button>
                </div>
            </header>

            {/* Error State */}
            {error && (
                <div className="p-12 rounded-[40px] border-destructive/20 bg-destructive/5 text-destructive flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-full bg-destructive/10">
                        <AlertCircle className="h-12 w-12" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic">Retrieval Failed</h3>
                        <p className="text-sm font-medium italic mt-1">{error}</p>
                    </div>
                    <Button variant="outline" onClick={fetchData} className="mt-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                        Retry Connection
                    </Button>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid gap-6">
                <Card className="rounded-[40px] border-slate-200 dark:border-slate-800 bg-card/60 backdrop-blur-xl shadow-2xl relative overflow-hidden border-t-0">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-primary/30" />
                    
                    <CardHeader className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Data Matrix</CardTitle>
                                {data && (
                                    <p className="text-[10px] text-muted-foreground mt-1 font-bold italic">
                                        Showing <span className="text-primary">{offset + 1}</span> to <span className="text-primary">{Math.min(offset + limit, data.total)}</span> of <span className="text-primary underline">{data.total}</span> records
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Filter records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 w-64 pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-muted/40 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200 dark:border-slate-800">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 overflow-x-auto">
                        {loading && !data ? (
                            <div className="p-12 space-y-4">
                                <div className="flex gap-4 mb-8">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Skeleton key={i} className="h-10 w-32 rounded-xl" />
                                    ))}
                                </div>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : data ? (
                            <div className="min-w-full inline-block align-middle">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800 bg-muted/20">
                                            {data.columns.map(col => (
                                                <TableHead key={col} className="px-6 font-black uppercase tracking-widest text-[9px] text-muted-foreground/60 h-14 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                                        {col}
                                                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                                                    </div>
                                                </TableHead>
                                            ))}
                                            <TableHead className="text-right px-6 font-black uppercase tracking-widest text-[9px] text-muted-foreground/40 w-10"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.rows.map((row, rowIndex) => (
                                            <TableRow key={rowIndex} className="group hover:bg-primary/5 transition-colors border-slate-100 dark:border-slate-900">
                                                {row.map((cell, cellIndex) => (
                                                    <TableCell key={cellIndex} className="px-6 py-4">
                                                        <div className={cn(
                                                            "text-[11px] font-bold tracking-tight tabular-nums",
                                                            typeof cell === 'number' ? 'text-blue-500 font-mono' : 'text-foreground/90'
                                                        )}>
                                                            {cell === null ? (
                                                                <span className="text-muted-foreground/20 italic font-black uppercase tracking-tighter">null</span>
                                                            ) : typeof cell === 'boolean' ? (
                                                                <Badge variant={cell ? 'default' : 'secondary'} className="text-[8px] uppercase font-black px-1.5 py-0 rounded-md">
                                                                    {String(cell)}
                                                                </Badge>
                                                            ) : String(cell)}
                                                        </div>
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right px-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Row Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Copy JSON</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">Quick View</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-destructive">Flag Data</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : null}
                    </CardContent>

                    {/* Pagination Footer */}
                    <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-muted/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                            <div className="flex items-center gap-2">
                                <Columns className="h-3 w-3" />
                                {data?.columns.length} Fields Detected
                            </div>
                            <Separator orientation="vertical" className="h-3 bg-muted-foreground/10" />
                            <div className="flex items-center gap-2">
                                <Layers className="h-3 w-3" />
                                {data?.rows.length} Visible Rows
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrevPage}
                                disabled={offset === 0 || loading}
                                className="rounded-xl font-black uppercase text-[10px] px-4 gap-2 border-slate-200 dark:border-slate-800"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            
                            <div className="flex items-center px-4 py-1.5 rounded-xl bg-background border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black italic">
                                    Page <span className="text-primary tabular-nums">{currentPage}</span> of <span className="tabular-nums">{totalPages}</span>
                                </span>
                            </div>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleNextPage}
                                disabled={!data || offset + limit >= data.total || loading}
                                className="rounded-xl font-black uppercase text-[10px] px-4 gap-2 border-slate-200 dark:border-slate-800"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TableDataPage;
