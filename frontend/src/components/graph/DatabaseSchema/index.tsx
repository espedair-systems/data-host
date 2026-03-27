import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    MarkerType,
    Panel,
    BackgroundVariant,
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Key } from 'lucide-react';

import { useColorMode } from '@/context/ColorModeContext';
import { cn } from '@/lib/utils';
import TableNode from './TableNode';

const nodeTypes = {
    table: TableNode,
};

const CardinalityEdge = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: any) => {
    const [edgePath] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetPosition,
        targetX,
        targetY,
    });

    if (data?.compact) {
        return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                {/* Position cardinality labels at the entity boundaries */}
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${sourceX + (sourcePosition === 'right' ? 20 : -20)}px, ${sourceY - 15}px)`,
                        pointerEvents: 'none',
                    }}
                    className="bg-background/80 px-1 rounded text-[10px] font-black border border-border/50 text-muted-foreground shadow-sm"
                >
                    {data?.sourceLabel}
                </div>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${targetX + (targetPosition === 'left' ? -20 : 20)}px, ${targetY - 15}px)`,
                        pointerEvents: 'none',
                    }}
                    className="bg-primary/90 text-primary-foreground px-1.5 rounded text-[11px] font-black border border-primary shadow-lg"
                >
                    {data?.targetLabel}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const edgeTypes = {
    cardinality: CardinalityEdge,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR', compact = false) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Dynamic spacing based on compact mode
    const nodeWidth = compact ? 220 : 300;
    const nodeHeight = compact ? 80 : 400;

    dagreGraph.setGraph({ 
        rankdir: direction,
        nodesep: compact ? 40 : 100,
        ranksep: compact ? 80 : 150,
        marginx: 50,
        marginy: 50
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = direction === 'LR' ? 'left' : 'top';
        node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

interface DatabaseSchemaProps {
    schema: any;
    focusTable?: string;
    compact?: boolean;
    viewpoint?: string | null;
    onViewpointChange?: (viewpoint: string | null) => void;
}

const DatabaseSchema: React.FC<DatabaseSchemaProps> = ({ schema, focusTable, compact = false, viewpoint, onViewpointChange }) => {
    const { mode } = useColorMode();
    const [showOnlyKeys, setShowOnlyKeys] = useState(false);
    const [notationMode, setNotationMode] = useState<'chen' | 'crowsfoot'>('chen');
    const [currentViewpoint, setCurrentViewpoint] = useState<string | null>(null);

    useEffect(() => {
        setCurrentViewpoint(viewpoint || null);
    }, [schema, viewpoint]);
    
    const getNotationData = (isUnique: boolean) => {
        if (notationMode === 'crowsfoot') {
            return {
                sourceLabel: '',
                targetLabel: ''
            };
        }
        return {
            sourceLabel: '1',
            targetLabel: isUnique ? '1' : ':n'
        };
    };

    const initialElements = useMemo(() => {
        if (!schema || !schema.tables) return { elements: { nodes: [], edges: [] }, limitReached: false, totalCount: 0, limit: 0, tables: [] };

        const erdLimit = schema.erd_limit || 20;
        let tablesToRender = schema.tables;
        const isTruncated = !focusTable && !currentViewpoint && schema.tables.length > erdLimit;

        if (isTruncated) {
            // Sort by connection count
            const connectionCounts: Record<string, number> = {};
            schema.tables.forEach((t: any) => {
                connectionCounts[t.name] = (t.constraints || []).length;
            });
            
            tablesToRender = [...schema.tables]
                .sort((a, b) => (connectionCounts[b.name] || 0) - (connectionCounts[a.name] || 0))
                .slice(0, erdLimit);
        } else if (focusTable) {
            const neighbors = new Set<string>();
            neighbors.add(focusTable);

            // Find direct neighbors (connected via foreign keys)
            schema.tables.forEach((t: any) => {
                if (t.constraints) {
                    t.constraints.forEach((c: any) => {
                        if (c.type === 'FOREIGN KEY') {
                            if (t.name === focusTable && c.referenced_table) {
                                neighbors.add(c.referenced_table);
                            } else if (c.referenced_table === focusTable) {
                                neighbors.add(t.name);
                            }
                        }
                    });
                }
            });

            // Also check relations if they exist (sometimes provided separately)
            if (schema.relations) {
                schema.relations.forEach((r: any) => {
                    if (r.table === focusTable) {
                        neighbors.add(r.parent_table);
                    } else if (r.parent_table === focusTable) {
                        neighbors.add(r.table);
                    }
                });
            }

            tablesToRender = schema.tables.filter((t: any) => neighbors.has(t.name));
        } else if (currentViewpoint && schema.viewpoints) {
            const vp = schema.viewpoints.find((v: any) => v.name === currentViewpoint);
            if (vp) {
                const tableNames = new Set<string>();
                (vp.tables || []).forEach((tn: string) => tableNames.add(tn.toLowerCase().trim()));
                (vp.groups || []).forEach((group: any) => {
                    (group.tables || []).forEach((tn: string) => tableNames.add(tn.toLowerCase().trim()));
                });
                
                tablesToRender = schema.tables.filter((t: any) => 
                    tableNames.has(t.name.toLowerCase().trim())
                );
            }
        }
        
        const tablesArray = Array.isArray(tablesToRender) ? tablesToRender : [];
        const renderedTableNames = new Set(tablesArray.map((t: any) => t.name));

        const nodes: any[] = tablesArray.map((table: any) => ({
            id: table.name,
            type: 'table',
            data: {
                label: table.name,
                columns: compact 
                    ? [] 
                    : showOnlyKeys 
                        ? (table.columns || []).filter((c: any) => {
                            const isPKCol = c.primary_key || c.is_primary_key || c.isPrimaryKey || c.pk || c.constraints?.some((con: any) => con.type === 'PRIMARY KEY');
                            const isFKCol = c.referenced_table || c.referencedTable || c.is_foreign_key || c.isForeignKey || c.fk || c.constraints?.some((con: any) => con.type === 'FOREIGN KEY');
                            
                            // Check table-level constraints too (crucial for composite keys)
                            const isTablePK = table.constraints?.some((con: any) => con.type === 'PRIMARY KEY' && (con.columns?.includes(c.name) || con.column === c.name));
                            const isTableFK = table.constraints?.some((con: any) => con.type === 'FOREIGN KEY' && (con.columns?.includes(c.name) || con.column === c.name));
                            
                            return !!(isPKCol || isFKCol || isTablePK || isTableFK);
                        })
                        : table.columns,
                constraints: table.constraints,
                compact
            },
            position: { x: 0, y: 0 },
        }));

        const edges: any[] = [];
        schema.tables.forEach((table: any) => {
            if (table.constraints) {
                table.constraints.forEach((constraint: any) => {
                    if (constraint.type === 'FOREIGN KEY' && 
                        constraint.referenced_table && 
                        renderedTableNames.has(table.name) && 
                        renderedTableNames.has(constraint.referenced_table)) {
                        const isUnique = table.constraints?.some((c: any) => 
                            (c.type === 'UNIQUE' || c.type === 'PRIMARY KEY') && 
                            (c.columns?.includes(constraint.column) || c.column === constraint.column)
                        );

                        const notationData = getNotationData(isUnique);
                        const edgeColor = isUnique 
                            ? (mode === 'dark' ? '#10b981' : '#059669')  // Emerald for 1:1
                            : (mode === 'dark' ? '#f59e0b' : '#d97706'); // Amber for 1:N

                        edges.push({
                            id: `e-${table.name}-${constraint.referenced_table}`,
                            source: constraint.referenced_table,
                            target: table.name,
                            type: 'cardinality',
                            animated: isUnique,
                            reconnectable: true,
                            data: {
                                ...notationData,
                                column: constraint.column,
                                compact
                            },
                            markerEnd: compact || notationMode !== 'crowsfoot' 
                                ? { type: MarkerType.ArrowClosed, color: edgeColor }
                                : (isUnique ? 'url(#marker-one)' : 'url(#marker-many)'),
                            style: { 
                                stroke: edgeColor,
                                strokeWidth: isUnique ? 2.5 : 3.5,
                            },
                        });
                    }
                });
            }
        });

        // Add additional edges from relations if not already captured
        if (schema.relations) {
            schema.relations.forEach((r: any) => {
                if (renderedTableNames.has(r.table) && renderedTableNames.has(r.parent_table)) {
                    const edgeId = `r-${r.table}-${r.parent_table}`;
                    if (!edges.some(e => e.source === r.parent_table && e.target === r.table)) {
                    const notationData = getNotationData(r.cardinality === '1:1');
                    const isUnique = r.cardinality === '1:1';
                    const edgeColor = isUnique 
                        ? (mode === 'dark' ? '#10b981' : '#059669') 
                        : (mode === 'dark' ? '#f59e0b' : '#d97706');

                        edges.push({
                            id: edgeId,
                            source: r.parent_table,
                            target: r.table,
                            type: 'cardinality',
                            animated: isUnique,
                            reconnectable: true,
                            data: {
                                ...notationData,
                                column: r.columns?.join(', '),
                                compact
                            },
                            markerEnd: compact || notationMode !== 'crowsfoot' 
                                ? { type: MarkerType.ArrowClosed, color: edgeColor }
                                : (isUnique ? 'url(#marker-one)' : 'url(#marker-many)'),
                            style: { 
                                stroke: edgeColor,
                                strokeWidth: isUnique ? 2.5 : 3.5,
                            },
                        });
                    }
                }
            });
        }

        return { 
            elements: getLayoutedElements(nodes, edges, 'LR', compact),
            limitReached: isTruncated,
            totalCount: schema.tables.length,
            limit: erdLimit,
            tables: tablesArray
        };
    }, [schema, focusTable, mode, showOnlyKeys, notationMode, compact, currentViewpoint]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.elements.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.elements.edges);

    useEffect(() => {
        setNodes(initialElements.elements.nodes);
        setEdges(initialElements.elements.edges);
    }, [initialElements, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const CrowFootDefs = () => (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                <marker
                    id="marker-one"
                    viewBox="0 0 20 20"
                    refX="18"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path 
                        d="M 10 4 L 10 16 M 15 4 L 15 16" 
                        stroke={mode === 'dark' ? '#10b981' : '#059669'} 
                        strokeWidth="3.5" 
                        fill="none"
                    />
                </marker>
                <marker
                    id="marker-many"
                    viewBox="0 0 20 20"
                    refX="18"
                    refY="10"
                    markerWidth="20"
                    markerHeight="20"
                    orient="auto"
                >
                    <path
                        d="M 2 4 L 18 10 L 2 16 M 18 4 L 18 16"
                        fill="none"
                        stroke={mode === 'dark' ? '#f59e0b' : '#d97706'}
                        strokeWidth="2.5"
                    />
                </marker>
            </defs>
        </svg>
    );

    return (
        <div className="w-full h-full bg-background/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
            <CrowFootDefs />
            <ReactFlow
                key={`flow-${schema?.name || 'anonymous'}-${currentViewpoint || 'standard'}-${focusTable || 'none'}`}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                colorMode={mode as any}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
                <Panel position="top-left" className="mt-4 ml-4 flex flex-col gap-2">
                    {!compact && (
                        <button 
                            onClick={() => setShowOnlyKeys(!showOnlyKeys)}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 shadow-2xl backdrop-blur-md group",
                                showOnlyKeys 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20 scale-110" 
                                    : "bg-card/90 border-white/10 text-muted-foreground hover:bg-card hover:border-white/20 hover:text-foreground"
                            )}
                            title={showOnlyKeys ? "Show all columns" : "Show only PK/FK columns"}
                        >
                            <Key className={cn("h-5 w-5 transition-transform duration-500", showOnlyKeys ? "rotate-12 scale-110" : "group-hover:rotate-12")} />
                        </button>
                    )}
                    
                    {!compact && (
                        <button 
                            onClick={() => {
                                setNotationMode(notationMode === 'chen' ? 'crowsfoot' : 'chen');
                            }}
                            className={cn(
                                "flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 shadow-2xl backdrop-blur-md group",
                                "bg-card/90 border-white/10 text-muted-foreground hover:bg-card hover:border-white/20 hover:text-foreground"
                            )}
                            title={notationMode === 'chen' ? "Switch to Crow's Foot Notation" : "Switch to Chen Notation"}
                        >
                            {notationMode === 'chen' ? (
                                <div className="flex font-black text-xs items-center gap-0.5 scale-125 px-1 tracking-tighter">
                                    <span className="text-primary italic">n</span>
                                    <span>:</span>
                                    <span className="text-muted-foreground">1</span>
                                </div>
                            ) : (
                                <div className="flex font-black text-base items-center gap-0 tracking-[-4px] translate-x-1">
                                    <span className="opacity-40 -translate-x-1">|</span>
                                    <span className="text-primary translate-y-[1px] -translate-x-1">&lt;</span>
                                </div>
                            )}
                        </button>
                    )}

                    {schema.viewpoints && schema.viewpoints.length > 0 && (
                        <div className="flex flex-col gap-2 bg-card/90 border-2 border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
                            <h4 className="text-[8px] font-black uppercase tracking-[0.2em] px-2 text-muted-foreground/60">Viewpoint Matrix</h4>
                            <select
                                value={currentViewpoint || ''}
                                onChange={(e) => {
                                    const val = e.target.value || null;
                                    setCurrentViewpoint(val);
                                    onViewpointChange?.(val);
                                }}
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-primary focus:ring-0 outline-none cursor-pointer px-2"
                            >
                                <option value="" className="bg-card text-foreground">Standard (Top {schema.erd_limit || 20})</option>
                                {schema.viewpoints.map((vp: any) => (
                                    <option key={vp.name} value={vp.name} className="bg-card text-foreground">
                                        {vp.name} ({vp.tables?.length || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {currentViewpoint && initialElements.tables.length === 0 && (
                        <div className="bg-destructive/10 border-2 border-destructive/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl max-w-xs animate-in zoom-in duration-500">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-destructive italic mb-2">Empty Viewpoint</h4>
                            <p className="text-[10px] font-bold text-destructive/80 leading-relaxed uppercase">
                                No entities found in this architectural slice. Check schema definitions for identifier mismatches.
                            </p>
                        </div>
                    )}
                    
                    {initialElements.limitReached && (
                        <div className="bg-amber-500/10 border-2 border-amber-500/50 backdrop-blur-xl p-4 rounded-2xl shadow-2xl max-w-xs animate-in slide-in-from-left duration-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500">
                                    <Key className="h-4 w-4 rotate-90" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">Complexity Limit</h4>
                            </div>
                            <p className="text-[10px] font-bold text-amber-500/80 leading-relaxed uppercase">
                                Visualizing {initialElements.limit} of {initialElements.totalCount} entities to maintain graph integrity. Use search or viewpoints for specific context.
                            </p>
                        </div>
                    )}
                </Panel>
                <Background 
                    color={mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'} 
                    gap={40} 
                    size={2}
                    variant={BackgroundVariant.Dots}
                />
                <Controls className="bg-card/80 border-white/10 rounded-xl overflow-hidden backdrop-blur-md !shadow-2xl" />
            </ReactFlow>
        </div>
    );
};

export default DatabaseSchema;
