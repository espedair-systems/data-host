import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ReactFlow, 
    Controls, 
    Background, 
    useNodesState, 
    useEdgesState, 
    addEdge, 
    Handle, 
    Position, 
    Panel,
    MarkerType
} from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
    ArrowLeft, 
    Workflow, 
    Settings, 
    Database, 
    Share2, 
    Download, 
    RefreshCw,
    Layers,
    Layout as LayoutIcon,
    Box,
    Activity,
    Zap,
    Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import dagre from 'dagre';

// --- Custom Node Components inspired by the 'dfd' reference repository ---

const ProcessNode = ({ data }: any) => (
    <div className="relative group/node">
        <div className="absolute -inset-1.5 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover/node:opacity-100 transition-opacity" />
        <div className="min-w-[140px] px-8 py-10 bg-slate-900/90 border-slate-700 text-white rounded-[50%/50%] shadow-2xl flex flex-col items-center justify-center text-center gap-1 border-2 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20 opacity-30" />
            <Settings className="h-4 w-4 text-amber-500/50 mb-1 animate-spin-slow" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/40 leading-none">PROCESS</div>
            <div className="text-sm font-bold tracking-tight uppercase leading-tight">{data.label}</div>
            
            <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
            <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
        </div>
    </div>
);

const ControlNode = ({ data }: any) => (
    <div className="relative group/node">
        <div className="absolute -inset-1.5 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover/node:opacity-100 transition-opacity" />
        <div className="min-w-[140px] px-8 py-10 bg-slate-950/90 border-amber-500/30 border-dashed text-white rounded-[50%/50%] shadow-2xl flex flex-col items-center justify-center text-center gap-1 border-2 relative overflow-hidden backdrop-blur-xl">
            <Zap className="h-4 w-4 text-amber-500 mb-1" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 leading-none">CONTROL</div>
            <div className="text-sm font-bold tracking-tight uppercase leading-tight">{data.label}</div>
            
            <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
            <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
        </div>
    </div>
);

const ExternalEntityNode = ({ data }: any) => (
    <div className="group/node">
        <div className="min-w-[140px] px-6 py-6 bg-slate-900/90 border-slate-700 text-white rounded-none shadow-2xl flex flex-col items-center justify-center text-center gap-2 border-2 backdrop-blur-xl">
            <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
            <Box className="h-4 w-4 text-teal-500/50 mb-1" />
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400/40 leading-none">EXTERNAL ENTITY</div>
            <div className="text-sm font-bold tracking-tight uppercase leading-tight">{data.label}</div>
            
            <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-teal-500 border-2 border-slate-950 rounded-full" />
            <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-teal-500 border-2 border-slate-950 rounded-full" />
        </div>
    </div>
);

const DataStoreNode = ({ data }: any) => (
    <div className="group/node bg-amber-500/5 p-2 rounded-xl backdrop-blur-md">
        <div className="flex flex-col items-center justify-center p-6 border-y-2 border-emerald-500/30 min-w-[160px] bg-slate-900/80">
             <Database className="h-4 w-4 text-emerald-500 mb-2" />
             <div className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/60 leading-none mb-1">DATA STORE</div>
             <div className="text-sm font-bold tracking-tight uppercase leading-tight text-white/90">{data.label}</div>
             
             <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
             <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
        </div>
    </div>
);

const ChannelNode = ({ data }: any) => (
    <div className="group/node flex flex-row items-center border-2 border-slate-700 p-1 bg-slate-950 shadow-2xl overflow-hidden min-h-[70px] min-w-[200px] backdrop-blur-xl">
        <div className="w-2 self-stretch bg-amber-500" />
        <div className="flex-grow px-4 py-2 flex flex-col items-center justify-center gap-1">
             <Radio className="h-4 w-4 text-amber-500/50" />
             <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/40 leading-none">CHANNEL</div>
             <div className="text-sm font-bold tracking-tight uppercase leading-tight text-white/90">{data.label}</div>
        </div>
        <div className="w-2 self-stretch bg-amber-500" />
        
        <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
        <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-amber-500 border-2 border-slate-950 rounded-full" />
    </div>
);

// --- Layout Logic ---

const nodeTypes = {
    process: ProcessNode,
    control: ControlNode,
    external_entity: ExternalEntityNode,
    data_store: DataStoreNode,
    channel: ChannelNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    
    // Set node dimensions in dagre (approximate based on components)
    const nodeWidth = 220;
    const nodeHeight = 150;
    
    dagreGraph.setGraph({ rankdir: direction, nodesep: 140, ranksep: 140 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// --- Main Page Component ---

const DataFlows: React.FC = () => {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);

    const fetchDFD = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/ingestion/ingest-dfd', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                
                const rawNodes = data.elements?.nodes || [];
                const rawEdges = data.elements?.edges || [];

                // Map to React Flow components with inspired styling
                const mappedNodes: any[] = rawNodes.map((n: any) => ({
                    id: n.data.id,
                    type: n.data.type || 'process',
                    data: { 
                        label: n.data.name || n.data.label || n.data.id,
                        description: n.data.description || n.data.desc || ''
                    },
                    position: { x: 0, y: 0 },
                }));

                const mappedEdges: any[] = rawEdges.map((e: any) => {
                    // Detect edge type based on inspirationDSL: ->> , --> , ::>
                    const label = e.data.label || '';
                    const isControl = label.toLowerCase().includes('control') || e.data.type === 'control' || e.data.style === 'dashed';
                    const isContinuous = e.data.style === 'continuous' || label.toLowerCase().includes('continuous');
                    
                    return {
                        id: e.data.id,
                        source: e.data.source,
                        target: e.data.target,
                        label: label,
                        labelStyle: { fill: '#888', fontStyle: 'italic', fontWeight: 700, fontSize: 10 },
                        labelBgStyle: { fill: 'rgba(15, 23, 42, 0.8)' },
                        labelBgPadding: [4, 2],
                        labelBgBorderRadius: 4,
                        type: 'step',
                        animated: !isControl,
                        style: { 
                            stroke: isControl ? '#f59e0b' : (isContinuous ? '#818cf8' : '#cbd5e1'), 
                            strokeWidth: isContinuous ? 3 : 2, 
                            strokeDasharray: isControl ? '5 5' : undefined 
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: isControl ? '#f59e0b' : (isContinuous ? '#818cf8' : '#cbd5e1'),
                        },
                    };
                });

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mappedNodes, mappedEdges);
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                
                toast.success("Design Pattern Synthesized", { 
                    description: `Successfully implemented DFD logic with ${layoutedNodes.length} operational units.`
                });
            } else {
                toast.error("Pipeline Failed", { description: "Data context missing in the database." });
            }
        } catch (error) {
            console.error('Failed to fetch DFD:', error);
            toast.error("Network Error", { description: "Backend unreachable." });
        } finally {
            setLoading(false);
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        fetchDFD();
    }, [fetchDFD]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const applyLayout = useCallback((direction: string) => {
        const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges, direction);
        setNodes(layoutedNodes as Node[]);
    }, [nodes, edges, setNodes]);

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative group/page pt-4 overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
                <Badge className="bg-amber-500 text-white border-none rounded-b-xl font-black px-8 py-1 uppercase tracking-widest text-[10px] shadow-lg">
                    System Architecture
                </Badge>
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[200px] -z-10 pointer-events-none" />
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-2xl bg-card/50 border border-white/5 hover:bg-amber-500/20 hover:text-amber-500 transition-all shadow-xl backdrop-blur-md"
                            onClick={() => navigate('/scratchpad')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-70 italic">
                                <Workflow className="h-3 w-3" />
                                Engineering Design Pattern
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 italic uppercase leading-tight">
                                Data <span className="text-amber-500/80 not-italic text-2xl font-black">Flows</span>
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pb-1">
                    <Button 
                        variant="ghost" 
                        onClick={() => fetchDFD()}
                        className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4 gap-2 border border-white/5 hover:bg-white/5 transition-all text-white/40"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                    <div className="h-8 w-[1px] bg-white/10 mx-2" />
                    <Button variant="outline" className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-4 gap-2 border-white/10 hover:bg-white/5 transition-all">
                        <Download className="h-3 w-3" />
                        SVG
                    </Button>
                    <Button className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10 px-6 gap-2 bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-lg">
                        <Share2 className="h-3 w-3" />
                        Share
                    </Button>
                </div>
            </header>

            <div className="flex-grow flex items-center justify-center rounded-[2.5rem] border border-white/5 bg-muted/5 backdrop-blur-md relative overflow-hidden group/canvas shadow-2xl">
                {/* Blueprint Background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.02)_0%,transparent_70%)]" />
                
                {loading ? (
                    <div className="flex flex-col items-center gap-4 text-white/40 uppercase tracking-[0.3em] font-black text-[10px]">
                        <Activity className="h-10 w-10 animate-pulse text-amber-500 mb-2" />
                        Synthesizing Operational Layers...
                    </div>
                ) : nodes.length > 0 ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        className="react-flow-dark"
                    >
                        <Panel position="top-right" className="flex gap-2 p-4">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-slate-950/60 border-white/5 rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 backdrop-blur-md transition-all"
                                onClick={() => applyLayout('TB')}
                             >
                                <Layers className="h-3 w-3 mr-2 text-amber-500/60" />
                                Vertical
                             </Button>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-slate-950/60 border-white/5 rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest text-white/50 hover:bg-white/5 backdrop-blur-md transition-all"
                                onClick={() => applyLayout('LR')}
                             >
                                <LayoutIcon className="h-3 w-3 mr-2 rotate-90 text-amber-500/60" />
                                Horizontal
                             </Button>
                        </Panel>

                        <Background color="#ffffff" gap={20} size={1} style={{ opacity: 0.03 }} />
                        <Controls className="bg-slate-950/80 border-white/5 rounded-xl overflow-hidden shadow-2xl m-4" />
                    </ReactFlow>
                ) : (
                    <div className="text-center space-y-8 animate-in slide-in-from-bottom-4 duration-1000 text-center flex flex-col items-center max-w-md px-12">
                         <Workflow className="h-16 w-16 text-amber-500/10 mx-auto animate-pulse" />
                        <div className="space-y-3">
                             <h3 className="text-3xl font-black italic tracking-tighter text-white/90 uppercase">Visualization Core Offline</h3>
                             <p className="text-white/30 text-[10px] font-bold leading-relaxed uppercase tracking-[0.3em] mx-auto text-center">
                                No operational context found in the active namespace. 
                                Please re-initialize the ingestion pipeline.
                             </p>
                        </div>
                        <Button 
                            variant="secondary" 
                            className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 bg-amber-500 text-black hover:bg-amber-400 transition-all font-black"
                            onClick={() => navigate('/ingestion')}
                        >
                            Ingest DFD DSL
                        </Button>
                    </div>
                )}
            </div>

            <footer className="flex items-center justify-between px-8 py-4 bg-muted/5 rounded-3xl border border-white/5 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                <div className="flex items-center gap-6">
                    <div>Operation Units: <span className="text-amber-500">{nodes.length}</span></div>
                    <div>Logical Flows: <span className="text-amber-500">{edges.length}</span></div>
                </div>
                <div>Operational Engine // Inspired by Engineering DFD DSL v1.0.8</div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    Registry Ready
                </div>
            </footer>
        </div>
    );
};

export default DataFlows;
