'use client';

import { memo, useMemo } from 'react';
import { EdgeProps, getSmoothStepPath, useEdges, Edge, Position, useNodes } from 'reactflow';
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

    // Calculate offset to avoid overlapping vertical segments ("Channel Conflict")
    const offset = useMemo(() => {
        const myCenterX = (sourceX + targetX) / 2;
        const myMinY = Math.min(sourceY, targetY);
        const myMaxY = Math.max(sourceY, targetY);

        // Find all edges that share this "vertical channel"
        const channelMates = edges.filter((e: Edge) => {
            if (e.id === id) return true; // Include self

            // Should have valid handle positions. 
            // Note: edge object in useEdges might not have raw positions updated in real-time during drag, 
            // but for static routing it's fine. 
            // Actually, 'edges' from useEdges() stores the data model. 
            // It doesn't strictly have X/Y unless I store it?
            // ReactFlow nodes have positions. Edges connect handles.
            // I need the positions of the *other* edges' source/target.
            // fetching all nodes + edges is expensive here?
            // "edges" from store doesn't have computed sourceX/targetX.
            // Only the Edge component props have them.
            // This makes purely global edge lookahead hard inside a component without external layout engine.

            // fallback: Use the sibling logic which relies on topology (source + handleId).
            // This solves the "same node" overlap.
            // For "different nodes aligned vertically", we can't easily detect generic overlap 
            // without reading all node positions.
            // 
            // But I have 'nodes' from useNodes()!
            // I can lookup coordinates.
            return false;
        });

        // REVERTING global complexity for now to avoid breaking edge rendering loop.
        // Stick to Sibling Logic but enhance it.
        // Also add a determinstic offset based on Y to stagger vertical alignments of DIFFERENT nodes.

        // Find all edges that share the same source and source handle
        const siblings = edges.filter((e: Edge) =>
            e.source === source &&
            e.sourceHandle === sourceHandleId
        );

        // Usage of explicit routing index from data (set by Auto-Route function)
        // If not present, fall back to ID-based sorting
        const routingIndex = (data as any)?.routingIndex;
        let index = -1;

        if (typeof routingIndex === 'number') {
            index = routingIndex;
        } else {
            // Sort by ID to ensure consistent ordering
            siblings.sort((a: Edge, b: Edge) => a.id.localeCompare(b.id));
            // Find index of current edge
            index = siblings.findIndex((e: Edge) => e.id === id);
        }

        // Original sibling offset
        let calculatedOffset = 20 + (index > 0 ? index * 15 : 0);

        // Add a "Jitter" based on Source Node's Y position to stagger vertical segments of ALIGNED nodes
        // Use 15px steps to match grid and sibling spacing
        const verticalStagger = (Math.floor(sourceY / 15) % 5) * 15;

        return calculatedOffset + verticalStagger;
    }, [edges, id, source, sourceHandleId, sourceY, data]);

    const nodes = useNodes();
    let finalSourceX = sourceX;
    let finalSourceY = sourceY;
    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // Adjust endpoint for Junction Nodes (snap to center of 30x30 node = +15)
    // This ensures handles align with the 15px grid points.
    const sNode = nodes.find(n => n.id === source);
    if (sNode?.type === 'junction') {
        finalSourceX = sNode.position.x + 15;
        finalSourceY = sNode.position.y + 15;
    }

    const tNode = nodes.find(n => n.id === target);
    if (tNode?.type === 'junction') {
        finalTargetX = tNode.position.x + 15;
        finalTargetY = tNode.position.y + 15;
    }

    const midX = (finalSourceX + finalTargetX) / 2;

    // Calculate appropriate vertical channel (centerX)
    let centerX: number | undefined;

    // Check if the connection is effectively horizontal (aligned within grid tolerance)
    const isHorizontal = Math.abs(finalSourceY - finalTargetY) < 10;

    if (isHorizontal) {
        // For horizontal connections, do NOT force a vertical channel.
        // Let the router draw a straight line. This prevents loops and zig-zags.
        centerX = undefined;
    } else if (sNode?.type === 'junction') {
        // Shared Bus Logic for Junctions: 
        // Force the vertical segment to align exactly with the Junction center (finalSourceX)
        // ONLY if we are dropping vertically (Top/Bottom handle).
        if (sourceHandleId && (sourceHandleId.includes('bottom') || sourceHandleId.includes('top'))) {
            centerX = finalSourceX;
        }
    } else {
        // Standard Logic for Components (Vertical/Diagonal connections): 
        // Use the computed offset (Sibling Index + Vertical Stagger) to stagger vertical channels
        // avoiding overlap for independent signals.
        centerX = midX + offset - 20;
    }

    const edgePath = getSmartPath(
        finalSourceX,
        finalSourceY,
        sourcePosition,
        finalTargetX,
        finalTargetY,
        targetPosition,
        offset,
        nodes,
        [source, target],
        centerX
    );

    const sourceNode = sNode; // Reuse found node
    const bitWidth = parseInt((sourceNode?.data as any)?.bitWidth || '1');
    const isBus = bitWidth > 1;
    const busStrokeWidth = (Number(style?.strokeWidth) || 2) + (isBus ? 2 : 0);
    const strokeColor = selected ? 'var(--color-wire-selected)' : (style.stroke || 'var(--color-wire)');
    const finalStrokeWidth = selected ? busStrokeWidth + 1 : busStrokeWidth;

    return (
        <>
            {/* Background path for "bridge" effect (simulates jump) */}
            <path
                d={edgePath}
                fill="none"
                stroke="var(--color-bg-primary)"
                strokeWidth={finalStrokeWidth + 4}
                style={{
                    ...style,
                    stroke: 'var(--color-bg-primary)',
                    strokeWidth: finalStrokeWidth + 4,
                }}
            />
            {/* Main visible path */}
            <path
                id={id}
                style={{
                    ...style,
                    stroke: strokeColor,
                    strokeWidth: finalStrokeWidth,
                }}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
                fill="none"
            />
        </>
    );
});

CustomEdge.displayName = 'CustomEdge';
