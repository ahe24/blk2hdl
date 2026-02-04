'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import PropertiesPanel from './PropertiesPanel';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePanelProps {
    code: string;
    selectedNode: Node | null;
    selectedEdge: Edge | null;
}

export default function CodePanel({ code, selectedNode, selectedEdge }: CodePanelProps) {
    const [width, setWidth] = useState(400);
    const [splitRatio, setSplitRatio] = useState(0.5); // 0.2 to 0.8
    const panelRef = useRef<HTMLElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    };

    // Width Resize Handler (Left Edge)
    const handleMouseDownWidth = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = width;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = startX - e.clientX;
            // Limit width between 300px and 800px
            const newWidth = Math.min(Math.max(startWidth + deltaX, 300), 800);
            setWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Split Resize Handler (Vertical Separation)
    const handleMouseDownSplit = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!panelRef.current) return;

        const panelRect = panelRef.current.getBoundingClientRect();
        const totalHeight = panelRect.height;
        const startY = e.clientY;
        const startRatio = splitRatio;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const deltaRatio = deltaY / totalHeight;
            const newRatio = Math.min(Math.max(startRatio + deltaRatio, 0.2), 0.8);
            setSplitRatio(newRatio);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <aside
            ref={panelRef}
            className="right-panel"
            style={{
                width: `${width}px`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Horizontal Resize Handle */}
            <div
                onMouseDown={handleMouseDownWidth}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    cursor: 'col-resize',
                    zIndex: 20,
                    background: 'transparent',
                }}
            />

            {/* Generated Code Section */}
            <div className="panel-section" style={{ flex: splitRatio, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                    Generated Verilog Code
                    <button
                        onClick={handleCopy}
                        style={{
                            float: 'right',
                            padding: '4px 8px',
                            fontSize: '11px',
                            marginTop: '-2px',
                        }}
                    >
                        Copy
                    </button>
                </div>
                <div className="panel-content" style={{ padding: 0, overflow: 'auto', flex: 1 }}>
                    <SyntaxHighlighter
                        language="verilog"
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: '16px',
                            fontSize: '12px',
                            lineHeight: '1.6',
                            background: 'var(--color-bg-primary)',
                            minHeight: '100%',
                        }}
                        showLineNumbers
                    >
                        {code}
                    </SyntaxHighlighter>
                </div>
            </div>

            {/* Vertical Split Handle */}
            <div
                onMouseDown={handleMouseDownSplit}
                style={{
                    height: '6px',
                    cursor: 'row-resize',
                    background: 'var(--color-border)',
                    position: 'relative',
                    zIndex: 10,
                }}
            />

            {/* Properties Section */}
            <div className="panel-section" style={{ flex: 1 - splitRatio, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                    {selectedNode ? 'Properties' : selectedEdge ? 'Wire Properties' : 'Properties'}
                </div>
                <div className="panel-content" style={{ flex: 1 }}>
                    <PropertiesPanel selectedNode={selectedNode} selectedEdge={selectedEdge} />
                </div>
            </div>
        </aside>
    );
}
