'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramStore } from '../store/diagramStore';

interface PropertiesPanelProps {
    selectedNode: Node | null;
    selectedEdge: Edge | null;
}

export default function PropertiesPanel({ selectedNode, selectedEdge }: PropertiesPanelProps) {
    const { nodes, edges, setNodes, setEdges } = useDiagramStore();
    const [nodeName, setNodeName] = useState('');
    const [edgeName, setEdgeName] = useState('');
    const [muxSize, setMuxSize] = useState('2');
    const [operator, setOperator] = useState('==');
    const [bitWidth, setBitWidth] = useState('1');

    useEffect(() => {
        if (selectedNode) {
            setNodeName(selectedNode.data?.label || '');
            setMuxSize(selectedNode.data?.size || '2');
            setOperator(selectedNode.data?.operator || '==');
            setBitWidth(selectedNode.data?.bitWidth || '1');
        }
    }, [selectedNode]);

    useEffect(() => {
        if (selectedEdge) {
            setEdgeName(selectedEdge.label?.toString() || '');
        }
    }, [selectedEdge]);

    const handleNodeNameChange = (newName: string) => {
        setNodeName(newName);
        if (selectedNode) {
            const updatedNodes = nodes.map(node =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, label: newName } }
                    : node
            );
            setNodes(updatedNodes);
        }
    };

    const handleMuxSizeChange = (newSize: string) => {
        setMuxSize(newSize);
        if (selectedNode) {
            const updatedNodes = nodes.map(node =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, size: newSize, label: `mux${newSize}` } }
                    : node
            );
            setNodes(updatedNodes);
        }
    };

    const handleBitWidthChange = (newWidth: string) => {
        // Validate integer > 0
        const width = Math.max(1, parseInt(newWidth) || 1).toString();
        setBitWidth(width);
        if (selectedNode) {
            const updatedNodes = nodes.map(node =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, bitWidth: width } }
                    : node
            );
            setNodes(updatedNodes);
        }
    };

    const handleOperatorChange = (newOp: string) => {
        setOperator(newOp);
        if (selectedNode) {
            const updatedNodes = nodes.map(node =>
                node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, operator: newOp } }
                    : node
            );
            setNodes(updatedNodes);
        }
    };

    const handleEdgeNameChange = (newName: string) => {
        setEdgeName(newName);
        if (selectedEdge) {
            const updatedEdges = edges.map(edge =>
                edge.id === selectedEdge.id
                    ? { ...edge, label: newName }
                    : edge
            );
            setEdges(updatedEdges);
        }
    };

    if (!selectedNode && !selectedEdge) {
        return (
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Select a component or wire to edit properties
            </div>
        );
    }

    return (
        <div style={{ fontSize: '13px' }}>
            {selectedNode && (
                <div>
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                            TYPE
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
                            {selectedNode.data?.componentType || selectedNode.type}
                        </div>
                    </div>

                    {/* Show NAME/LABEL for all nodes except constants */}
                    {selectedNode.type !== 'constant' && (
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                                NAME / LABEL
                            </label>
                            <input
                                type="text"
                                value={nodeName}
                                onChange={(e) => handleNodeNameChange(e.target.value)}
                                placeholder="Enter name..."
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: 'var(--color-bg-primary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '12px',
                                }}
                            />
                        </div>
                    )}

                    {/* Show VALUE field for constants */}
                    {selectedNode.type === 'constant' && (
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                                VALUE
                            </label>
                            <input
                                type="text"
                                value={nodeName}
                                onChange={(e) => handleNodeNameChange(e.target.value)}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: 'var(--color-bg-primary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '12px',
                                }}
                            />
                        </div>
                    )}

                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '16px' }}>
                        <strong>Node ID:</strong> {selectedNode.id}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                            BIT WIDTH
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="128"
                            value={bitWidth}
                            onChange={(e) => handleBitWidthChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: 'var(--color-bg-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                color: 'var(--color-text-primary)',
                                fontSize: '12px',
                            }}
                        />
                    </div>

                    {/* Mux Configuration */}
                    {(selectedNode.type === 'mux2' || selectedNode.type === 'mux4' || selectedNode.type === 'mux') && ( // 'mux' might be future generic type
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                                MUX SIZE (Inputs)
                            </label>
                            <select
                                value={muxSize}
                                onChange={(e) => handleMuxSizeChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: 'var(--color-bg-primary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '12px',
                                    outline: 'none'
                                }}
                            >
                                {[2, 4, 8, 16].map(size => (
                                    <option key={size} value={size.toString()}>{size}:1</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Comparator/Arithmetic Configuration */}
                    {(selectedNode.type === 'comp' || (selectedNode.data?.componentType === 'comp')) && (
                        <div style={{ marginTop: '12px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                                OPERATOR
                            </label>
                            <select
                                value={operator}
                                onChange={(e) => handleOperatorChange(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: 'var(--color-bg-primary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '12px',
                                    outline: 'none'
                                }}
                            >
                                <option value="==">== (Equal)</option>
                                <option value="!=">!= (Not Equal)</option>
                                <option value="<">&lt; (Less Than)</option>
                                <option value=">">&gt; (Greater Than)</option>
                                <option value="<=">&lt;= (Less Equal)</option>
                                <option value=">=">&gt;= (Greater Equal)</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {selectedEdge && (
                <div>
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                            WIRE
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
                            Connection
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                            WIRE NAME
                        </label>
                        <input
                            type="text"
                            value={edgeName}
                            onChange={(e) => handleEdgeNameChange(e.target.value)}
                            placeholder="Auto (w_N)"
                            style={{
                                width: '100%',
                                padding: '6px 8px',
                                background: 'var(--color-bg-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                color: 'var(--color-text-primary)',
                                fontSize: '12px',
                            }}
                        />
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '16px' }}>
                        <strong>Edge ID:</strong> {selectedEdge.id}
                    </div>
                </div>
            )}
        </div>
    );
}
