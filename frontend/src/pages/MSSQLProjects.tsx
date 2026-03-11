import React from 'react';
import { Link } from 'react-router-dom';
import {
    Cpu,
    ChevronRight,
    Server,
    ShieldCheck,
    Cloud
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

const MSSQLProjects: React.FC = () => {
    const servers = [
        { id: 'SQL-PROD-01', name: 'Primary SQL Farm', version: '2022', databases: 12, status: 'Online' },
        { id: 'SQL-DEV-02', name: 'Sandbox Instances', version: '2019', databases: 5, status: 'Online' },
        { id: 'SQL-AZURE-01', name: 'Azure SQL Elastic', version: 'v12', databases: 1, status: 'Offline' }
    ];

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">MS SQL Projects</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 shadow-sm border border-red-500/20 shadow-red-500/5">
                        <Cpu className="h-9 w-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">SQL Server Nodes</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Coordinate federated Microsoft SQL Server and Azure SQL project deployments.</p>
                    </div>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50 border-b-none">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[200px] h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Node GUID</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Cluster Alias</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Engine Version</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 text-right">Databases</TableHead>
                            <TableHead className="h-14 px-6 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60">Connectivity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {servers.map((s) => (
                            <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-foreground/5 text-muted-foreground group-hover:text-red-500 transition-colors border border-black/5">
                                            {s.id.includes('AZURE') ? <Cloud className="h-3.5 w-3.5" /> : <Server className="h-3.5 w-3.5" />}
                                        </div>
                                        <code className="text-[11px] font-mono font-bold text-muted-foreground group-hover:text-foreground transition-colors px-2 py-0.5 rounded-lg bg-muted/20 border border-muted/30">
                                            {s.id}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-sm font-bold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                                        {s.name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge variant="secondary" className="font-mono text-[10px] font-bold tracking-tight rounded-md px-2 py-0">
                                        SQL {s.version}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right font-black text-sm text-muted-foreground group-hover:text-primary transition-colors tabular-nums">
                                    {s.databases}
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-[0.15em] py-0.5 px-3 border-none",
                                            s.status === 'Online' ? "bg-green-500/10 text-green-600 hover:bg-green-500/15" : "bg-red-500/10 text-red-600 hover:bg-red-500/15"
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

            <footer className="pt-4 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Enterprise topology is being synchronized across active farms
            </footer>
        </div>
    );
};

export default MSSQLProjects;
