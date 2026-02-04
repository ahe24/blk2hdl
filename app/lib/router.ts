import { Node, Position, getSmoothStepPath } from 'reactflow';

// Helper to estimate node dimensions if not provided
function getNodeDimensions(node: Node): { width: number, height: number } {
    if (node.width && node.height) {
        return { width: node.width, height: node.height };
    }

    // Hardcoded defaults based on component type
    const type = node.data?.componentType || node.type;
    switch (type) {
        case 'mux2': return { width: 60, height: 60 };
        case 'mux4': return { width: 60, height: 120 };
        case 'mux':
            const size = parseInt(node.data?.size || '4', 10);
            return { width: 60, height: size * 30 };
        case 'dff': return { width: 70, height: 60 };
        case 'add':
        case 'sub':
        case 'mul':
        case 'comp': return { width: 50, height: 60 };
        case 'and':
        case 'or':
        case 'nand':
        case 'nor':
        case 'xor':
        case 'xnor': return { width: 65, height: 60 };
        case 'input':
        case 'output':
        case 'buffer':
        case 'not': return { width: 60, height: 30 };
        case 'clock': return { width: 75, height: 30 };
        case 'junction': return { width: 30, height: 30 };
        default: return { width: 60, height: 40 };
    }
}

export function getSmartPath(
    sourceX: number,
    sourceY: number,
    sourcePosition: Position,
    targetX: number,
    targetY: number,
    targetPosition: Position,
    baseOffset: number,
    nodes: Node[],
    excludeIds: string[],
    centerX?: number,
    centerY?: number
): string {
    // Try base offset first with 0 radius for strict collision check
    const [path] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        offset: baseOffset,
        borderRadius: 0,
        centerX, centerY
    });

    // If no collision, return standard smooth path with 8px radius
    if (!isColliding(path, nodes, excludeIds)) {
        const [finalPath] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX, targetY, targetPosition,
            offset: baseOffset,
            borderRadius: 8,
            centerX, centerY
        });
        return finalPath;
    }

    // Try alternate offsets to dodge
    // 0 is usually the center. baseOffset is the requested offset (e.g. for siblings).
    // We should try variations around baseOffset.
    const alts = [20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 120, -120];

    // Sort alts by proximity to baseOffset? 
    // Just try them.
    for (const drift of alts) {
        const testOffset = baseOffset + drift;
        const [testPath] = getSmoothStepPath({
            sourceX, sourceY, sourcePosition,
            targetX, targetY, targetPosition,
            offset: testOffset,
            borderRadius: 0
        });
        if (!isColliding(testPath, nodes, excludeIds)) {
            const [finalPath] = getSmoothStepPath({
                sourceX, sourceY, sourcePosition,
                targetX, targetY, targetPosition,
                offset: testOffset,
                borderRadius: 8
            });
            return finalPath;
        }
    }

    // Fallback: return base path
    const [finalPath] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
        offset: baseOffset,
        borderRadius: 8
    });
    return finalPath;
}

function isColliding(pathStr: string, nodes: Node[], excludeIds: string[]): boolean {
    // Parse path 'M x y L x y ...'
    const commands = pathStr.match(/[ML][^ML]*/g);
    if (!commands) return false;

    let currentX = 0;
    let currentY = 0;

    const segments: { x1: number, y1: number, x2: number, y2: number }[] = [];

    for (const cmd of commands) {
        const type = cmd[0];
        const coords = cmd.substring(1).trim().split(/[\s,]+/).map(parseFloat);

        if (type === 'M') {
            currentX = coords[0];
            currentY = coords[1];
        } else if (type === 'L') {
            const nextX = coords[0];
            const nextY = coords[1];
            if (currentX !== nextX || currentY !== nextY) {
                segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });
            }
            currentX = nextX;
            currentY = nextY;
        }
    }

    for (const node of nodes) {
        if (excludeIds.includes(node.id)) continue;

        const { width, height } = getNodeDimensions(node);
        const nx = node.position.x;
        const ny = node.position.y;

        // Add padding
        const pad = 5;

        for (const seg of segments) {
            if (lineRectIntersect(seg.x1, seg.y1, seg.x2, seg.y2, nx - pad, ny - pad, width + pad * 2, height + pad * 2)) {
                return true;
            }
        }
    }
    return false;
}

function lineRectIntersect(x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, rw: number, rh: number): boolean {
    const isVertical = Math.abs(x1 - x2) < 0.1;
    const isHorizontal = Math.abs(y1 - y2) < 0.1;

    const left = rx;
    const right = rx + rw;
    const top = ry;
    const bottom = ry + rh;

    if (isVertical) {
        if (x1 >= left && x1 <= right) {
            const lineMin = Math.min(y1, y2);
            const lineMax = Math.max(y1, y2);
            if (lineMax >= top && lineMin <= bottom) return true;
        }
    } else if (isHorizontal) {
        if (y1 >= top && y1 <= bottom) {
            const lineMin = Math.min(x1, x2);
            const lineMax = Math.max(x1, x2);
            if (lineMax >= left && lineMin <= right) return true;
        }
    }
    return false;
}
