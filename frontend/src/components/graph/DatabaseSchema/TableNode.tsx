import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Link, Table as TableIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default memo(({ data }: any) => {
    return (
        <div className="min-w-[240px] bg-card/80 backdrop-blur-xl rounded-[2.5rem] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 group/node">
            {/* Table Header */}
            <div className="bg-primary/10 px-6 py-5 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <TableIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.15em] text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">
                        {data.label}
                    </span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500/50 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Columns */}
            <div className="p-3 space-y-0.5">
                {data.columns && data.columns.map((column: any) => {
                    const isPK = column.constraints?.some((c: any) => c.type === 'PRIMARY KEY');
                    const isFK = column.constraints?.some((c: any) => c.type === 'FOREIGN KEY');

                    return (
                        <div 
                            key={column.name} 
                            className={cn(
                                "flex items-center justify-between gap-4 px-3 py-2 rounded-2xl transition-all duration-300 relative group",
                                "hover:bg-primary/5 hover:translate-x-1"
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-5">
                                    {isPK ? (
                                        <Key className="h-3 w-3 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                                    ) : isFK ? (
                                        <Link className="h-3 w-3 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                                    ) : (
                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary/40 transition-colors" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-xs font-bold tracking-tight",
                                    isPK ? "text-foreground" : "text-muted-foreground/90 group-hover:text-foreground"
                                )}>
                                    {column.name}
                                </span>
                            </div>
                            <span className="text-[9px] font-black font-mono text-muted-foreground/40 group-hover:text-primary/60 uppercase tracking-widest transition-colors">
                                {column.type}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Status bar for the node */}
            <div className="px-6 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Table Object (InD)</span>
                {data.columns && (
                    <span className="text-[8px] font-black text-primary/50 uppercase tracking-[0.2em]">{data.columns.length} Fields</span>
                )}
            </div>

            {/* Connector Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-primary border-[3px] !border-card !shadow-[0_0_10px_rgba(0,0,0,0.5)] !transition-all hover:!scale-125"
                style={{ left: -6 }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-primary border-[3px] !border-card !shadow-[0_0_10px_rgba(0,0,0,0.5)] !transition-all hover:!scale-125"
                style={{ right: -6 }}
            />
        </div>
    );
});
