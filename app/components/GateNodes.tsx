'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// AND Gate Node
export const AndGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node and-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="65" height="60" viewBox="0 0 65 60">
                <path d="M 0 15 L 10 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 10 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 50 30 L 65 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 10 L 30 10 A 20 20 0 0 1 30 50 L 10 50 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
AndGateNode.displayName = 'AndGateNode';

// OR Gate Node
export const OrGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node or-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="65" height="60" viewBox="0 0 65 60">
                <path d="M 0 15 L 15 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 15 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 50 30 L 65 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 10 Q 20 30 10 50 L 15 50 Q 40 50 50 30 Q 40 10 15 10 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
OrGateNode.displayName = 'OrGateNode';

// NOT Gate (Inverter) Node
export const NotGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node not-gate">
            <Handle type="target" position={Position.Left} id="in" style={{ top: '50%' }} />
            <svg width="60" height="30" viewBox="0 0 60 30">
                <path d="M 0 15 L 10 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 46 15 L 60 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 5 L 10 25 L 40 15 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <circle
                    cx="43"
                    cy="15"
                    r="3"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
NotGateNode.displayName = 'NotGateNode';

// NAND Gate Node
export const NandGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node nand-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="65" height="60" viewBox="0 0 65 60">
                <path d="M 0 15 L 10 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 10 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 59 30 L 65 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 10 L 30 10 A 20 20 0 0 1 30 50 L 10 50 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <circle
                    cx="55"
                    cy="30"
                    r="4"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
NandGateNode.displayName = 'NandGateNode';

// NOR Gate Node
export const NorGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node nor-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="65" height="60" viewBox="0 0 65 60">
                <path d="M 0 15 L 15 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 15 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 59 30 L 65 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 10 Q 20 30 10 50 L 15 50 Q 40 50 50 30 Q 40 10 15 10 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <circle
                    cx="55"
                    cy="30"
                    r="4"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
NorGateNode.displayName = 'NorGateNode';

// XOR Gate Node
export const XorGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node xor-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="65" height="60" viewBox="0 0 65 60">
                <path d="M 0 15 L 7.5 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 7.5 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 52 30 L 65 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 5 10 Q 15 30 5 50"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <path
                    d="M 12 10 Q 22 30 12 50 L 17 50 Q 42 50 52 30 Q 42 10 17 10 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
XorGateNode.displayName = 'XorGateNode';

// XNOR Gate Node
export const XnorGateNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node xnor-gate">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="70" height="60" viewBox="0 0 70 60">
                <path d="M 0 15 L 7.5 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 7.5 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 61 30 L 70 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 5 10 Q 15 30 5 50"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <path
                    d="M 12 10 Q 22 30 12 50 L 17 50 Q 42 50 52 30 Q 42 10 17 10 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <circle
                    cx="57"
                    cy="30"
                    r="4"
                    fill="none"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
XnorGateNode.displayName = 'XnorGateNode';

// Buffer Node
export const BufferNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node buffer-gate">
            <Handle type="target" position={Position.Left} id="in" style={{ top: '50%' }} />
            <svg width="55" height="30" viewBox="0 0 55 30">
                <path d="M 0 15 L 10 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 40 15 L 55 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d="M 10 5 L 10 25 L 40 15 Z"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
BufferNode.displayName = 'BufferNode';

// D Flip-Flop Node
export const DffNode = memo(({ data }: NodeProps) => {
    return (
        <div className="gate-node dff-node">
            <Handle type="target" position={Position.Left} id="d" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="clk" style={{ top: '45px' }} />
            <svg width="50" height="60" viewBox="0 0 50 60">
                <path d="M 0 15 L 5 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 5 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 45 30 L 50 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <rect
                    x="5"
                    y="5"
                    width="40"
                    height="50"
                    fill="var(--color-storage-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                    rx="4"
                />
                <text x="25" y="35" textAnchor="middle" fill="var(--color-gate-detail)" fontSize="16" fontWeight="bold">
                    D
                </text>
                <path
                    d="M 5 40 L 15 45 L 5 50"
                    fill="none"
                    stroke="var(--color-gate-detail)"
                    strokeWidth="1.5"
                />
            </svg>
            <Handle type="source" position={Position.Right} id="q" style={{ top: '50%' }} />
        </div >
    );
});
DffNode.displayName = 'DffNode';

// I/O Pin Nodes - Compact with External Labels
// Input Node
export const InputNode = memo(({ data }: NodeProps) => {
    return (
        <div className="io-node" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            height: '30px',
            position: 'relative',
            pointerEvents: 'none' // Parent doesn't catch clicks
        }}>
            <div style={{
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'auto'
            }}>
                {data.label}{(data.bitWidth && parseInt(data.bitWidth) > 1) ? ` [${parseInt(data.bitWidth) - 1}:0]` : ''}
            </div>
            <div style={{ width: '30px', height: '30px', position: 'relative', flexShrink: 0, pointerEvents: 'auto' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
                    <path
                        d="M 0 7.5 L 20 7.5 L 30 15 L 20 22.5 L 0 22.5 Z"
                        fill="var(--color-gate-fill)"
                        stroke="var(--color-port-stroke)"
                        strokeWidth="2"
                    />
                </svg>
                <Handle type="source" position={Position.Right} id="out" style={{ top: '50%', right: -4, opacity: 0 }} />
            </div>
        </div>
    );
});
InputNode.displayName = 'InputNode';

// Output Node
export const OutputNode = memo(({ data }: NodeProps) => {
    return (
        <div className="io-node" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '30px',
            position: 'relative',
            pointerEvents: 'none'
        }}>
            <div style={{ width: '30px', height: '30px', position: 'relative', flexShrink: 0, pointerEvents: 'auto' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
                    <path
                        d="M 0 7.5 L 20 7.5 L 30 15 L 20 22.5 L 0 22.5 Z"
                        fill="var(--color-gate-fill)"
                        stroke="var(--color-port-stroke)"
                        strokeWidth="2"
                    />
                </svg>
                <Handle type="target" position={Position.Left} id="in" style={{ top: '50%', left: -4, opacity: 0 }} />
            </div>
            <div style={{
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'auto'
            }}>
                {data.label}{(data.bitWidth && parseInt(data.bitWidth) > 1) ? ` [${parseInt(data.bitWidth) - 1}:0]` : ''}
            </div>
        </div>
    );
});
OutputNode.displayName = 'OutputNode';

export const ClockNode = memo(({ data }: NodeProps) => {
    return (
        <div className="io-node" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            height: '30px',
            position: 'relative',
            pointerEvents: 'none'
        }}>
            <div style={{
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                pointerEvents: 'auto'
            }}>
                {data.label || 'CLK'}
            </div>
            <div style={{ width: '30px', height: '30px', position: 'relative', flexShrink: 0, pointerEvents: 'auto' }}>
                <svg width="30" height="30" viewBox="0 0 30 30" style={{ display: 'block' }}>
                    <rect x="1" y="1" width="28" height="28" fill="var(--color-gate-fill)" stroke="var(--color-clock-stroke)" strokeWidth="2" />
                    <path d="M 5 25 L 10 25 L 10 10 L 20 10 L 20 25 L 25 25" fill="none" stroke="var(--color-clock-stroke)" strokeWidth="2" />
                </svg>
                <Handle type="source" position={Position.Right} id="out" style={{ top: '50%', right: -4, opacity: 0 }} />
            </div>
        </div>
    );
});
ClockNode.displayName = 'ClockNode';

// Multiplexer Node
export const MuxNode = memo(({ data }: NodeProps) => {
    // Default to 4 inputs if strictly 'mux4', 2 if 'mux2', else use data.size or default to 4
    let defaultSize = 2;
    if (data.componentType === 'mux4') defaultSize = 4;

    const numInputs = parseInt(data.size || defaultSize.toString(), 10);
    const height = numInputs * 30; // Grid aligned height (15, 45...)

    return (
        <div className="gate-node mux-node">
            {Array.from({ length: numInputs }).map((_, i) => (
                <Handle
                    key={`in${i}`}
                    type="target"
                    position={Position.Left}
                    id={`in${i}`}
                    style={{ top: `${15 + i * 30}px` }}
                />
            ))}
            <Handle type="target" position={Position.Top} id="sel-top" style={{ left: '30px' }} />
            <Handle type="target" position={Position.Bottom} id="sel-bottom" style={{ left: '30px' }} />
            <svg width="60" height={height} viewBox={`0 0 60 ${height}`}>
                {Array.from({ length: numInputs }).map((_, i) => (
                    <path
                        key={`line${i}`}
                        d={`M 0 ${15 + i * 30} L 10 ${15 + i * 30}`}
                        stroke="var(--color-gate-stroke)"
                        strokeWidth="2"
                    />
                ))}
                <path d={`M 50 ${height / 2} L 60 ${height / 2}`} stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path
                    d={`M 10 0 L 50 10 L 50 ${height - 10} L 10 ${height} Z`}
                    fill="var(--color-comb-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <text
                    x="30"
                    y={`${height / 2 - 5}`}
                    textAnchor="middle"
                    fill="var(--color-gate-detail)"
                    fontSize="12"
                    fontWeight="bold"
                >
                    MUX
                </text>
                <text
                    x="30"
                    y={`${height / 2 + 10}`}
                    textAnchor="middle"
                    fill="var(--color-gate-detail)"
                    fontSize="9"
                >
                    {numInputs}:1
                </text>
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div>
    );
});
MuxNode.displayName = 'MuxNode';

// Arithmetic Operator Nodes
export const ArithmeticNode = memo(({ data }: NodeProps) => {
    const operator = data.operator || '+';

    return (
        <div className="gate-node arithmetic-node">
            <Handle type="target" position={Position.Left} id="a" style={{ top: '15px' }} />
            <Handle type="target" position={Position.Left} id="b" style={{ top: '45px' }} />
            <svg width="50" height="60" viewBox="0 0 50 60">
                <path d="M 0 15 L 5 15" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 0 45 L 5 45" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <path d="M 45 30 L 50 30" stroke="var(--color-gate-stroke)" strokeWidth="2" />
                <circle
                    cx="25"
                    cy="30"
                    r="20"
                    fill="var(--color-arith-fill)"
                    stroke="var(--color-gate-stroke)"
                    strokeWidth="2"
                />
                <text
                    x="25"
                    y="37"
                    textAnchor="middle"
                    fill="var(--color-gate-detail)"
                    fontSize={operator.length > 1 ? "16" : "20"}
                    fontWeight="bold"
                >
                    {operator}
                </text>
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%' }} />
        </div >
    );
});
ArithmeticNode.displayName = 'ArithmeticNode';

// Junction Node (Green Square)
export const JunctionNode = memo(({ data }: NodeProps) => {
    // Interactive container (14x14) for easier dragging
    // Visual square (8x8) centered inside
    const handleStyle: React.CSSProperties = {
        width: '6px',
        height: '6px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        zIndex: 10,
    };

    return (
        <div
            className="junction-node-wrapper"
            style={{
                width: '30px',
                height: '30px',
                background: 'transparent', // Transparent interaction area
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001, // Ensure on top of wires
            }}
        >
            {/* Visual Representation */}
            <div style={{
                width: '8px',
                height: '8px',
                background: 'var(--color-junction)',
                borderRadius: '0px',
                boxShadow: '0 0 2px rgba(0,0,0,0.5)',
                pointerEvents: 'none', // Passes clicks to container (drag) or handle (connect) if overlapping
            }} />

            <Handle type="target" position={Position.Left} id="a" style={handleStyle} />
            <Handle type="target" position={Position.Top} id="t" style={{ ...handleStyle, opacity: 0 }} />
            <Handle type="source" position={Position.Top} id="top-source" style={{ ...handleStyle, opacity: 0 }} />
            <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ ...handleStyle, opacity: 0 }} />
            <Handle type="source" position={Position.Right} id="right-source" style={{ ...handleStyle, opacity: 0 }} />
            <Handle type="source" position={Position.Left} id="left-source" style={{ ...handleStyle, opacity: 0 }} />
        </div>
    );
});
JunctionNode.displayName = 'JunctionNode';

// Constant Node
export const ConstantNode = memo(({ data }: NodeProps) => {
    const value = data.value || data.label || '0';

    return (
        <div style={{ position: 'relative', width: '35px', height: '30px' }}>
            <svg width="35" height="30" viewBox="0 0 35 30">
                {/* Rounded rectangle / pill shape */}
                <rect
                    x="1"
                    y="1"
                    width="33"
                    height="28"
                    fill="var(--color-gate-fill)"
                    stroke="var(--color-port-stroke)"
                    strokeWidth="2"
                    rx="14"
                />
                <text
                    x="17.5"
                    y="19"
                    textAnchor="middle"
                    fill="var(--color-port-stroke)"
                    fontSize="12"
                    fontWeight="bold"
                >
                    {value}
                </text>
            </svg>
            <Handle type="source" position={Position.Right} id="out" style={{ top: '50%', transform: 'translateY(-50%)', opacity: 0 }} />
        </div>
    );
});
ConstantNode.displayName = 'ConstantNode';
