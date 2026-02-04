'use client';

import { ReactFlowProvider } from 'reactflow';
import DiagramEditor from './components/DiagramEditor';
import 'reactflow/dist/style.css';
import './globals.css';

export default function Home() {
  return (
    <ReactFlowProvider>
      <main className="app-container">
        <DiagramEditor />
      </main>
    </ReactFlowProvider>
  );
}
