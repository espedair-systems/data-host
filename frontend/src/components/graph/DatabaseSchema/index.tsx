import React, { useCallback, useMemo } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { useColorMode } from '@/context/ColorModeContext';
import TableNode from './TableNode';

const nodeTypes = {
    table: TableNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // More generous spacing for premium feel
    const nodeWidth = 300;
    const nodeHeight = 400;

    dagreGraph.setGraph({ 
        rankdir: direction,
        nodesep: 100,
        ranksep: 150,
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
}

const DatabaseSchema: React.FC<DatabaseSchemaProps> = ({ schema }) => {
    const { mode } = useColorMode();
    const initialElements = useMemo(() => {
        if (!schema || !schema.tables) return { nodes: [], edges: [] };

        const nodes: any[] = schema.tables.map((table: any) => ({
            id: table.name,
            type: 'table',
            data: {
                label: table.name,
                columns: table.columns,
            },
            position: { x: 0, y: 0 },
        }));

        const edges: any[] = [];
        schema.tables.forEach((table: any) => {
            if (table.constraints) {
                table.constraints.forEach((constraint: any) => {
                    if (constraint.type === 'FOREIGN KEY' && constraint.referenced_table) {
                        edges.push({
                            id: `e-${table.name}-${constraint.referenced_table}`,
                            source: constraint.referenced_table,
                            target: table.name,
                            animated: true,
                            label: constraint.column || '',
                            labelStyle: { 
                                fill: 'rgba(255, 255, 255, 0.4)', 
                                fontWeight: 900, 
                                fontSize: 10,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: mode === 'dark' ? '#94a3b8' : '#64748b', // Fallback to solid colors for markers
                            },
                            style: { 
                                stroke: mode === 'dark' ? '#94a3b8' : '#64748b',
                                strokeWidth: 2,
                                opacity: 0.8
                            },
                        });
                    }
                });
            }
        });

        return getLayoutedElements(nodes, edges);
    }, [schema]);

    const [nodes, , onNodesChange] = useNodesState(initialElements.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className="w-full h-full bg-background/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                colorMode={mode as any}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
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

// Import BackgroundVariant from ReactFlow if not already present
import { BackgroundVariant } from '@xyflow/react';

export default DatabaseSchema;
