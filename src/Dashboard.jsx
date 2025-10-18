// src/Dashboard.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBarChart2 } from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";

/*
  Dashboard espera que as questões estejam no backend ou no mesmo front.
  Para simplicidade, o dashboard faz uma chamada ao /api/questions?limit=5000
  e calcula métricas no cliente.
*/

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#7dd3fc", "#a78bfa", "#f97316"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/questions?limit=5000`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arr = await res.json();
        if (mounted) setData(arr);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const normalized = useMemo(() => {
    // normalize minimal fields for dashboard
    return (data || []).map(doc => ({
      _id: doc._id || (doc._id && doc._id.$oid) || doc.ID || doc.id,
      disciplina: doc.Disciplina || doc.disciplina || "",
      dificuldade: doc.Dificuldade || doc.dificuldade || "",
      resultado: doc.Resultado || doc.resultado || "",
      assunto: doc.Assunto || doc.assunto || "",
      topico: doc["Tópico"] || doc.topico || "",
      timestamp: doc.Timestamp || doc.timestamp || doc.createdAt || ""
    }));
  }, [data]);

  const total = normalized.length;
  const byDisciplina = useMemo(() => {
    const m = {};
    for (const q of normalized) {
      const k = q.disciplina || "Sem disciplina";
      m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [normalized]);

  const byDifficulty = useMemo(() => {
    const m = {};
    for (const q of normalized) {
      const k = q.dificuldade || "Sem nível";
      m[k] = (m[k] || 0) + 1;
    }
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [normalized]);

  const correctCount = normalized.filter(q => String(q.resultado).toLowerCase() === "certo").length;
  const wrongCount = normalized.filter(q => String(q.resultado).toLowerCase() === "errado").length;
  const accuracy = total ? Math.round((correctCount / total) * 100) : 0;

  const topTopics = useMemo(() => {
    const m = {};
    for (const q of normalized) {
      const key = (q.assunto || q.topico || "Sem") ;
      m[key] = (m[key] || 0) + 1;
    }
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>({ name:k, value:v }));
  }, [normalized]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded hover:bg-slate-100"><FiArrowLeft /></button>
            <h1 className="text-2xl font-bold flex items-center gap-3"><FiBarChart2 /> Dashboard</h1>
          </div>

          <div>
            <button onClick={() => navigate("/")} className="px-3 py-2 bg-slate-100 rounded">Voltar ao Banco de Questões</button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded shadow text-center">Carregando métricas...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded text-red-700">Erro obtendo dados: {error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded p-4 shadow">
                <div className="text-sm text-slate-500">Total de questões</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="bg-white rounded p-4 shadow">
                <div className="text-sm text-slate-500">Acurácia</div>
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-xs text-slate-500 mt-1">{correctCount} certas • {wrongCount} erradas</div>
              </div>
              <div className="bg-white rounded p-4 shadow">
                <div className="text-sm text-slate-500">Top tópico</div>
                <div className="text-lg font-semibold">{topTopics[0]?.name || "—"}</div>
                <div className="text-xs text-slate-500 mt-1">{topTopics[0]?.value || 0} questões</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded p-4 shadow">
                <h3 className="text-sm text-slate-600 mb-2">Distribuição por Disciplina</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={byDisciplina} dataKey="value" nameKey="name" outerRadius={100} label>
                        {byDisciplina.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded p-4 shadow">
                <h3 className="text-sm text-slate-600 mb-2">Dificuldade (contagem)</h3>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={byDifficulty}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value">
                        {byDifficulty.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded p-4 shadow lg:col-span-2">
                <h3 className="text-sm text-slate-600 mb-2">Tópicos mais frequentes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topTopics.map((t, i) => (
                    <div key={t.name} className="p-3 bg-slate-50 rounded">
                      <div className="text-sm text-slate-600">{t.name}</div>
                      <div className="text-xl font-semibold">{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
