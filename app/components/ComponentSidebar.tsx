'use client';

// Helper component for sidebar icons
const SidebarIcon = ({ type }: { type: string }) => {
    // Common props
    const props = {
        width: 20,
        height: 20,
        viewBox: '0 0 20 20',
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
        style: { marginRight: '8px', flexShrink: 0 }
    };

    switch (type) {
        case 'input':
            return (
                <svg {...props}>
                    <line x1="2" y1="10" x2="14" y2="10" stroke="var(--color-success)" strokeWidth="2" />
                    <path d="M 14 10 L 10 7 L 10 13 Z" fill="var(--color-success)" stroke="none" />
                </svg>
            );
        case 'output':
            return (
                <svg {...props}>
                    <line x1="6" y1="10" x2="18" y2="10" stroke="var(--color-error)" strokeWidth="2" />
                    <path d="M 18 10 L 14 7 L 14 13 Z" fill="var(--color-error)" stroke="none" />
                </svg>
            );
        case 'clock':
            return (
                <svg {...props}>
                    <path d="M 2 10 L 6 10 L 6 5 L 10 5 L 10 15 L 14 15 L 14 10 L 18 10" stroke="#f59e0b" />
                </svg>
            );
        case 'dff':
            return (
                <svg {...props}>
                    <rect x="3" y="3" width="14" height="14" rx="2" stroke="var(--color-accent)" />
                    <path d="M 3 14 L 6 17 L 3 20" stroke="var(--color-accent)" strokeWidth="1" fill="none" />
                </svg>
            );
        case 'and':
            return (
                <svg {...props}>
                    <path d="M 3 3 L 10 3 A 7 7 0 0 1 10 17 L 3 17 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'or':
            return (
                <svg {...props}>
                    <path d="M 3 3 Q 8 10 3 17 L 5 17 Q 14 17 17 10 Q 14 3 5 3 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'not':
            return (
                <svg {...props}>
                    <path d="M 3 3 L 3 17 L 15 10 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                    <circle cx="17" cy="10" r="1.5" stroke="var(--color-accent)" />
                </svg>
            );
        case 'nand':
            return (
                <svg {...props}>
                    <path d="M 3 3 L 10 3 A 7 7 0 0 1 10 17 L 3 17 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                    <circle cx="18" cy="10" r="1.5" stroke="var(--color-accent)" />
                </svg>
            );
        case 'nor':
            return (
                <svg {...props}>
                    <path d="M 3 3 Q 8 10 3 17 L 5 17 Q 14 17 17 10 Q 14 3 5 3 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                    <circle cx="18" cy="10" r="1.5" stroke="var(--color-accent)" />
                </svg>
            );
        case 'xor':
            return (
                <svg {...props}>
                    <path d="M 2 3 Q 7 10 2 17" fill="none" stroke="var(--color-accent)" />
                    <path d="M 5 3 Q 10 10 5 17 L 7 17 Q 16 17 19 10 Q 16 3 7 3 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'xnor':
            return (
                <svg {...props}>
                    <path d="M 2 3 Q 7 10 2 17" fill="none" stroke="var(--color-accent)" />
                    <path d="M 5 3 Q 10 10 5 17 L 7 17 Q 16 17 19 10 Q 16 3 7 3 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                    <circle cx="20" cy="10" r="1.5" stroke="var(--color-accent)" />
                </svg>
            );
        case 'buffer':
            return (
                <svg {...props}>
                    <path d="M 3 3 L 3 17 L 15 10 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'add':
            return <span style={{ fontSize: '16px', marginRight: '8px' }}>➕</span>;
        case 'sub':
            return <span style={{ fontSize: '16px', marginRight: '8px' }}>➖</span>;
        case 'mul':
            return <span style={{ fontSize: '16px', marginRight: '8px' }}>✖️</span>;
        case 'comp':
            return <span style={{ fontSize: '16px', marginRight: '8px' }}>⚖️</span>;
        case 'mux2':
        case 'mux4':
            return (
                <svg {...props}>
                    <path d="M 4 4 L 16 6 L 16 14 L 4 16 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'demux2':
        case 'decoder':
            return (
                <svg {...props}>
                    <path d="M 4 6 L 16 4 L 16 16 L 4 14 Z" fill="var(--color-bg-tertiary)" stroke="var(--color-accent)" />
                </svg>
            );
        case 'constant':
            return (
                <svg {...props}>
                    <rect x="3" y="3" width="14" height="14" rx="2" fill="var(--color-bg-tertiary)" stroke="var(--color-port-stroke)" strokeWidth="1.5" />
                    <text x="10" y="14" textAnchor="middle" fill="var(--color-port-stroke)" fontSize="10" fontWeight="bold">0</text>
                </svg>
            );
        default:
            return <span style={{ fontSize: '16px', marginRight: '8px' }}>🔹</span>;
    }
};

const COMPONENTS = [
    {
        title: 'I/O Ports',
        items: [
            { type: 'input', label: 'Input' },
            { type: 'output', label: 'Output' },
            { type: 'clock', label: 'Clock' },
            { type: 'constant', label: 'Constant' },
        ],
    },
    {
        title: 'Storage',
        items: [
            { type: 'dff', label: 'D Flip-Flop' },
        ],
    },
    {
        title: 'Basic Gates',
        items: [
            { type: 'and', label: 'AND' },
            { type: 'or', label: 'OR' },
            { type: 'not', label: 'NOT' },
            { type: 'nand', label: 'NAND' },
            { type: 'nor', label: 'NOR' },
            { type: 'xor', label: 'XOR' },
            { type: 'xnor', label: 'XNOR' },
            { type: 'buffer', label: 'Buffer' },
        ],
    },
    {
        title: 'Arithmetic',
        items: [
            { type: 'add', label: 'Adder' },
            { type: 'sub', label: 'Subtractor' },
            { type: 'mul', label: 'Multiplier' },
            { type: 'comp', label: 'Comparator' },
        ],
    },
    {
        title: 'Combinational',
        items: [
            { type: 'mux2', label: 'MUX 2:1' },
            { type: 'mux4', label: 'MUX 4:1' },
            { type: 'demux2', label: 'DEMUX 1:2' },
            { type: 'decoder', label: 'Decoder' },
        ],
    },
];

export default function ComponentSidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-title">Components</div>
            {COMPONENTS.map((category) => (
                <div key={category.title} className="component-category">
                    <div className="sidebar-title" style={{ fontSize: '12px', marginBottom: '8px' }}>
                        {category.title}
                    </div>
                    {category.items.map((item) => (
                        <div
                            key={item.type}
                            className="component-item"
                            draggable
                            onDragStart={(e) => onDragStart(e, item.type)}
                        >
                            <SidebarIcon type={item.type} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            ))}
        </aside>
    );
}
