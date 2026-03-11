import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Database,
    Trash2,
    Plus,
    ChevronRight,
    Activity,
    Link as LinkIcon,
    Globe,
    Server,
    Globe2,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PostgresConnection {
    id: string;
    name: string;
    description?: string;
    host: string;
    database: string;
    status: 'Connected' | 'Error' | 'Pending';
}

const PostgresConnections: React.FC = () => {
    const [connections, setConnections] = useState<PostgresConnection[]>([
        { id: '1', name: 'Analytics Prod', description: 'Primary data warehouse for production analytics', host: 'pg-dw.internal', database: 'analytics_dw', status: 'Connected' },
        { id: '2', name: 'Users Service', description: 'User profile and authentication database', host: 'pg-auth.internal', database: 'users_service', status: 'Connected' },
        { id: '3', name: 'Staging Env', description: 'Testing environment for order fulfillment', host: 'localhost', database: 'order_service', status: 'Error' }
    ]);

    const [open, setOpen] = useState(false);
    const [newConn, setNewConn] = useState({ name: '', description: '', host: '', database: '', user: '', password: '' });

    const handleClose = () => {
        setOpen(false);
        setNewConn({ name: '', description: '', host: '', database: '', user: '', password: '' });
    };

    const handleAdd = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setConnections([...connections, {
            id,
            name: newConn.name || 'New Connection',
            description: newConn.description,
            host: newConn.host || 'localhost',
            database: newConn.database || 'postgres',
            status: 'Connected'
        }]);
        toast.success("Connection Established", { description: `Postgres node ${newConn.name || id} is now active.` });
        handleClose();
    };

    const handleDelete = (id: string) => {
        setConnections(connections.filter(c => c.id !== id));
        toast.error("Connection Severed", { description: "Postgres node has been decommissioned." });
    };

    return (
        <div className="p-6 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
                <Link to="/" className="hover:text-foreground transition-colors">Registry</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/ingestion" className="hover:text-foreground transition-colors">Ingestion</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-bold">Postgres Connections</span>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 shadow-sm border border-blue-500/20">
                        <Database className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-3">
                            PostgreSQL <span className="text-blue-600 not-italic">Nodes</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium italic">Federated endpoint orchestration for Relational Object Mapping.</p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-blue-500/20 transition-all active:scale-95 group">
                            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                            Register Node
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border shadow-2xl rounded-3xl p-0 overflow-hidden">
                        <div className="p-8 space-y-8 animate-in zoom-in-95 duration-200">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                                        <LinkIcon className="h-4 w-4" />
                                    </div>
                                    <DialogTitle className="text-xl font-black tracking-tight">Postgres Topology</DialogTitle>
                                </div>
                                <DialogDescription className="text-muted-foreground/60 font-medium">Configure ingress parameters for automated schema indexing.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Friendly Identity</Label>
                                    <Input
                                        className="bg-muted/40 border-none h-12 focus-visible:ring-1 focus-visible:ring-blue-500 font-bold px-4"
                                        placeholder="e.g. Orders DB"
                                        value={newConn.name}
                                        onChange={(e) => setNewConn({ ...newConn, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Deployment Context</Label>
                                    <Textarea
                                        className="bg-muted/40 border-none h-24 focus-visible:ring-1 focus-visible:ring-blue-500 font-medium px-4 py-3 resize-none"
                                        placeholder="Operational details or owner info..."
                                        value={newConn.description}
                                        onChange={(e) => setNewConn({ ...newConn, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3 space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 text-blue-600">Endpoint / IP</Label>
                                        <div className="relative">
                                            <Input
                                                className="bg-muted/40 border-none h-12 focus-visible:ring-1 focus-visible:ring-blue-500 font-mono text-xs px-10"
                                                placeholder="localhost"
                                                value={newConn.host}
                                                onChange={(e) => setNewConn({ ...newConn, host: e.target.value })}
                                            />
                                            <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Port</Label>
                                        <Input className="bg-muted/40 border-none h-12 text-center font-mono text-xs px-2" defaultValue="5432" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-muted-foreground/10">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                                    <Input className="bg-muted/40 border-none h-12 font-bold px-4" placeholder="postgres" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Key / Pass</Label>
                                    <Input type="password" className="bg-muted/40 border-none h-12 px-4" placeholder="••••••••" />
                                </div>
                            </div>

                            <DialogFooter className="sm:justify-end gap-3 pb-2">
                                <Button variant="ghost" onClick={handleClose} className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Abort</Button>
                                <Button onClick={handleAdd} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Establish Link</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-3">
                {[
                    { label: "Active Channels", val: connections.filter(c => c.status === 'Connected').length, icon: <Activity className="h-4 w-4 text-emerald-500" /> },
                    { label: "Failover Nodes", val: connections.filter(c => c.status === 'Error').length, icon: <ShieldAlert className="h-4 w-4 text-rose-500" /> },
                    { label: "Regional Zones", val: "2", icon: <Globe className="h-4 w-4 text-blue-500" /> }
                ].map((stat, i) => (
                    <Card key={i} className="bg-card/40 border-slate-200 dark:border-slate-800 shadow-none hover:shadow-md transition-all group overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity uppercase">{stat.label}</CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter tabular-nums">{stat.val}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-card shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                        <TableRow className="hover:bg-transparent h-16">
                            <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Node Identity</TableHead>
                            <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Endpoint / URL</TableHead>
                            <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Target Schema</TableHead>
                            <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">Health State</TableHead>
                            <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Ops</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {connections.map((conn) => (
                            <TableRow key={conn.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors h-20 border-slate-100 dark:border-slate-800/50">
                                <TableCell className="px-8">
                                    <div className="space-y-1">
                                        <div className="font-black text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors uppercase tracking-tight flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            {conn.name}
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-400 truncate max-w-[200px] italic">
                                            {conn.description || "Experimental cluster profile"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-3.5 w-3.5 text-slate-300" />
                                        <code className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors px-2 py-0.5 rounded-lg bg-muted/40">
                                            {conn.host}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell className="px-8">
                                    <Badge variant="outline" className="font-mono text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                        {conn.database}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-8">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "font-black text-[9px] uppercase tracking-[0.2em] py-1 px-4 border-none shadow-sm",
                                            conn.status === 'Connected' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                        )}
                                    >
                                        {conn.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-8 text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-500/5 group/btn"
                                        onClick={() => handleDelete(conn.id)}
                                    >
                                        <Trash2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {connections.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <ShieldAlert className="h-12 w-12" />
                                        <p className="text-xs font-black uppercase tracking-widest italic">Zero active federation nodes detected.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default PostgresConnections;
