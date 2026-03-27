import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
// @ts-ignore
import fcose from 'cytoscape-fcose';
import { useColorMode } from '../../context/ColorModeContext';
import { Maximize, Expand, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

if (typeof window !== 'undefined') {
    cytoscape.use(fcose);
}

interface FocusErdProps {
    schema: any;
    defaultViewpoint?: string;
}

export const FocusErd: React.FC<FocusErdProps> = ({ schema, defaultViewpoint }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentViewpoint, setCurrentViewpoint] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTruncated, setIsTruncated] = useState(false);
    const { mode } = useColorMode();

    useEffect(() => {
        if (!schema) return;
        const vpMatch = schema?.viewpoints?.find((v: any) => v.name === defaultViewpoint);
        const tabMatch = schema?.tables?.find((t: any) => t.name === defaultViewpoint);

        if (vpMatch) {
            setCurrentViewpoint(vpMatch.name);
            setSelectedTable(null);
            setIsFocused(true);
        } else if (tabMatch) {
            setSelectedTable(tabMatch.name);
            setCurrentViewpoint(null);
            setIsFocused(true);
        }
    }, [defaultViewpoint, schema]);

    const colors = mode === 'dark' ? {
        bg: '#1e1e1e',
        text: '#ffffff',
        nodeBg: '#2d2d2d',
        nodeBorder: '#444444',
        edge: '#6366f1',
        edgeText: '#a1a1aa',
        hairline: '#333333'
    } : {
        bg: '#ffffff',
        text: '#000000',
        nodeBg: '#f9fafb',
        nodeBorder: '#e5e7eb',
        edge: '#4f46e5',
        edgeText: '#71717a',
        hairline: '#f3f4f6'
    };


    useEffect(() => {
        if (!containerRef.current || !schema || !schema.tables) return;

        const nodes: any[] = [];
        const edges: any[] = [];

        // Filter tables based on viewpoint or search if schema is large
        let tablesToRender = schema.tables;
        const erdLimit = schema.erd_limit || 50;
        const isLargeSchema = schema.tables.length > erdLimit;
        setIsTruncated(!selectedTable && !currentViewpoint && isLargeSchema);

        if (selectedTable) {
            // Find the selected table and its neighbors
            const neighbors = new Set<string>();
            neighbors.add(selectedTable);

            schema.tables.forEach((t: any) => {
                if (t.constraints) {
                    t.constraints.forEach((c: any) => {
                        if (c.type === 'FOREIGN KEY') {
                            if (t.name === selectedTable && c.referenced_table) {
                                neighbors.add(c.referenced_table);
                            } else if (c.referenced_table === selectedTable) {
                                neighbors.add(t.name);
                            }
                        }
                    });
                }
            });

            if (schema.relations) {
                schema.relations.forEach((r: any) => {
                    if (r.table === selectedTable) {
                        neighbors.add(r.parent_table);
                    } else if (r.parent_table === selectedTable) {
                        neighbors.add(r.table);
                    }
                });
            }

            tablesToRender = schema.tables.filter((t: any) => neighbors.has(t.name));
        } else if (currentViewpoint && schema.viewpoints) {
            const vp = schema.viewpoints.find((v: any) => v.name === currentViewpoint);
            if (vp) {
                tablesToRender = schema.tables.filter((t: any) => vp.tables.includes(t.name));
            }
        } else if (isLargeSchema) {
            // Show top tables by connection count initially if no viewpoint selected
            const connectionCounts: Record<string, number> = {};
            schema.tables.forEach((t: any) => {
                connectionCounts[t.name] = 0;
            });

            schema.tables.forEach((t: any) => {
                if (t.constraints) {
                    t.constraints.forEach((c: any) => {
                        if (c.type === 'FOREIGN KEY' && c.referenced_table) {
                            connectionCounts[t.name]++;
                            if (connectionCounts[c.referenced_table] !== undefined) {
                                connectionCounts[c.referenced_table]++;
                            }
                        }
                    });
                }
            });

            tablesToRender = [...schema.tables]
                .sort((a, b) => (connectionCounts[b.name] || 0) - (connectionCounts[a.name] || 0))
                .slice(0, erdLimit);
        }

        const renderedTableNames = new Set(tablesToRender.map((t: any) => t.name));

        tablesToRender.forEach((table: any) => {
            nodes.push({
                data: {
                    id: table.name,
                    label: table.name,
                    comment: table.comment,
                    width: table.name.length * 8 + 30,
                    height: 40
                },
            });
        });

        // Add edges from tables constraints
        schema.tables.forEach((table: any) => {
            if (table.constraints) {
                table.constraints.forEach((constraint: any) => {
                    if (constraint.type === 'FOREIGN KEY' &&
                        constraint.referenced_table &&
                        renderedTableNames.has(table.name) &&
                        renderedTableNames.has(constraint.referenced_table)) {
                        edges.push({
                            data: {
                                id: `${table.name}-${constraint.referenced_table}-c`,
                                source: table.name,
                                target: constraint.referenced_table,
                                label: constraint.columns?.join(', ') || '',
                            },
                        });
                    }
                });
            }
        });

        // Add edges from root relations (standard for tbls)
        if (schema.relations) {
            schema.relations.forEach((r: any) => {
                if (renderedTableNames.has(r.table) && renderedTableNames.has(r.parent_table)) {
                    // Check if edge already exists to avoid duplicates
                    const edgeId = `${r.table}-${r.parent_table}-r`;
                    if (!edges.some(e => e.data.source === r.table && e.data.target === r.parent_table)) {
                        edges.push({
                            data: {
                                id: edgeId,
                                source: r.table,
                                target: r.parent_table,
                                label: r.columns?.join(', ') || '',
                            },
                        });
                    }
                }
            });
        }

        const cy = cytoscape({
            container: containerRef.current,
            elements: {
                nodes,
                edges,
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': colors.nodeBg,
                        'label': 'data(label)',
                        'color': colors.text,
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': '12px',
                        'width': 'data(width)',
                        'height': 'data(height)',
                        'shape': 'rectangle',
                        'border-width': 1,
                        'border-color': colors.nodeBorder,
                    },
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': colors.edge,
                        'target-arrow-color': colors.edge,
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'font-size': '8px',
                        'color': colors.edgeText,
                        'text-rotation': 'autorotate',
                        'opacity': 0.8
                    },
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-color': colors.edge,
                        'border-width': 3,
                    }
                },
                {
                    selector: '.hidden',
                    style: {
                        'display': 'none'
                    }
                }
            ],
            layout: {
                name: 'fcose',
                quality: 'proof',
                randomize: false,
                animate: true,
                fit: true,
                padding: 30,
                nodeDimensionsIncludeLabels: true,
            } as any,
        });

        cyRef.current = cy;

        cy.on('tap', 'node', (evt) => {
            if (evt.originalEvent && typeof evt.originalEvent.preventDefault === 'function') {
                evt.originalEvent.preventDefault();
            }
            setSelectedTable(evt.target.id());
        });

        cy.on('dbltap', 'node', (evt) => {
            if (evt.originalEvent && typeof evt.originalEvent.preventDefault === 'function') {
                evt.originalEvent.preventDefault();
            }
            const node = evt.target;
            focusOnNode(node);
        });

        const focusOnNode = (node: cytoscape.NodeSingular) => {
            const tableName = node.id();
            setSelectedTable(tableName);
            const neighborhood = node.closedNeighborhood();
            const others = cy.elements().not(neighborhood);

            cy.batch(() => {
                others.addClass('hidden');
                neighborhood.removeClass('hidden');
                setIsFocused(true);
            });

            const p = node.position();

            const layout = neighborhood.layout({
                name: 'concentric',
                fit: true,
                animate: true,
                animationDuration: 500,
                padding: 100,
                boundingBox: {
                    x1: p.x - 1,
                    x2: p.x + 1,
                    y1: p.y - 1,
                    y2: p.y + 1
                },
                avoidOverlap: true,
                concentric: (ele: any) => {
                    return ele.same(node) ? 2 : 1;
                },
                levelWidth: () => 1,
                nodeDimensionsIncludeLabels: true,
            } as any);

            layout.run();
        };

        if (selectedTable) {
            setIsFocused(true);
        }

        return () => {
            cy.destroy();
        };
    }, [schema, colors, currentViewpoint, selectedTable]);

    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.resize();
            cyRef.current.fit(undefined, 50);
        }
    }, [isFullScreen]);

    const resetView = () => {
        if (!cyRef.current) return;
        const cy = cyRef.current;

        cy.batch(() => {
            cy.elements().removeClass('hidden');
            setIsFocused(false);
            setSelectedTable(null);
        });

        const layout = cy.layout({
            name: 'fcose',
            animate: true,
            fit: true,
            padding: 30,
            nodeDimensionsIncludeLabels: true,
        } as any);

        layout.run();
    };

    const containerStyle: React.CSSProperties = isFullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        background: colors.bg,
    } : {
        width: '100%',
        height: '100%',
        minHeight: '600px',
        background: colors.bg,
        borderRadius: '16px',
        border: `1px solid ${colors.hairline}`,
        position: 'relative',
        overflow: 'hidden'
    };

    const panelStyle: React.CSSProperties = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 11,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.hairline}`,
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        width: '260px',
        maxHeight: 'calc(100% - 40px)',
        overflowY: 'auto'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '6px',
        backgroundColor: colors.hairline,
        color: colors.text,
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        width: '100%',
        flex: 1,
        margin: 0,
        boxSizing: 'border-box',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={containerStyle}>
            <div style={panelStyle} className="animate-in fade-in zoom-in-95 duration-300">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={() => isFocused ? resetView() : cyRef.current?.fit(undefined, 50)}
                            style={buttonStyle}
                            title={isFocused ? "Reset View" : "Fit View"}
                            className="hover:bg-primary/20 hover:text-primary"
                        >
                            {isFocused ? <RotateCcw size={18} /> : <Maximize size={18} />}
                        </button>
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            style={buttonStyle}
                            title={isFullScreen ? 'Exit Full' : 'Full View'}
                            className="hover:bg-primary/20 hover:text-primary"
                        >
                            <Expand size={18} />
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search table..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery) {
                                const found = schema.tables.find((t: any) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
                                if (found && cyRef.current) {
                                    const node = cyRef.current.getElementById(found.name);
                                    if (node.length > 0) {
                                        cyRef.current.animate({ fit: { eles: node, padding: 100 }, duration: 500 });
                                        setSelectedTable(found.name);
                                    } else {
                                        setCurrentViewpoint(null);
                                        setSelectedTable(found.name);
                                    }
                                }
                            }
                        }}
                        style={{
                            fontSize: '13px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: `1px solid ${colors.hairline}`,
                            background: 'transparent',
                            color: colors.text,
                            outline: 'none'
                        }}
                        className="focus:border-primary/50 transition-all font-medium"
                    />

                    {schema.viewpoints && schema.viewpoints.length > 0 && (
                        <select
                            value={currentViewpoint || ''}
                            onChange={(e) => setCurrentViewpoint(e.target.value || null)}
                            style={{
                                fontSize: '12px',
                                padding: '8px 10px',
                                borderRadius: '10px',
                                border: `1px solid ${colors.hairline}`,
                                background: 'transparent',
                                color: colors.text,
                                outline: 'none'
                            }}
                            className="focus:border-primary/50 transition-all font-bold uppercase tracking-tight"
                        >
                            <option value="" style={{ background: colors.bg }}>All Tables (Top {schema.erd_limit || 50})</option>
                            {schema.viewpoints.map((vp: any) => (
                                <option key={vp.name} value={vp.name} style={{ background: colors.bg }}>
                                    View: {vp.name} ({vp.tables.length})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {isTruncated && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Display Limit Reach</span>
                        </div>
                        <p className="text-[9px] font-bold text-amber-500/70 leading-relaxed uppercase">
                            Showing top {schema.erd_limit || 50} of {schema.tables.length} entities. Use search to find specific tables.
                        </p>
                    </div>
                )}

                {selectedTable && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: `1px solid ${colors.hairline}`, paddingTop: '12px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <h4 className="font-black text-lg tracking-tighter uppercase italic text-primary leading-none">
                                {selectedTable}
                            </h4>
                            {schema.tables.find((t: any) => t.name === selectedTable)?.comment && (
                                <p style={{ fontSize: '11px', color: colors.edgeText, margin: '4px 0 0 0', lineHeight: '1.4' }} className="font-medium italic">
                                    {schema.tables.find((t: any) => t.name === selectedTable).comment}
                                </p>
                            )}
                        </div>
                        <div className="pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-[10px] font-black uppercase tracking-widest h-9 rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                onClick={() => {
                                    // Handle navigation or detail view
                                    window.dispatchEvent(new CustomEvent('table-detail', { detail: selectedTable }));
                                }}
                            >
                                Entity Metadata →
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};
