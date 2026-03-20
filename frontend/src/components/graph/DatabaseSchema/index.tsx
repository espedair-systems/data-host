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

import TableNode from './TableNode';

const nodeTypes = {
    table: TableNode,
};

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 250;
    const nodeHeight = 300;

    dagreGraph.setGraph({ rankdir: direction });

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

        // We are shifting the dagre node position (which is center-based) to top-left
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
                            labelStyle: { fill: '#888', fontWeight: 700, fontSize: 10 },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                width: 20,
                                height: 20,
                                color: '#4f46e5',
                            },
                            style: { stroke: '#4f46e5', strokeWidth: 2 },
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
        <div className="w-full h-full bg-background/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-inner">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                colorMode="dark"
            >
                <Background color="#333" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default DatabaseSchema;
