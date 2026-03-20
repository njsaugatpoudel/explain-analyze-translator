"use client";

import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Database, Activity, Sparkles, MessageSquare } from "lucide-react";

// Mermaid Graph Component
const MermaidChart = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'dark', 
      fontFamily: 'system-ui, sans-serif'
    });
    
    if (ref.current && chart) {
      ref.current.removeAttribute('data-processed');
      ref.current.innerHTML = chart;
      mermaid.run({ nodes: [ref.current] }).catch(console.error);
    }
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className="mermaid w-full flex justify-center py-8 bg-black/40 rounded-xl border border-[#ff0055]/20 overflow-x-auto"
    />
  );
};

export default function Home() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState("");
  const [mermaidGraph, setMermaidGraph] = useState("");
  const [error, setError] = useState("");

  const analyzePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTranslation("");
    setMermaidGraph("");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setTranslation(data.translation);
      setMermaidGraph(data.mermaid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen z-10 relative flex flex-col items-center p-6">
      <main className="w-full max-w-5xl z-10 space-y-8 glass-panel p-8 rounded-2xl mt-10 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-[#ff0055]/10 border border-[#ff0055]/20 shadow-[0_0_30px_rgba(255,0,85,0.3)]">
              <Database className="text-[#ff0055] w-8 h-8" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight glow-text pb-2">Your AI DBA.</h1>
          <p className="text-gray-400 text-lg">Paste your unreadable PostgreSQL EXPLAIN ANALYZE logs. We'll visualize the bottleneck using Mermaid and tell you how to fix it.</p>
        </div>

        <form onSubmit={analyzePlan} className="space-y-4">
          <textarea 
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            required 
            rows={8} 
            placeholder="-> Seq Scan on users (cost=0.00..1845.00)..." 
            className="w-full bg-[#111] border border-white/10 rounded-xl p-6 text-gray-300 font-mono text-sm focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all resize-none shadow-inner"
          />
          <div className="flex justify-end">
            <button type="submit" className="flex items-center space-x-2 bg-transparent text-neon px-8 py-3 rounded-lg font-medium hover:bg-neon hover:text-white transition-all btn-glow" disabled={loading}>
              {loading ? (
                <span className="flex items-center space-x-2 animate-pulse">
                  <Activity className="w-5 h-5" /> <span>Analyzing Query...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" /> <span>Diagnose Query</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl text-red-400 font-mono text-sm text-center">
            {error}
          </div>
        )}

        {(translation || mermaidGraph) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* The Translation Panel */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#ff0055] text-sm font-bold uppercase tracking-widest border-b border-[#ff0055]/20 pb-2">
                <MessageSquare className="w-4 h-4" /> <span>AI Diagnosis</span>
              </div>
              <div className="bg-[#050505] border border-white/5 rounded-xl p-6 text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                {translation}
              </div>
            </div>

            {/* The Visualization Flowchart Panel */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#ff0055] text-sm font-bold uppercase tracking-widest border-b border-[#ff0055]/20 pb-2">
                <Activity className="w-4 h-4" /> <span>Execution Flowchart</span>
              </div>
              {mermaidGraph ? <MermaidChart chart={mermaidGraph} /> : (
                <div className="flex items-center justify-center h-full bg-[#050505] border border-white/5 rounded-xl text-gray-500 italic text-sm p-6">
                  No flowchart data returned from the AI.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
