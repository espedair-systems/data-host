import React, { useEffect, useRef, useMemo, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Register the layout
cytoscape.use(fcose);

interface PhysicsSchemaProps {
    schema: any;
    isolatedFocus?: boolean;
}

const PhysicsSchema: React.FC<PhysicsSchemaProps> = ({ schema, isolatedFocus = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const mode = theme === 'dark' ? 'dark' : 'light';
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

    const allElements = useMemo(() => {
        if (!schema || !schema.tables) return [];

        const nodes: any[] = [];
        const edges: any[] = [];

        schema.tables.forEach((table: any) => {
            nodes.push({
                data: {
                    id: table.name,
                    name: table.name,
                    type: 'table',
                    columnCount: table.columns?.length || 0
                }
            });

            if (table.constraints) {
                table.constraints.forEach((constraint: any) => {
                    if (constraint.type === 'FOREIGN KEY' && constraint.referenced_table) {
                        edges.push({
                            data: {
                                id: `e-${table.name}-${constraint.referenced_table}`,
                                source: constraint.referenced_table,
                                target: table.name,
                                label: constraint.column
                            }
                        });
                    }
                });
            }
        });

        return [...nodes, ...edges];
    }, [schema]);

    const displayElements = useMemo(() => {
        if (!focusedNodeId || !isolatedFocus) return allElements;

        const neighborhood = new Set<string>();
        neighborhood.add(focusedNodeId);

        const edgesToKeep: any[] = [];
        allElements.forEach(el => {
            if (el.data.source && el.data.target) {
                if (el.data.source === focusedNodeId || el.data.target === focusedNodeId) {
                    neighborhood.add(el.data.source);
                    neighborhood.add(el.data.target);
                    edgesToKeep.push(el);
                }
            }
        });

        const nodesToKeep = allElements.filter(el => !el.data.source && neighborhood.has(el.data.id));

        return [...nodesToKeep, ...edgesToKeep];
    }, [allElements, focusedNodeId, isolatedFocus]);

    useEffect(() => {
        if (!containerRef.current || displayElements.length === 0) return;

        const cy = cytoscape({
            container: containerRef.current,
            elements: displayElements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': mode === 'dark' ? '#1e293b' : '#f8fafc',
                        'label': 'data(name)',
                        'color': mode === 'dark' ? '#f1f5f9' : '#0f172a',
                        'font-family': 'Inter, system-ui, sans-serif',
                        'font-weight': 'bold',
                        'font-size': '12px',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'width': 'mapData(columnCount, 1, 20, 60, 120)',
                        'height': 'mapData(columnCount, 1, 20, 60, 120)',
                        'border-width': 2,
                        'border-color': '#3b82f6',
                        'border-opacity': 0.5,
                        'shape': 'round-rectangle',
                        'text-wrap': 'wrap',
                        'text-max-width': '80px',
                        'transition-property': 'background-color, border-color, width, height',
                        'transition-duration': 300,
                        'shadow-blur': 15,
                        'shadow-color': mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
                        'shadow-offset-y': 4
                    } as any
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        'target-arrow-color': mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'arrow-scale': 1.2,
                        'opacity': 0.6
                    } as any
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': '#6366f1',
                        'border-width': 4,
                        'background-color': mode === 'dark' ? '#312e81' : '#e0e7ff'
                    } as any
                },
                {
                    selector: '.highlighted',
                    style: {
                        'background-color': '#10b981',
                        'line-color': '#10b981',
                        'target-arrow-color': '#10b981',
                        'transition-duration': 300
                    } as any
                },
                {
                    selector: '.faded',
                    style: {
                        'opacity': 0.1,
                        'text-opacity': 0
                    } as any
                }
            ],
            layout: focusedNodeId ? {
                name: 'concentric',
                concentric: (node: any) => {
                    return node.id() === focusedNodeId ? 2 : 1;
                },
                levelWidth: () => 1,
                padding: 100,
                animate: true,
                animationDuration: 1000,
                fit: true,
                spacingFactor: 1.5,
                nodeDimensionsIncludeLabels: true
            } : {
                name: 'fcose',
                animate: true,
                animationDuration: 1000,
                fit: true,
                padding: 100,
                nodeDimensionsIncludeLabels: true,
                randomize: true,
                idealEdgeLength: 150,
                nodeRepulsion: 4500,
                gravity: 0.25,
                numIter: 2500,
                initialEnergyOnIncremental: 0.3
            } as any
        });

        cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            if (isolatedFocus) {
                setFocusedNodeId(node.id());
            } else {
                const neighborhoodNodes = node.closedNeighborhood();
                cy.elements().addClass('faded').removeClass('highlighted');
                neighborhoodNodes.removeClass('faded').addClass('highlighted');
            }
        });

        cy.on('tap', (evt) => {
            if (evt.target === cy && !isolatedFocus) {
                cy.elements().removeClass('faded highlighted');
            }
        });

        cyRef.current = cy;

        return () => {
            cy.destroy();
        };
    }, [displayElements, mode, isolatedFocus]);

    return (
        <div className="w-full h-full bg-background/50 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm relative">
            <div ref={containerRef} className="w-full h-full" />
            
            <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                    {focusedNodeId ? 'Isolation Mode' : 'Physics Engine Active'}
                </Badge>
                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1 italic">
                    {focusedNodeId ? `Focused on ${focusedNodeId}` : 'fCoSE Force-Directed Layout'}
                </div>
            </div>

            {focusedNodeId && (
                <div className="absolute top-6 right-6 z-10">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setFocusedNodeId(null)}
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 shadow-2xl gap-2 bg-background/80 backdrop-blur-md border border-white/10"
                    >
                        <X className="h-3.5 w-3.5" />
                        Reset View
                    </Button>
                </div>
            )}

            <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md shadow-2xl space-y-2 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Gravity Control</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">Node Repulsion</span>
                </div>
            </div>
        </div>
    );
};

export default PhysicsSchema;

