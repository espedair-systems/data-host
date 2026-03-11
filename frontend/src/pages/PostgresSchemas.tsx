import React from 'react';
import { Link } from 'react-router-dom';
import {
    Layers,
    ChevronRight,
    Globe,
    Server,
    Zap,
    Columns
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const PostgresSchemas: React.FC = () => {
    const schemas = [
        { name: 'public', connection: 'Analytics Prod', host: 'pg-dw.internal', tables: 84, status: 'Synced' },
        { name: 'auth', connection: 'Users Service', host: 'pg-auth.internal', tables: 12, status: 'Synced' },
        { name: 'inventory', connection: 'Analytics Prod', host: 'pg-dw.internal', tables: 45, status: 'Pending' },
        { name: 'staging', connection: 'Staging Env', host: 'localhost', tables: 21, status: 'Error' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Postgres Schemas</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/20">
                        <Layers className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground uppercase italic">Schema <span className="text-blue-600 not-italic">Registry</span></h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate discovered Relational Schemas across registered Postgres clusters.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[180px] h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Namespace</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Source Provider</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Cluster Endpoint</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">Entities</TableHead>
                            <TableHead className="h-14 px-8 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Integrity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schemas.map((s, index) => (
                            <TableRow key={index} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-foreground/5 text-muted-foreground group-hover:text-blue-500 transition-colors border border-black/5">
                                            <Columns className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-bold text-foreground/80 group-hover:text-foreground transition-colors uppercase tracking-tight italic">
                                            {s.name}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-3 w-3 text-muted-foreground/40" />
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors tracking-tight uppercase">
                                            {s.connection}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                                        <Globe className="h-3 w-3" />
                                        <code className="text-[11px] font-mono">{s.host}</code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-xs text-foreground group-hover:text-primary transition-colors tabular-nums">
                                            {s.tables}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Tables</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-[0.2em] py-1 px-4 border-none shadow-sm",
                                            s.status === 'Synced' ? "bg-emerald-500/10 text-emerald-600" :
                                                s.status === 'Error' ? "bg-rose-500/10 text-rose-600" :
                                                    "bg-amber-500/10 text-amber-600"
                                        )}
                                    >
                                        {s.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-4 flex items-center justify-center gap-6 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.3em]">
                <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-500/50" />
                    Automatic Discovery
                </div>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                <div className="flex items-center gap-2 font-mono">
                    v1.4.2-relational
                </div>
            </footer>
        </div>
    );
};

export default PostgresSchemas;
