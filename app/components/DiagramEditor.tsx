'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    NodeTypes,
    EdgeTypes,
    Node,
    Edge,
    useReactFlow,
    ConnectionLineType,
    addEdge,
    Connection,
} from 'reactflow';
import { useDiagramStore } from '../store/diagramStore';
import { generateVerilogCode } from '../lib/verilogGenerator';
import ComponentSidebar from './ComponentSidebar';
import CodePanel from './CodePanel';
import Header from './Header';
import {
    AndGateNode,
    OrGateNode,
    NotGateNode,
    NandGateNode,
    NorGateNode,
    XorGateNode,
    XnorGateNode,
    BufferNode,
    DffNode,
    InputNode,
    OutputNode,
    ClockNode,
    MuxNode,
    ArithmeticNode,
    JunctionNode,
    ConstantNode,
} from './GateNodes';
import { CustomEdge } from './CustomEdge';

function DiagramEditorInner() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        moduleName,
        setNodes,
        setEdges,
        onConnect: onConnectStore, // Use store action which relies on fresh state
    } = useDiagramStore();

    const [verilogCode, setVerilogCode] = useState('');
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [copiedNode, setCopiedNode] = useState<Node | null>(null); // Clipboard for copy/paste
    const [inputCounterRef, outputCounterRef, clockCounterRef] = [useRef(0), useRef(0), useRef(0)];
    // ...
    // ...


    const { screenToFlowPosition } = useReactFlow();

    // Define custom node types
    const nodeTypes: NodeTypes = useMemo(
        () => ({
            and: AndGateNode,
            or: OrGateNode,
            not: NotGateNode,
            nand: NandGateNode,
            nor: NorGateNode,
            xor: XorGateNode,
            xnor: XnorGateNode,
            buffer: BufferNode,
            dff: DffNode,
            input: InputNode,
            output: OutputNode,
            clock: ClockNode,
            mux2: MuxNode,
            mux4: MuxNode,
            demux2: MuxNode,
            decoder: MuxNode,
            add: ArithmeticNode,
            sub: ArithmeticNode,
            mul: ArithmeticNode,
            comp: ArithmeticNode,
            junction: JunctionNode,
            constant: ConstantNode,
        }),
        []
    );

    // Define custom edge types
    const edgeTypes: EdgeTypes = useMemo(
        () => ({
            default: CustomEdge,
            custom: CustomEdge,
        }),
        []
    );

    // Auto-propagate bit widths
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            let changed = false;

            const newNodes = nodes.map(node => {
                const nodeType = node.data?.componentType || node.type || '';

                // Skip source nodes that define width manually
                if (['input', 'clock', 'text'].includes(nodeType)) return node;

                const inputEdges = edges.filter(e => e.target === node.id);
                // If no inputs, keep current (allows manual set for disconnected nodes)
                if (inputEdges.length === 0) return node;

                // Calculate max width from relevant inputs
                let maxWidth = 1;
                let hasRelevantInput = false;

                inputEdges.forEach(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    if (!sourceNode) return;

                    // Ignore specific control ports for width calculation
                    // Ignore specific control ports for width calculation
                    if (nodeType === 'dff' && edge.targetHandle === 'clk') return;
                    if ((nodeType.startsWith('mux') || node.data?.label?.startsWith('mux')) && edge.targetHandle === 'sel') return;

                    hasRelevantInput = true;

                    // Special case: Comparator source has output width 1, regardless of its internal bitWidth
                    const srcType = sourceNode.data?.componentType || sourceNode.type;
                    let srcWidth = parseInt(sourceNode.data?.bitWidth || '1', 10);
                    if (srcType === 'comp') {
                        srcWidth = 1;
                    }

                    if (srcWidth > maxWidth) maxWidth = srcWidth;
                });

                // If existing inputs are only control signals (e.g. only clk connected to dff), don't reset to 1
                if (!hasRelevantInput) return node;

                const currentWidth = parseInt(node.data?.bitWidth || '1', 10);

                if (maxWidth !== currentWidth) {
                    changed = true;
                    return {
                        ...node,
                        data: { ...node.data, bitWidth: maxWidth.toString() }
                    };
                }
                return node;
            });

            if (changed) {
                setNodes(newNodes);
            }
        }, 10); // Debounce slightly

        return () => clearTimeout(timeoutId);
    }, [nodes, edges, setNodes]);

    // Generate Verilog code whenever nodes or edges change
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            const code = generateVerilogCode(nodes, edges, {
                moduleName: moduleName.replace(/\s+/g, '_').toLowerCase(),
                author: 'block2hdl',
                date: new Date().toISOString().split('T')[0],
                version: '1.0',
            });
            setVerilogCode(code);
        } else {
            setVerilogCode('// Add components to generate Verilog code');
        }
    }, [nodes, edges, moduleName]);

    // Handle keyboard events for copy/paste and deletion
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent default only when in canvas, not in input fields
            const isInputField = (event.target as HTMLElement).tagName === 'INPUT' ||
                (event.target as HTMLElement).tagName === 'TEXTAREA';

            // Ctrl+C to copy selected node
            if ((event.ctrlKey || event.metaKey) && event.key === 'c' && selectedNode && !isInputField) {
                event.preventDefault();
                setCopiedNode(selectedNode);
                return;
            }

            // Ctrl+V to paste copied node
            if ((event.ctrlKey || event.metaKey) && event.key === 'v' && copiedNode && !isInputField) {
                event.preventDefault();

                // Auto-increment labels for I/O ports
                let newLabel = copiedNode.data.label;
                if (copiedNode.type === 'input') {
                    newLabel = `i_data${inputCounterRef.current}`;
                    inputCounterRef.current += 1;
                } else if (copiedNode.type === 'output') {
                    newLabel = `o_data${outputCounterRef.current}`;
                    outputCounterRef.current += 1;
                } else if (copiedNode.type === 'clock') {
                    newLabel = clockCounterRef.current === 0 ? 'clk' : `clk${clockCounterRef.current}`;
                    clockCounterRef.current += 1;
                }

                const newNode: Node = {
                    ...copiedNode,
                    id: `${copiedNode.type}_${Date.now()}`,
                    position: {
                        x: copiedNode.position.x + 20,
                        y: copiedNode.position.y + 20,
                    },
                    selected: true,
                    data: {
                        ...copiedNode.data,
                        label: newLabel,
                    },
                };

                // Add new node and deselect all others
                setNodes([...nodes.map(n => ({ ...n, selected: false })), newNode]);
                setSelectedNode(newNode);
                setCopiedNode(newNode);
                return;
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                // Prevent default backspace navigation
                if (event.key === 'Backspace' && (event.target as HTMLElement).tagName !== 'INPUT') {
                    event.preventDefault();
                }

                // Delete selected node
                if (selectedNode) {
                    setNodes(nodes.filter(node => node.id !== selectedNode.id));
                    // Also delete connected edges
                    setEdges(edges.filter(edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
                    setSelectedNode(null);
                }

                // Delete selected edge
                if (selectedEdge) {
                    let newEdges = edges.filter(edge => edge.id !== selectedEdge.id);
                    let newNodes = [...nodes];

                    // Recursive cleanup of Junctions
                    // When a junction becomes redundant (<= 2 connections), clean it up
                    let changed = true;
                    while (changed) {
                        changed = false;
                        const junctions = newNodes.filter(n => n.type === 'junction');

                        for (const j of junctions) {
                            const connected = newEdges.filter(e => e.source === j.id || e.target === j.id);

                            if (connected.length < 2) {
                                // Case 1: Orphan or Dead-end (0 or 1 connection) -> Delete
                                newNodes = newNodes.filter(n => n.id !== j.id);
                                // Remove any attached edges (the single one left)
                                newEdges = newEdges.filter(e => e.source !== j.id && e.target !== j.id);
                                changed = true;
                                break; // Restart scan
                            } else if (connected.length === 2) {
                                // Case 2: Pass-through (1 in, 1 out) -> Merge
                                const inbound = connected.find(e => e.target === j.id);
                                const outbound = connected.find(e => e.source === j.id);

                                if (inbound && outbound) {
                                    // Create direct connection
                                    const mergedEdge: Edge = {
                                        id: `e_merged_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                        source: inbound.source,
                                        sourceHandle: inbound.sourceHandle,
                                        target: outbound.target,
                                        targetHandle: outbound.targetHandle,
                                        type: 'custom',
                                        style: inbound.style, // Preserve style
                                    };

                                    // Replace old 2 edges with 1 merged edge
                                    newEdges = [...newEdges.filter(e => e.id !== inbound.id && e.id !== outbound.id), mergedEdge];
                                    newNodes = newNodes.filter(n => n.id !== j.id);
                                    changed = true;
                                    break;
                                }
                            }
                        }
                    }

                    setEdges(newEdges);
                    setNodes(newNodes);
                    setSelectedEdge(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNode, selectedEdge, copiedNode, nodes, edges, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => {
            // Use store's onConnect which relies on fresh state via get().edges
            onConnectStore({ ...params, type: 'custom' } as any);
        },
        [onConnectStore]
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = useCallback(() => {
        const flow = { nodes, edges };
        const jsonString = JSON.stringify(flow, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${moduleName || 'diagram'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [nodes, edges, moduleName]);

    const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const flow = JSON.parse(content);

                if (flow.nodes && flow.edges) {
                    setNodes(flow.nodes);
                    setEdges(flow.edges);
                } else {
                    alert('Invalid diagram file format');
                }
            } catch (error) {
                console.error('Error parsing diagram file:', error);
                alert('Failed to parse diagram file');
            }
        };
        reader.readAsText(file);
        // Reset input value to allow loading same file again
        event.target.value = '';
    }, [setNodes, setEdges]);

    const handleAutoRoute = useCallback(() => {
        // 1. Snapshot and Snap Components to Grid
        // We filter out Junctions immediately because we will regenerate them
        let currentNodes = nodes.filter(n => n.type !== 'junction').map(node => {
            const shouldResetDimensions = ['input', 'output', 'clock'].includes(node.type || '');
            return {
                ...node,
                position: {
                    x: Math.round(node.position.x / 15) * 15,
                    y: Math.round(node.position.y / 15) * 15
                },
                width: shouldResetDimensions ? undefined : node.width,
                height: shouldResetDimensions ? undefined : node.height,
            };
        });

        // 2. Discover Logical Nets (Connectivity)
        // Map: "SourceNodeId-HandleId" -> List of Target {node, handle}
        const nets = new Map<string, Array<{ id: string, handle: string | null, node: Node }>>();

        // Helper to get all targets reachable from a source handle
        // We traverse the EXISTING edges to find end-points
        const visitedEdges = new Set<string>();

        const traceTargets = (nodeId: string, handleId: string | null | undefined): Array<{ id: string, handle: string | null, node: Node }> => {
            const results: Array<{ id: string, handle: string | null, node: Node }> = [];

            // Find edges starting from this node/handle
            // If handleId is null (e.g. from a junction), take all outgoing
            const outgoing = edges.filter(e =>
                e.source === nodeId &&
                (!handleId || e.sourceHandle === handleId)
            );

            for (const edge of outgoing) {
                if (visitedEdges.has(edge.id)) continue;
                visitedEdges.add(edge.id);

                const tNode = nodes.find(n => n.id === edge.target);
                if (!tNode) continue;

                if (tNode.type === 'junction') {
                    // Pass-through: recurse from junction
                    results.push(...traceTargets(tNode.id, null));
                } else {
                    // It's a component (Sink)
                    results.push({ id: tNode.id, handle: edge.targetHandle || null, node: tNode });
                }
            }
            return results;
        };

        // Build Connectivity Map from Sources
        currentNodes.forEach(src => {
            // Find handles that drive nets (Output, or any handle having outgoing edges)
            const sourceEdges = edges.filter(e => e.source === src.id);
            const sourceHandles = new Set(sourceEdges.map(e => e.sourceHandle));

            sourceHandles.forEach(hId => {
                const targets = traceTargets(src.id, hId);
                // Deduplicate targets
                const uniqueTargets = new Map();
                targets.forEach(t => uniqueTargets.set(`${t.id}-${t.handle}`, t));

                if (uniqueTargets.size > 0) {
                    nets.set(`${src.id}-${hId || 'default'}`, Array.from(uniqueTargets.values()));
                }
            });
        });

        // 3. Generate New Routing Elements
        const newEdges: Edge[] = [];
        const newJunctions: Node[] = [];

        // Helper: Get Handle Y Offset
        // Helper: Get Handle Y Offset
        const getHandleOffsetY = (node: Node, handleId: string | null) => {
            if (handleId === 'a') return 15;
            if (handleId === 'b') return 45;

            // Use measured height if available
            if (node.height) return node.height / 2;

            // Fallback based on type for unmeasured/reset nodes
            const compactTypes = ['input', 'output', 'clock', 'junction', 'not', 'buffer'];
            if (compactTypes.includes(node.type || '')) {
                return 15; // 30px height -> Center 15
            }
            return 30; // Standard Gates (60px height) -> Center 30
        };

        // Track occupied channel X positions to prevent overlap
        const occupiedChannels = new Set<number>();

        // Sort nets by Source X, then Source Y for deterministic ordering
        const sortedNets = Array.from(nets.entries()).sort((a, b) => {
            const nodeA = currentNodes.find(n => n.id === a[0].split('-')[0]);
            const nodeB = currentNodes.find(n => n.id === b[0].split('-')[0]);
            if (!nodeA || !nodeB) return 0;
            if (Math.abs(nodeA.position.x - nodeB.position.x) > 10) return nodeA.position.x - nodeB.position.x;
            return nodeA.position.y - nodeB.position.y;
        });

        sortedNets.forEach(([key, targets]) => {
            const [srcId, srcHandle] = key.split('-');
            const srcNode = currentNodes.find(n => n.id === srcId);
            if (!srcNode) return;

            const handleId = srcHandle === 'default' ? null : srcHandle;
            const srcY = srcNode.position.y + getHandleOffsetY(srcNode, handleId);

            // Strategy: Direct vs Channel
            if (targets.length === 1) {
                // Direct constraint-free routing
                const target = targets[0];
                newEdges.push({
                    id: `e_auto_${Date.now()}_${newEdges.length}`,
                    source: srcId,
                    sourceHandle: handleId,
                    target: target.id,
                    targetHandle: target.handle,
                    type: 'custom'
                });
            } else {
                // Vertical Channel Routing

                // Determine Channel X relative to THIS source
                const srcWidth = (srcNode.width || 60) + (srcNode.type === 'input' ? 20 : 0);
                let channelX = Math.round((srcNode.position.x + srcWidth + 40) / 10) * 10; // Snap

                // Collision Avoidance
                // We use a small range check because float/rounding might differ, though we snapped.
                while (occupiedChannels.has(channelX)) {
                    channelX += 15; // Shift right
                }
                occupiedChannels.add(channelX);

                // 1. Identify all Y-coordinates involved (Source + Taps)
                const points = [
                    { y: srcY, type: 'source', id: srcId, handle: handleId }
                ];

                targets.forEach(t => {
                    const tY = t.node.position.y + getHandleOffsetY(t.node, t.handle);
                    points.push({ y: tY, type: 'target', id: t.id, handle: t.handle });
                });

                // Sort by Y
                points.sort((a, b) => a.y - b.y);

                // Deduplicate Ys
                const yToJunction = new Map<number, string>();
                const uniqueYs = Array.from(new Set(points.map(p => p.y))).sort((a, b) => a - b);

                uniqueYs.forEach(y => {
                    const junctionId = `j_channel_${Date.now()}_${newJunctions.length}`;
                    const junctionNode: Node = {
                        id: junctionId,
                        type: 'junction',
                        position: { x: channelX, y: y - 15 }, // Center (+15) at Y
                        data: { label: '' },
                        width: 30,
                        height: 30,
                    };
                    newJunctions.push(junctionNode);
                    yToJunction.set(y, junctionId);
                });

                // Vertical Spine Connections
                for (let i = 0; i < uniqueYs.length - 1; i++) {
                    const currentY = uniqueYs[i];
                    const nextY = uniqueYs[i + 1];
                    const j1 = yToJunction.get(currentY)!;
                    const j2 = yToJunction.get(nextY)!;

                    newEdges.push({
                        id: `e_spine_${Date.now()}_${newEdges.length}`,
                        source: j1,
                        sourceHandle: 'bottom-source', // Connect from bottom of upper junction
                        target: j2,
                        targetHandle: 't', // Connect to top of lower junction (assuming 't' is top target)
                        type: 'custom'
                    });
                }

                // Connect Source to Spine
                const srcJunctionId = yToJunction.get(srcY);
                if (srcJunctionId) {
                    newEdges.push({
                        id: `e_src_spine_${Date.now()}_${newEdges.length}`,
                        source: srcId,
                        sourceHandle: handleId,
                        target: srcJunctionId,
                        targetHandle: 'a', // Connect to left input of junction
                        type: 'custom'
                    });
                }

                // Connect Spine Taps to Targets
                targets.forEach(t => {
                    const tY = t.node.position.y + getHandleOffsetY(t.node, t.handle);
                    const tapJunctionId = yToJunction.get(tY);
                    if (tapJunctionId) {
                        newEdges.push({
                            id: `e_tap_target_${Date.now()}_${newEdges.length}`,
                            source: tapJunctionId,
                            sourceHandle: 'right-source', // Connect from right output of junction
                            target: t.id,
                            targetHandle: t.handle,
                            type: 'custom'
                        });
                    }
                });

            }
        });

        // 4. Commit Rebuilt State
        setNodes([...currentNodes, ...newJunctions]);
        setEdges(newEdges);

    }, [edges, nodes, setNodes, setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            // Convert screen coordinates to flow coordinates
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Map component types to appropriate operators for arithmetic nodes
            const getNodeData = (type: string) => {
                const operatorMap: { [key: string]: string } = {
                    add: '+',
                    sub: '-',
                    mul: '*',
                    comp: '==',
                };

                // Auto-label I/O ports with meaningful names
                let label = type.toUpperCase();
                if (type === 'input') {
                    label = `i_data${inputCounterRef.current}`;
                    inputCounterRef.current += 1;
                } else if (type === 'output') {
                    label = `o_data${outputCounterRef.current}`;
                    outputCounterRef.current += 1;
                } else if (type === 'clock') {
                    label = clockCounterRef.current === 0 ? 'clk' : `clk${clockCounterRef.current}`;
                    clockCounterRef.current += 1;
                }

                return {
                    label: label,
                    componentType: type,
                    operator: operatorMap[type],
                    size: type === 'mux4' ? '4' : '2',
                };
            };

            const newNode = {
                id: `${type}_${Date.now()}`,
                type: type, // Use the actual type for custom node rendering
                position,
                data: getNodeData(type),
            };

            useDiagramStore.getState().addNode(newNode);
        },
        [screenToFlowPosition]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setSelectedEdge(null);
    }, []);

    const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
        setSelectedNode(null);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);

    // Handle Ctrl+drag to copy nodes
    const onNodeDragStart = useCallback(
        (event: React.MouseEvent, node: Node) => {
            // Check if Ctrl key (or Cmd on Mac) is pressed
            if (event.ctrlKey || event.metaKey) {
                // Create a copy of the node
                const newNode: Node = {
                    ...node,
                    id: `${node.type}_${Date.now()}`,
                    position: { ...node.position },
                    selected: true,
                    data: { ...node.data },
                };

                // Add the copy to the store
                useDiagramStore.getState().addNode(newNode);

                // Deselect the original node
                setNodes(nodes.map(n =>
                    n.id === node.id ? { ...n, selected: false } : n
                ));
            }
        },
        [nodes, setNodes]
    );

    return (
        <>
            <Header />
            <div className="main-content">
                <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <div style={{ padding: '10px', display: 'flex', gap: '10px', borderBottom: '1px solid var(--color-border)' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                flex: 1,
                                padding: '6px',
                                background: 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Save
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                padding: '6px',
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Load
                        </button>
                        <button
                            onClick={handleAutoRoute}
                            style={{
                                flex: 1,
                                padding: '6px',
                                background: 'var(--color-bg-tertiary)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                            title="Regenerate Routing"
                        >
                            Route
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLoad}
                            style={{ display: 'none' }}
                            accept=".json"
                        />
                    </div>
                    <ComponentSidebar />
                </div>
                <div className="canvas-container" onDrop={onDrop} onDragOver={onDragOver}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        connectionLineType={ConnectionLineType.SmoothStep}
                        defaultEdgeOptions={{
                            type: 'custom',
                            animated: false,
                            style: { strokeWidth: 2, stroke: 'var(--color-wire)' },
                        }}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
                <CodePanel code={verilogCode} selectedNode={selectedNode} selectedEdge={selectedEdge} />
            </div>
        </>
    );
}

export default function DiagramEditor() {
    return <DiagramEditorInner />;
}
