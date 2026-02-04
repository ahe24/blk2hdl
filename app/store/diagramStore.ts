import { create } from 'zustand';
import { Node, Edge, addEdge, Connection, EdgeChange, NodeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';

export interface DiagramState {
    nodes: Node[];
    edges: Edge[];
    projectId: string | null;
    projectName: string;
    moduleName: string;

    // Actions
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: Node) => void;
    setProjectId: (id: string | null) => void;
    setProjectName: (name: string) => void;
    setModuleName: (name: string) => void;
    reset: () => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
    nodes: [],
    edges: [],
    projectId: null,
    projectName: 'Untitled Project',
    moduleName: 'my_module',

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection) => {
        set({
            edges: addEdge(connection, get().edges),
        });
    },

    addNode: (node) => {
        set({
            nodes: [...get().nodes, node],
        });
    },

    setProjectId: (id) => set({ projectId: id }),
    setProjectName: (name) => set({ projectName: name }),
    setModuleName: (name) => set({ moduleName: name }),

    reset: () => set({
        nodes: [],
        edges: [],
        projectId: null,
        projectName: 'Untitled Project',
        moduleName: 'my_module',
    }),
}));
