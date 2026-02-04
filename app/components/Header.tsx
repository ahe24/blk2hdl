'use client';

// Imports need useState, useEffect
import { useDiagramStore } from '../store/diagramStore';
import { useState, useEffect } from 'react';

export default function Header() {
    const { projectName, moduleName, setProjectName, setModuleName, reset } = useDiagramStore();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleNew = () => {
        if (confirm('Create new project? Current work will be lost.')) {
            reset();
        }
    };

    const handleSave = () => {
        // TODO: Implement save to database
        alert('Save functionality will be implemented soon!');
    };

    const handleExport = () => {
        // TODO: Implement export Verilog file
        alert('Export functionality will be implemented soon!');
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">Block2HDL</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                            Project
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Project Name"
                            style={{
                                padding: '6px 10px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                color: 'var(--color-text-primary)',
                                fontSize: '13px',
                                width: '180px',
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                            Module Name
                        </label>
                        <input
                            type="text"
                            value={moduleName}
                            onChange={(e) => setModuleName(e.target.value)}
                            placeholder="Module Name"
                            style={{
                                padding: '6px 10px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                color: 'var(--color-text-primary)',
                                fontSize: '13px',
                                width: '180px',
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="header-actions">
                <button onClick={toggleTheme}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={handleNew}>New</button>
                <button onClick={handleSave}>Save</button>
                <button onClick={handleExport}>Export</button>
            </div>
        </header>
    );
}
