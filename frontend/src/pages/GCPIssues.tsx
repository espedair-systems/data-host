import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Search,
    ShieldAlert
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
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

const PlatformIssues: React.FC = () => {
    const location = useLocation();
    const platformType = location.pathname.split('/')[2];

    const platformLabels: Record<string, string> = {
        gcp: 'GCP',
        aws: 'AWS',
        gcve: 'GCVE',
        saas: 'SaaS'
    };

    const typeLabel = platformLabels[platformType] || 'Platform';
    const parentPath = `/ platforms / ${platformType} `;

    const issues = [
        { id: 'ISS-001', severity: 'High', service: typeLabel === 'AWS' ? 'EC2' : 'Compute', message: 'Quota exceeded for regional resources', time: '2026-03-09 05:12' },
        { id: 'ISS-002', severity: 'Medium', service: typeLabel === 'AWS' ? 'S3' : 'Storage', message: 'Permissions denied on root assets', time: '2026-03-08 22:10' },
        { id: 'ISS-003', severity: 'Low', service: 'IAM', message: 'User access patterns abnormal', time: '2026-03-08 18:45' }
    ];

    const getSeverityStyles = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high': return "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/15";
            case 'medium': return "bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/15";
            case 'low': return "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/15";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to={parentPath} className="hover:text-foreground transition-colors">{typeLabel}</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Issues</span>
            </nav>

            <header className="flex items-center gap-4 shrink-0">
                <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive shadow-sm border border-destructive/20 animate-pulse">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{typeLabel} Platform Issues</h1>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Real-time incident feed and infrastructure anomalies across {typeLabel} nodes.
                    </p>
                </div>
            </header>

            <div className="rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="w-[120px] h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Issue ID</TableHead>
                            <TableHead className="w-[120px] h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Severity</TableHead>
                            <TableHead className="w-[150px] h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Service</TableHead>
                            <TableHead className="h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Diagnostic Message</TableHead>
                            <TableHead className="w-[180px] h-12 uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Timestamp</TableHead>
                            <TableHead className="h-12 text-right uppercase text-[10px] font-black tracking-widest text-muted-foreground/60 px-6">Investigate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {issues.map((issue) => (
                            <TableRow key={issue.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                                <TableCell className="px-6 py-5">
                                    <code className="text-[11px] font-mono font-bold bg-muted/60 px-2 py-1 rounded border border-muted-foreground/10 text-muted-foreground group-hover:text-foreground transition-colors">
                                        {issue.id}
                                    </code>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <Badge
                                        variant="outline"
                                        className={cn("font-black text-[9px] uppercase tracking-widest py-0.5 px-3 border-none", getSeverityStyles(issue.severity))}
                                    >
                                        {issue.severity}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <div className="font-bold text-foreground flex items-center gap-2 uppercase text-[11px] tracking-tight">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        {issue.service}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                        {issue.message}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5">
                                    <span className="text-[11px] font-bold text-muted-foreground/50 tabular-nums">
                                        {issue.time}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-5 text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 gap-2 font-bold uppercase text-[10px] tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
                                    >
                                        Inspect
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <footer className="pt-4 flex items-center gap-3 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
                <Search className="h-3 w-3" />
                <span>Issue reconciliation engine polling every 30 seconds.</span>
            </footer>
        </div>
    );
};

export default PlatformIssues;
