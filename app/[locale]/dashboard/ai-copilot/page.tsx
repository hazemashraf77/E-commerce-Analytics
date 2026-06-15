"use client";
/**
 * AI Copilot page — Pre-Preview Fix 4.
 * SCAFFOLD: template-based explanation layer. No real LLM integration active.
 * AI consumes Score Engine + Decision Engine + History outputs only (011_AI_ENGINE v2.0.0).
 * Repository: 011_AI_ENGINE.md — AI roles: EXPLAIN, SUMMARIZE, ANSWER, ASSIST, SIMULATE.
 */
import { useState } from "react";
import { AiCopilot } from "@/components/ai/AiCopilot";
import { AiDailyBriefWidget } from "@/components/ai/AiDailyBriefWidget";
import { FormulaInspectorFull } from "@/components/formula-inspector/FormulaInspectorFull";

const MOCK_STORE_ID = "00000000-0000-0000-0000-000000000001";

export default function AiCopilotPage() {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [inspectorId, setInspectorId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">AI Business Copilot</h1>
        <p className="text-sm text-gray-500 mt-0.5">Intelligent business advisor powered by Score + Decision Engine outputs.</p>
      </div>

      {/* Scaffold notice — Fix 4 */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">AI Scaffold Mode — No Real LLM Active</p>
            <p className="text-xs text-amber-700 mt-1">
              This AI is currently operating in <strong>template-based scaffold mode</strong>.
              Responses are generated from structured Score Engine and Decision Engine outputs using
              pre-built explanation templates. No real language model (OpenAI, Anthropic, etc.) is connected.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              <strong>Architecture is fully wired:</strong> AI consumes SCORE-001–009, DEC-001–010,
              Score History, and Decision History — exactly as documented in 011_AI_ENGINE.md v2.0.0.
              Real LLM integration requires only credential configuration, not architectural changes.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">AI Pipeline (011_AI_ENGINE v2.0.0)</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600">
          {["Analytics Engine", "→", "Score Engine (SCORE-001–009)", "→", "Decision Engine (DEC-001–010)", "→", "AI Layer", "→", "You"].map((node, i) => (
            <span key={i} className={node === "→" ? "text-gray-300" : "rounded-lg bg-gray-50 border border-gray-200 px-2.5 py-1.5"}>
              {node === "AI Layer" ? <span className="text-indigo-700">{node}</span> : node}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">AI narrates engine outputs. AI never generates scores or recommendations independently.</p>
      </div>

      {/* AI Daily Brief */}
      <AiDailyBriefWidget
        storeId={MOCK_STORE_ID}
        onInspect={id => setInspectorId(id)}
      />

      {/* Capabilities grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { role: "EXPLAIN", icon: "💡", title: "Explain", desc: "Explain any Score (SCORE-001–009) or Decision (DEC-001–010) in natural language with full references.", example: "Explain why Campaign Score is 67" },
          { role: "SUMMARIZE", icon: "📋", title: "Summarize", desc: "Summarize daily business performance by narrating Score Engine and Decision Engine outputs.", example: "Summarize today's business health" },
          { role: "ANSWER", icon: "💬", title: "Answer", desc: "Answer questions about profit, CPA, ROAS, inventory, or any KPI — all answers reference Formula IDs.", example: "Why did profit decrease?" },
          { role: "ASSIST", icon: "🎯", title: "Assist", desc: "Guide you to the right decisions, scores, and KPIs from Decision Engine recommendations.", example: "What should I do about inventory?" },
          { role: "SIMULATE", icon: "🔮", title: "Simulate", desc: "Model what-if scenarios using approved formulas only. All projected values clearly labeled (FR-002).", example: "What if delivery rate improves to 92%?" },
        ].map(cap => (
          <div key={cap.role} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setCopilotOpen(true)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{cap.icon}</span>
              <p className="font-semibold text-gray-800 text-sm">{cap.title}</p>
              <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-xs font-mono text-indigo-700">{cap.role}</span>
            </div>
            <p className="text-xs text-gray-600">{cap.desc}</p>
            <button className="mt-2 text-xs text-indigo-600 hover:underline">Try: "{cap.example}" →</button>
          </div>
        ))}
      </div>

      {/* Open Copilot button */}
      <div className="flex justify-center">
        <button onClick={() => setCopilotOpen(true)}
          className="rounded-xl bg-indigo-600 text-white px-6 py-3 text-sm font-semibold hover:bg-indigo-700 shadow-md">
          🤖 Open AI Copilot Chat
        </button>
      </div>

      {/* Copilot chat panel */}
      <AiCopilot
        storeId={MOCK_STORE_ID}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onInspect={id => { setInspectorId(id); setCopilotOpen(false); }}
      />

      {/* Formula Inspector side panel */}
      <FormulaInspectorFull
        entityId={inspectorId}
        storeId={MOCK_STORE_ID}
        isOpen={!!inspectorId}
        onClose={() => setInspectorId(undefined)}
        onNavigate={id => setInspectorId(id)}
      />
    </div>
  );
}
