import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Link, Table as TableIcon } from 'lucide-react';

export default memo(({ data }: any) => {
    return (
        <div className="min-w-[200px] bg-card rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Table Header */}
            <div className="bg-primary/10 px-4 py-2 border-b border-primary/20 flex items-center gap-2">
                <TableIcon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary truncate">
                    {data.label}
                </span>
            </div>

            {/* Columns */}
            <div className="p-2 space-y-1">
                {data.columns && data.columns.map((column: any) => {
                    const isPK = column.constraints?.some((c: any) => c.type === 'PRIMARY KEY');
                    const isFK = column.constraints?.some((c: any) => c.type === 'FOREIGN KEY');

                    return (
                        <div key={column.name} className="flex items-center justify-between gap-4 px-2 py-1 hover:bg-muted/50 rounded-lg group transition-colors relative">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 w-4">
                                    {isPK && <Key className="h-2.5 w-2.5 text-amber-500 fill-amber-500/20" />}
                                    {isFK && <Link className="h-2.5 w-2.5 text-blue-500" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    isPK ? "text-foreground" : "text-muted-foreground/80"
                                )}>
                                    {column.name}
                                </span>
                            </div>
                            <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-tighter">
                                {column.type}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Connector Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-2 h-2 !bg-primary border-2 !border-background"
                style={{ left: -4 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-2 h-2 !bg-primary border-2 !border-background"
                style={{ right: -4 }}
            />
        </div>
    );
});

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
