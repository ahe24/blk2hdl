import { Node, Edge } from 'reactflow';

export interface VerilogHeader {
    author?: string;
    date?: string;
    moduleName: string;
    version?: string;
    description?: string;
}

/**
 * Generate Verilog HDL code from React Flow diagram
 */
export function generateVerilogCode(
    nodes: Node[],
    edges: Edge[],
    header: VerilogHeader
): string {
    const { moduleName, author, date, version, description } = header;

    let code = '';

    // Generate header comment
    code += '//'.repeat(40) + '\n';
    code += `// Module: ${moduleName}\n`;
    if (author) code += `// Author: ${author}\n`;
    if (date) code += `// Date: ${date}\n`;
    if (version) code += `// Version: ${version}\n`;
    if (description) code += `// Description: ${description}\n`;
    code += '//'.repeat(40) + '\n\n';

    // Analyze nodes to identify inputs, outputs, and internal wires
    const inputs: string[] = [];
    const outputs: string[] = [];
    const inouts: string[] = [];
    const clocks: string[] = [];
    const wires = new Set<string>();
    const regs = new Set<string>(); // Track signals driven by flip-flops
    const nodeMap = new Map<string, { label: string; type: string; width: number }>(); // node.id -> {label, type, width}

    // First pass: categorize nodes and build node map
    nodes.forEach(node => {
        const nodeType = node.data?.componentType || node.type;
        const nodeName = node.data?.label || node.id;
        // Default to 1 bit if not specified. Trust user configuration for Logic/Mux/Arith/etc.
        let width = parseInt(node.data?.bitWidth || '1', 10);
        // Special case: Comparator 'bitWidth' implies Input width, but Output is always 1 bit.
        if (nodeType === 'comp') width = 1;

        nodeMap.set(node.id, { label: nodeName, type: nodeType, width });

        switch (nodeType) {
            case 'input':
                inputs.push(nodeName);
                break;
            case 'output':
                outputs.push(nodeName);
                break;
            case 'inout':
                inouts.push(nodeName);
                break;
            case 'clock':
                clocks.push(nodeName);
                inputs.push(nodeName);
                break;
        }
    });

    // Second pass: create wire name mapping with simple names (Base Names)
    const baseWireMap = new Map<string, string>(); // edge.id -> wire name
    let wireCounter = 0;

    edges.forEach(edge => {
        // Check if source is an I/O port
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        let wireName: string;

        // If source is a constant, use its value with proper Verilog notation
        if (sourceNode && sourceNode.type === 'constant') {
            const value = sourceNode.label || '0';
            const width = sourceNode.width;
            // Format as Verilog constant: width'bvalue or width'hvalue
            wireName = width > 1 ? `${width}'d${value}` : `1'b${value}`;
        }
        // If source is an input/clock port, use the port name directly
        else if (sourceNode && ['input', 'clock'].includes(sourceNode.type)) {
            wireName = sourceNode.label;
        }
        // If target is an output port, use the port name directly
        else if (targetNode && ['output'].includes(targetNode.type)) {
            wireName = targetNode.label;
        }
        // Otherwise use edge label or generate wire name
        else {
            wireName = edge.label?.toString() || `w_${wireCounter++}`;
        }

        baseWireMap.set(edge.id, wireName);
    });

    // Helper to resolve net aliases through junctions
    const resolveNetName = (edgeId: string): string => {
        const edge = edges.find(e => e.id === edgeId);
        if (!edge) return '';

        const sourceNode = nodeMap.get(edge.source);
        if (sourceNode && sourceNode.type === 'junction') {
            // Find the input edge to this junction
            const inputEdges = edges.filter(e => e.target === edge.source);
            if (inputEdges.length > 0) {
                // Recursively resolve the input edge
                return resolveNetName(inputEdges[0].id);
            }
        }
        // If not a junction or no input, use the base name
        return baseWireMap.get(edgeId) || '';
    };

    // Third pass: identify signals driven by flip-flops and populate wires set
    nodes.forEach(node => {
        const nodeType = node.data?.componentType || node.type;

        // If this is a DFF, mark its output as reg
        if (nodeType === 'dff' || nodeType === 'mux2' || nodeType === 'mux4' || nodeType === 'demux2' || nodeType === 'decoder') {
            const outputEdges = edges.filter(e => e.source === node.id);
            outputEdges.forEach(edge => {
                const outputWire = resolveNetName(edge.id);
                if (outputWire) {
                    regs.add(outputWire);
                }
            });
        }
    });

    // Populate wires set with resolved names (excluding constants)
    edges.forEach(edge => {
        const wireName = resolveNetName(edge.id);
        // Skip if it's a constant (contains apostrophe like "1'b1" or "8'd5")
        const isConstant = wireName && wireName.includes("'");
        if (wireName && !inputs.includes(wireName) && !outputs.includes(wireName) && !regs.has(wireName) && !isConstant) {
            wires.add(wireName);
        }
    });

    // Generate module declaration
    const allPorts = [...inputs, ...outputs, ...inouts];

    // Helper to get definition string
    const getDef = (name: string, dir: string, isReg: boolean) => {
        // Find node associated with this port name (scan nodeMap)
        // This is O(N) but N is small.
        let width = 1;
        for (const [_, data] of nodeMap) {
            if (data.label === name) {
                width = data.width;
                break;
            }
        }
        const widthStr = width > 1 ? `[${width - 1}:0] ` : '';
        const regStr = isReg ? 'reg ' : '';
        return `  ${dir} ${regStr}${widthStr}${name}`;
    };

    code += `module ${moduleName}(\n`;
    code += allPorts.map((port, idx) => {
        let direction = '';
        let isReg = false;
        if (inputs.includes(port)) {
            direction = 'input';
        } else if (outputs.includes(port)) {
            direction = 'output';
            if (regs.has(port)) isReg = true;
        } else if (inouts.includes(port)) {
            direction = 'inout';
        }

        const comma = idx < allPorts.length - 1 ? ',' : '';
        return `${getDef(port, direction, isReg)}${comma}`;
    }).join('\n');
    code += '\n);\n\n';

    // Generate wire declarations for internal signals (excluding reg signals)
    const internalWires = Array.from(wires).filter(wire => !regs.has(wire));
    if (internalWires.length > 0) {
        code += '  // Internal wires\n';
        internalWires.forEach(wire => {
            // Find width of this wire.
            // We need to look up which edge/node drives this wire.
            // Iterate edges to find one that resolves to this wireName.
            // Then get its source node width.
            const drivingEdge = edges.find(e => resolveNetName(e.id) === wire);
            let width = 1;
            if (drivingEdge) {
                const src = nodeMap.get(drivingEdge.source);
                if (src) width = src.width;
            }
            const widthStr = width > 1 ? `[${width - 1}:0] ` : '';
            code += `  wire ${widthStr}${wire};\n`;
        });
        code += '\n';
    }

    // Generate reg declarations for flip-flop outputs (excluding output ports)
    const internalRegs = Array.from(regs).filter(reg => !outputs.includes(reg));
    if (internalRegs.length > 0) {
        code += '  // Flip-flop outputs\n';
        internalRegs.forEach(reg => {
            // Similar lookup for regs
            const drivingEdge = edges.find(e => resolveNetName(e.id) === reg);
            let width = 1;
            if (drivingEdge) {
                const src = nodeMap.get(drivingEdge.source);
                if (src) width = src.width;
            }
            const widthStr = width > 1 ? `[${width - 1}:0] ` : '';
            code += `  reg ${widthStr}${reg};\n`;
        });
        code += '\n';
    }

    // Generate logic instances
    code += '  // Logic instances\n';
    nodes.forEach(node => {
        const nodeType = node.data?.componentType || node.type;

        // Skip I/O nodes and constants as they're already handled
        if (['input', 'output', 'inout', 'clock', 'constant'].includes(nodeType)) {
            return;
        }

        // Find connected edges
        const inputEdges = edges.filter(e => e.target === node.id);
        const outputEdges = edges.filter(e => e.source === node.id);

        switch (nodeType) {
            case 'and':
            case 'or':
            case 'xor':
            case 'nand':
            case 'nor':
            case 'xnor':
                if (inputEdges.length >= 2 && outputEdges.length > 0) {
                    const inputNames = inputEdges.map(e => resolveNetName(e.id));
                    const output = resolveNetName(outputEdges[0].id);

                    const gateOps: { [key: string]: string } = {
                        and: '&',
                        or: '|',
                        xor: '^',
                        nand: '&',
                        nor: '|',
                        xnor: '^'
                    };

                    const op = gateOps[nodeType];
                    const expr = inputNames.join(` ${op} `);
                    const finalExpr = ['nand', 'nor', 'xnor'].includes(nodeType) ? `~(${expr})` : expr;

                    code += `  assign ${output} = ${finalExpr};\n`;
                }
                break;

            case 'not':
            case 'buffer':
                if (inputEdges.length > 0 && outputEdges.length > 0) {
                    const input = resolveNetName(inputEdges[0].id);
                    // Support fan-out (though resolving alias makes this implicit if wired correctly?)
                    // Actually, buffer needs to drive the output wire.
                    // If output wire is same name as input, it's weird.
                    // But buffer usually isolates? No, buffer drives.
                    // If Buffer Output Edge resolves to Base Name W2. Input Edge resolves to W1.
                    // Then assign W2 = W1. Correct.

                    outputEdges.forEach(edge => {
                        const output = resolveNetName(edge.id);
                        // Prevent assigning to itself (if loop or direct?)
                        if (output !== input) {
                            code += `  assign ${output} = ${nodeType === 'not' ? '~' : ''}${input};\n`;
                        }
                    });
                }
                break;

            case 'junction':
                // Do not generate code for junctions (handled by net aliasing)
                break;

            case 'dff':
                if (inputEdges.length > 0 && outputEdges.length > 0) {
                    const clockEdge = inputEdges.find(e => e.targetHandle === 'clk');
                    const dataEdge = inputEdges.find(e => e.targetHandle === 'd');
                    const clock = clockEdge ? (resolveNetName(clockEdge.id) || 'clk') : 'clk';
                    const data = dataEdge ? (resolveNetName(dataEdge.id) || 'data') : 'data';
                    const output = resolveNetName(outputEdges[0].id);

                    code += `  always @(posedge ${clock}) begin\n`;
                    code += `    ${output} <= ${data};\n`;
                    code += `  end\n`;
                }
                break;

            case 'add':
            case 'sub':
            case 'mul':
            case 'comp':
                if (inputEdges.length >= 2 && outputEdges.length > 0) {
                    // Get operators for each type
                    const operatorMap: { [key: string]: string } = {
                        add: '+',
                        sub: '-',
                        mul: '*',
                        comp: '==',
                        '==': '==',
                        '!=': '!=',
                        '<': '<',
                        '>': '>',
                        '<=': '<=',
                        '>=': '>='
                    };
                    const op = operatorMap[node.data?.operator || nodeType] || operatorMap[nodeType] || '+';

                    // Get input wires
                    const inputA = resolveNetName(inputEdges[0].id);
                    const inputB = resolveNetName(inputEdges[1].id);
                    const output = resolveNetName(outputEdges[0].id);

                    code += `  assign ${output} = ${inputA} ${op} ${inputB};\n`;
                }
                break;

            case 'mux2':
                if (outputEdges.length > 0) {
                    const output = resolveNetName(outputEdges[0].id);
                    const selEdge = inputEdges.find(e => e.targetHandle === 'sel');
                    const sel = selEdge ? (resolveNetName(selEdge.id) || 'sel') : 'sel';

                    const in0Edge = inputEdges.find(e => e.targetHandle === 'in0');
                    const in0 = in0Edge ? (resolveNetName(in0Edge.id) || 'in0') : 'in0';
                    const in1Edge = inputEdges.find(e => e.targetHandle === 'in1');
                    const in1 = in1Edge ? (resolveNetName(in1Edge.id) || 'in1') : 'in1';

                    code += `  always @(*) begin\n`;
                    code += `    if (${sel}) begin\n`;
                    code += `      ${output} = ${in1};\n`; // sel=1 selects in1 usually? Or in0? Standard Mux: 0->in0, 1->in1.
                    code += `    end else begin\n`;
                    code += `      ${output} = ${in0};\n`;
                    code += `    end\n`;
                    code += `  end\n`;
                }
                break;

            case 'mux4':
            case 'mux':
                if (outputEdges.length > 0) {
                    const output = resolveNetName(outputEdges[0].id);
                    const selEdge = inputEdges.find(e => e.targetHandle === 'sel');
                    const sel = selEdge ? (resolveNetName(selEdge.id) || 'sel') : 'sel';

                    // Determine size
                    let size = 4;
                    if (nodeType === 'mux4') size = 4;
                    else if (node.data?.size) size = parseInt(node.data.size, 10);

                    const selBits = Math.ceil(Math.log2(size));

                    code += `  always @(*) begin\n`;
                    code += `    case (${sel})\n`;

                    for (let i = 0; i < size; i++) {
                        const inEdge = inputEdges.find(e => e.targetHandle === `in${i}`);
                        const inVal = inEdge ? (resolveNetName(inEdge.id) || `in${i}`) : `in${i}`;
                        const caseLabel = `${selBits}'d${i}`;
                        code += `      ${caseLabel}: ${output} = ${inVal};\n`;
                    }

                    code += `      default: ${output} = 'bx;\n`;
                    code += `    endcase\n`;
                    code += `  end\n`;
                }
                break;
        }
    });

    code += '\nendmodule\n';

    return code;
}
