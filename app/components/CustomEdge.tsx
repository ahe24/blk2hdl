'use client';

import { memo, useMemo, useCallback, useEffect } from 'react';
import { EdgeProps, getSmoothStepPath, useEdges, Edge, Position, useNodes, useReactFlow } from 'reactflow';
import { useDiagramStore } from '../store/diagramStore';
import { getSmartPath } from '../lib/router';

export const CustomEdge = memo(({
    id,
    source,
    target,
    sourceHandleId,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
    data,
}: EdgeProps) => {
    // Get all edges to calculate offsets for parallel edges
    const edges = useEdges();

    const nodes = useNodes();

    // Calculate offset to avoid overlapping parallel segments from DIFFERENT nets
    const offset = useMemo(() => {
        // Shared trunk logic: All siblings from the SAME (source, handle) share the SAME centerX
        const sNode = nodes.find(n => n.id === source);
        const yPos = sNode?.position.y || 0;

        const sourceHash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const handleHash = (sourceHandleId || '').split('').reduce((acc, h) => acc + h.charCodeAt(0), 0);

        // Use a combination of ID hash and Y-position to ensure unique lanes for stacked gates
        // We use a 20-lane system with 15px spacing to stay perfectly on the grid
        const combinedHash = sourceHash + handleHash + Math.floor(yPos / 20);
        const lane = combinedHash % 20;

        return 30 + (lane * 15);
    }, [source, sourceHandleId, nodes]);
    let finalSourceX = sourceX;
    let finalSourceY = sourceY;
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // Node lookups
    const sNode = nodes.find(n => n.id === source);
    const tNode = nodes.find(n => n.id === target);

    if (sNode?.type === 'junction') {
        finalSourceX = sNode.position.x + 15;
        finalSourceY = sNode.position.y + 15;
    }
    if (tNode?.type === 'junction') {
        finalTargetX = tNode.position.x + 15;
        finalTargetY = tNode.position.y + 15;
    }

    // Highlighting Logic: Entire net glows together
    const siblings = edges.filter((e: Edge) => e.source === source && e.sourceHandle === sourceHandleId);
    const isNetSelected = selected || siblings.some(e => e.selected);

    // Shared deterministic vertical channel
    const isHorizontal = Math.abs(finalSourceY - finalTargetY) < 1;
    let centerX: number | undefined = isHorizontal ? undefined : Math.round((finalSourceX + offset) / 15) * 15;

    // Override for vertical drops from junctions
    if (sNode?.type === 'junction' && sourceHandleId && (sourceHandleId.includes('bottom') || sourceHandleId.includes('top'))) {
        centerX = finalSourceX;
    }

    // --- INTERACTIVE ROUTING OFFSET (Visio-style) ---
    const setEdges = useDiagramStore(s => s.setEdges);
    const { screenToFlowPosition } = useReactFlow();
    const routingOffset = (data as any)?.routingOffset || 0;

    // Apply the user-defined offset to our calculated base centerX
    const finalCenterX = centerX !== undefined ? (centerX + routingOffset) : undefined;

    const [edgePath] = getSmoothStepPath({
        sourceX: finalSourceX,
        sourceY: finalSourceY,
        sourcePosition,
        targetX: finalTargetX,
        targetY: finalTargetY,
        targetPosition,
        borderRadius: 0, // Perfectly sharp Manhattan corners
        centerX: finalCenterX
    });

    const bitWidth = parseInt((sNode?.data as any)?.bitWidth || '1');
    const isBus = bitWidth > 1;
    const finalStrokeWidth = isBus ? 4 : 2;
    const strokeColor = isNetSelected ? 'var(--color-wire-selected)' : (style.stroke || 'var(--color-wire)');

    // PRECISE JUNCTION LOGIC (Dots):
    // Identify ALL targets in this net to decide on trunk geometry
    const netPoints = useMemo(() => {
        return siblings.map(e => {
            const targetNode = nodes.find(n => n.id === e.target);
            if (!targetNode) return undefined;

            const tType = targetNode.type;
            const hId = e.targetHandle;

            // Calculate exact handle coordinates (estimating where React Flow puts them)
            let tx = targetNode.position.x;
            let ty = targetNode.position.y;

            // Handle Position Detection (React Flow default is center)
            const handlePos = (e.targetHandle === 'sel-top' || e.targetHandle === 'sel-bottom') ? Position.Bottom : (e.targetHandle === 'clk' && tType === 'dff' ? Position.Left : Position.Left);

            if (tType === 'junction' || tType === 'input' || tType === 'output' || tType === 'clock') {
                tx += 15; ty += 15;
            } else if (tType === 'dff') {
                tx += 0;
                ty += hId === 'd' ? 24 : 48;
            } else if (tType === 'mux' || tType === 'mux2' || tType === 'mux4') {
                if (hId === 'sel-top' || hId === 'sel-bottom') {
                    tx += 30;
                    ty += hId === 'sel-top' ? 0 : (tType === 'mux4' ? 120 : (tType === 'mux' || tType === 'mux2' ? 60 : 90));
                }
                else {
                    tx += 0;
                    if (hId === 'in0' || hId === 'a') ty += 15;
                    else if (hId === 'in1' || hId === 'b') ty += 30;
                    else if (hId === 'in2') ty += 45;
                    else if (hId === 'in3') ty += 60;
                }
            } else if (tType === 'arithmetic') {
                tx += 0;
                ty += hId === 'a' ? 15 : 45;
            } else {
                tx += 0;
                ty += hId === 'a' || hId === 'in' ? 15 : 45;
            }

            return { x: tx, y: ty, handleId: hId };
        }).filter(p => p !== undefined) as { x: number, y: number, handleId: string | null | undefined }[];
    }, [siblings, nodes]);

    // DOMINANT ORIENTATION: All siblings MUST agree on the trunk type
    // If any target in the net is a 'sel' (Top/Bottom handle), force Horizontal Trunk
    const isHorizontalNet = netPoints.some(p => p.handleId?.startsWith('sel'));

    const junctionDots = useMemo(() => {
        if (siblings.length < 2) return [];

        if (isHorizontalNet) {
            // Horizontal Trunk at y = finalSourceY
            // Trunk spans from SourceX to the furthest target
            const xs = [finalSourceX, ...netPoints.map(p => p.x)].sort((a, b) => a - b);
            const maxX = xs[xs.length - 1];

            // A dot appears on the horizontal trunk for every vertical tap OFF the trunk
            return netPoints
                .filter(p => p.handleId?.startsWith('sel'))
                .filter(p => p.x < maxX || (p.x === finalSourceX && siblings.length > 1))
                .map(p => ({ x: p.x, y: finalSourceY }));
        } else {
            // Vertical Trunk at x = finalCenterX
            if (finalCenterX === undefined) return [];
            const ys = [finalSourceY, ...netPoints.map(p => p.y)].sort((a, b) => a - b);
            const minY = ys[0];
            const maxY = ys[ys.length - 1];

            return ys.filter(y => {
                if (y === finalSourceY && siblings.length > 1) return true;
                if (y > minY && y < maxY) return true;
                return false;
            }).map(y => ({ x: finalCenterX, y }));
        }
    }, [isHorizontalNet, netPoints, finalSourceX, finalSourceY, siblings.length, finalCenterX]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        const startFlowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const initialOffset = routingOffset;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentFlowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            const dx = currentFlowPos.x - startFlowPos.x;
            // Precise grid snapping (15px) and 1:1 drag movement
            const newOffset = Math.round((initialOffset + dx) / 15) * 15;

            // Apply to ALL siblings in the net simultaneously
            setEdges(edges.map(edge => {
                if (edge.source === source && edge.sourceHandle === sourceHandleId) {
                    const existingData = edge.data || {};
                    return { ...edge, data: { ...existingData, routingOffset: newOffset } };
                }
                return edge;
            }));
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [routingOffset, edges, source, sourceHandleId, setEdges, screenToFlowPosition]);

    // Keyboard support for Left/Right movement
    useEffect(() => {
        if (!selected) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const step = 15 * (e.shiftKey ? 2 : 1);
                const delta = e.key === 'ArrowLeft' ? -step : step;
                const newOffset = routingOffset + delta;

                setEdges(edges.map(edge => {
                    if (edge.source === source && edge.sourceHandle === sourceHandleId) {
                        const existingData = edge.data || {};
                        return { ...edge, data: { ...existingData, routingOffset: newOffset } };
                    }
                    return edge;
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selected, routingOffset, edges, source, sourceHandleId, setEdges]);

    return (
        <>
            <path
                d={edgePath}
                fill="none"
                stroke="var(--color-bg-primary)"
                strokeWidth={finalStrokeWidth + 4}
                style={{ ...style, stroke: 'var(--color-bg-primary)', strokeWidth: finalStrokeWidth + 4 }}
            />
            {/* Wider invisible path for easier selection/interaction */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={15}
                className="react-flow__edge-interaction"
            />
            <path
                id={id}
                style={{ ...style, stroke: strokeColor, strokeWidth: finalStrokeWidth }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                fill="none"
            />

            {/* Manual Routing Handle: Only show when net is selected and a trunk exists */}
            {finalCenterX !== undefined && isNetSelected && (
                <g style={{ cursor: 'ew-resize' }} onMouseDown={handleMouseDown}>
                    {/* Visual Grabber: Diamond Shape */}
                    <rect
                        x={finalCenterX - 5}
                        y={(finalSourceY + finalTargetY) / 2 - 5}
                        width={10}
                        height={10}
                        transform={`rotate(45, ${finalCenterX}, ${(finalSourceY + finalTargetY) / 2})`}
                        fill="var(--color-accent)"
                        stroke="var(--color-bg-primary)"
                        strokeWidth={2}
                        style={{ pointerEvents: 'none' }}
                    />
                    {/* Invisible Larger Grabber Hitbox: Centered Square */}
                    <rect
                        x={finalCenterX - 15}
                        y={(finalSourceY + finalTargetY) / 2 - 15}
                        width={30}
                        height={30}
                        fill="transparent"
                    />
                </g>
            )}

            {/* Junction Dots: Every edge in the net renders ALL dots to ensure they stay on top */}
            {finalCenterX !== undefined && junctionDots.map((dot, i) => (
                <circle
                    key={`${id}-dot-${i}`}
                    cx={finalCenterX + (isHorizontalNet ? 0 : 0)} // Note: logic for horizontal net might need dot.x if we move dot logic
                    cy={dot.y}
                    r={5}
                    fill={strokeColor}
                    stroke="var(--color-bg-primary)"
                    strokeWidth={3}
                    style={{ pointerEvents: 'none' }}
                />
            ))}
        </>
    );
});

CustomEdge.displayName = 'CustomEdge';
