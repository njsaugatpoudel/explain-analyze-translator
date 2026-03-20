"use client";

import { useState, useCallback, useMemo } from "react";
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Database, Activity, Code2, AlertCircle } from "lucide-react";

// Custom Node Component for a sleek UI
const CustomNode = ({ data }: any) => {
  return (
    <div className="bg-[#111] border border-[#ff0055]/30 rounded-xl p-4 shadow-lg min-w-[200px]">
      <Handle type="target" position={Position.Top} className="!bg-[#ff0055]" />
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 mb-2">
        <Database className="w-4 h-4 text-[#ff0055]" />
        <h3 className="text-white font-bold text-sm">{data.nodeType}</h3>
      </div>
      <div className="space-y-1 text-xs text-gray-400 font-mono">
        {data.relation && <p><span className="text-gray-500">Relation:</span> <span className="text-white">{data.relation}</span></p>}
        {data.cost && <p><span className="text-gray-500">Cost:</span> {data.cost}</p>}
        {data.rows !== undefined && <p><span className="text-gray-500">Rows:</span> {data.rows}</p>}
        {data.time && <p><span className="text-gray-500">Time:</span> {data.time}ms</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-[#ff0055]" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 220;
  const nodeHeight = 120;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [error, setError] = useState("");
  const [hasGraph, setHasGraph] = useState(false);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const parsePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      let parsed = JSON.parse(jsonInput);
      // Handle standard Postgres JSON format
      if (Array.isArray(parsed) && parsed[0]?.Plan) {
        parsed = parsed[0].Plan;
      } else if (parsed.Plan) {
        parsed = parsed.Plan;
      } else {
        throw new Error("Invalid format. Expected PostgreSQL EXPLAIN (FORMAT JSON) output containing a 'Plan' root node.");
      }

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      let idCounter = 0;

      const traverse = (plan: any, parentId: string | null = null) => {
        const currentId = `node_${idCounter++}`;
        
        newNodes.push({
          id: currentId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { 
            nodeType: plan["Node Type"] || "Unknown Node",
            relation: plan["Relation Name"] || plan["Index Name"] || plan["Alias"] || "",
            cost: plan["Total Cost"] ? plan["Total Cost"].toFixed(2) : "",
            rows: plan["Plan Rows"] || plan["Actual Rows"] || 0,
            time: plan["Actual Total Time"] || "",
          }
        });

        if (parentId) {
          newEdges.push({
            id: `e_${parentId}-${currentId}`,
            source: parentId,
            target: currentId,
            animated: true,
            style: { stroke: '#ff0055', strokeWidth: 2 }
          });
        }

        if (plan.Plans && Array.isArray(plan.Plans)) {
          plan.Plans.forEach((childPlan: any) => traverse(childPlan, currentId));
        }
      };

      traverse(parsed);
      
      const layouted = getLayoutedElements(newNodes, newEdges);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
      setHasGraph(true);

    } catch (err: any) {
      setError(err.message || "Failed to parse JSON.");
      setHasGraph(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 z-10 relative">
      <main className="w-full max-w-7xl z-10 space-y-8 glass-panel p-8 rounded-2xl mt-4 shadow-2xl">
        
        {!hasGraph && (
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/20 shadow-[0_0_30px_rgba(255,0,85,0.3)]">
                <Activity className="text-[#ff0055] w-8 h-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight glow-text pb-2">AST Query Visualizer</h1>
            <p className="text-gray-400 text-lg">Pure local AST parsing. No AI. No API keys. Paste your <code className="text-[#ff0055]">EXPLAIN (FORMAT JSON)</code> output below to generate an interactive execution tree.</p>
          </div>
        )}

        <div className={`grid gap-6 ${hasGraph ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 max-w-3xl mx-auto'}`}>
          
          <div className={hasGraph ? 'col-span-1 space-y-4' : 'space-y-4'}>
            <form onSubmit={parsePlan} className="space-y-4">
              <textarea 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                required 
                rows={hasGraph ? 25 : 12} 
                placeholder='[\n  {\n    "Plan": {\n      "Node Type": "Seq Scan",\n      "Relation Name": "users"\n    }\n  }\n]' 
                className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-[#ff0055] font-mono text-xs focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all resize-none shadow-inner custom-scrollbar"
              />
              <button type="submit" className="w-full flex items-center justify-center space-x-2 bg-transparent text-neon px-8 py-3 rounded-lg font-medium hover:bg-neon hover:text-white transition-all btn-glow">
                <Code2 className="w-5 h-5" /> <span>Render AST Flowchart</span>
              </button>
            </form>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl text-red-400 font-mono text-sm flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {hasGraph && (
            <div className="col-span-1 lg:col-span-3 h-[700px] bg-[#000] border border-white/10 rounded-xl overflow-hidden shadow-inner relative">
              <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange} 
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
              >
                <Background color="#333" gap={16} />
                <Controls className="bg-[#111] border-white/10 fill-white" />
              </ReactFlow>
            </div>
          )}

        </div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff0055; }
        .react-flow__panel.react-flow__controls button { background: #111; border-bottom: 1px solid rgba(255,255,255,0.1); fill: #fff; }
        .react-flow__panel.react-flow__controls button:hover { background: #ff0055; }
      `}</style>
    </div>
  );
}
