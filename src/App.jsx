// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiBarChart2, FiXCircle } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* util */
const uid = () => Math.random().toString(36).slice(2, 9);
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

/* cores para badges */
const difficultyColor = (d) => {
  if (!d) return { background: "#eef2ff", color: "#5b21b6" };
  if (d.includes("Fácil") || d.includes("Nível Fácil")) return { background: "#ecfdf5", color: "#059669" };
  if (d.includes("Médio") || d.includes("Nível Médio")) return { background: "#fffbeb", color: "#b45309" };
  if (d.includes("Difícil") || d.includes("Nível Difícil")) return { background: "#fff1f2", color: "#dc2626" };
  return { background: "#eef2ff", color: "#5b21b6" };
};
const incidenceColor = (inc) => {
  if (!inc) return { background: "#eef2ff", color: "#5b21b6" };
  if (inc.includes("Máxima")) return { background: "#fff1f2", color: "#dc2626" };
  if (inc.includes("Alta")) return { background: "#f3e8ff", color: "#7c3aed" };
  if (inc.includes("Média")) return { background: "#fff7ed", color: "#ea580c" };
  if (inc.includes("Baixa")) return { background: "#ecfdf5", color: "#059669" };
  if (inc.includes("Mínima")) return { background: "#f0f9ff", color: "#06b6d4" };
  return { background: "#eef2ff", color: "#5b21b6" };
};

/* MultiSelect com busca simples */
function MultiSelect({ options = [], value = [], onChange, placeholder = "Selecione..." }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef();

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggleOption = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };

  const label = value.length === 0 ? placeholder : value.join(", ");
  const filtered = options.filter(o => o.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(s => !s)} className="px-3 py-2 border rounded w-[220px] text-left">
        <span className="text-slate-500">{label}</span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1 w-[220px] bg-white border rounded shadow max-h-56 overflow-auto">
          <div className="p-2">
            <input autoFocus value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar..." className="w-full p-1 border rounded text-sm" />
          </div>

          {filtered.length === 0 ? (
            <div className="p-2 text-sm text-slate-500">Sem opções</div>
          ) : (
            filtered.map(opt => (
              <label key={opt} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggleOption(opt)} />
                <span className="text-sm">{opt}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* compress simples para dataURL (fallback se necessário) */
function compressDataUrl(dataUrl, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const newData = canvas.toDataURL('image/jpeg', quality);
        resolve(newData);
      };
      img.onerror = (e) => reject(e);
      img.src = dataUrl;
    } catch (err) {
      reject(err);
    }
  });
}

/* Modal com abas */
function QuestionModal({ isOpen, onClose, form, setForm, onSave, isEditing }) {
  const [activeTab, setActiveTab] = useState("dados");

  useEffect(() => { if (!isOpen) setActiveTab("dados"); }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h3 className="text-xl font-semibold">{isEditing ? "Editar Questão" : "Nova Questão"}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100"><FiX /></button>
        </div>

        <div className="flex gap-2 border-b mb-4">
          {[
            { id: "dados", label: "Dados" },
            { id: "conteudo", label: "Conteúdo" },
            { id: "alternativas", label: "Alternativas" }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 ${activeTab === t.id ? "border-b-2 border-violet-600 text-violet-600" : "text-slate-500"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* ABA DADOS */}
          {activeTab === "dados" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Simulado</label>
                  <input value={form.simulado} onChange={e => setForm({ ...form, simulado: e.target.value })} placeholder="Ex: 01" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Nº da Questão</label>
                  <input value={form.numeroQuestao} onChange={e => setForm({ ...form, numeroQuestao: e.target.value })} placeholder="Ex: Q01" className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Disciplina</label>
                  <input value={form.disciplina} onChange={e => setForm({ ...form, disciplina: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Assunto</label>
                  <input value={form.assunto} onChange={e => setForm({ ...form, assunto: e.target.value })} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Tópico</label>
                  <input value={form.topico} onChange={e => setForm({ ...form, topico: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Área</label>
                  <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    <option value="Linguagens e Ciências Humanas">Linguagens e Ciências Humanas</option>
                    <option value="Matemática e Ciências da Natureza">Matemática e Ciências da Natureza</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Incidência</label>
                  <select value={form.incidencia} onChange={e => setForm({ ...form, incidencia: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    <option>Incidência Máxima</option>
                    <option>Incidência Alta</option>
                    <option>Incidência Média</option>
                    <option>Incidência Baixa</option>
                    <option>Incidência Mínima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Dificuldade</label>
                  <select value={form.dificuldade} onChange={e => setForm({ ...form, dificuldade: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    <option>Nível Fácil</option>
                    <option>Nível Médio</option>
                    <option>Nível Difícil</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ABA CONTEÚDO */}
          {activeTab === "conteudo" && (
            <>
              <div>
                <label className="block text-sm mb-1">Resultado</label>
                <div className="flex gap-4">
                  <label><input type="radio" name="res" value="Certo" checked={form.resultado === "Certo"} onChange={e => setForm({ ...form, resultado: e.target.value })} /> Certo</label>
                  <label><input type="radio" name="res" value="Errado" checked={form.resultado === "Errado"} onChange={e => setForm({ ...form, resultado: e.target.value })} /> Errado</label>
                </div>
              </div>

              {form.resultado === "Errado" && (
                <div>
                  <label className="block text-sm mb-1">Motivo do Erro</label>
                  <input value={form.motivoErro} onChange={e => setForm({ ...form, motivoErro: e.target.value })} className="w-full p-2 border rounded" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Competência</label>
                  <input value={form.competencia} onChange={e => setForm({ ...form, competencia: e.target.value })} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Habilidade</label>
                  <input value={form.habilidade} onChange={e => setForm({ ...form, habilidade: e.target.value })} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Enunciado (pode colar print direto aqui)</label>
                <textarea
                  value={form.enunciado}
                  onChange={e => setForm({ ...form, enunciado: e.target.value })}
                  rows={4}
                  className="w-full p-2 border rounded"
                  placeholder="Digite ou cole um print..."
                />
              </div>

              <div>
                <label className="block text-sm mb-1">URL da Imagem (opcional)</label>
                <input value={form.imagem} onChange={e => setForm({ ...form, imagem: e.target.value })} className="w-full p-2 border rounded" placeholder="https://..." />
                <div className="text-xs text-slate-400 mt-1">Se colou uma imagem ela ficará salva aqui (dataURL).</div>
              </div>

              <div>
                <label className="block text-sm mb-1">Referências</label>
                <input value={form.referencias} onChange={e => setForm({ ...form, referencias: e.target.value })} className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          {activeTab === "alternativas" && (
            <>
              <div>
                <label className="block text-sm mb-2">Alternativas</label>
                {form.alternatives.map((alt, idx) => (
                  <div key={alt.label} className="flex gap-2 items-center mb-2">
                    <div className="w-6">{alt.label}</div>
                    <input value={alt.text} onChange={e => {
                      setForm(f => {
                        const copy = JSON.parse(JSON.stringify(f));
                        copy.alternatives[idx].text = e.target.value;
                        return copy;
                      });
                    }} className="flex-1 p-2 border rounded" />
                    <button onClick={() => setForm(f => ({ ...f, gabarito: alt.label }))} className={`px-2 py-1 rounded ${form.gabarito === alt.label ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>✓</button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Gabarito</label>
                  <select value={form.gabarito} onChange={e => setForm({ ...form, gabarito: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    {form.alternatives.map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Marquei</label>
                  <select value={form.marcada} onChange={e => setForm({ ...form, marcada: e.target.value })} className="w-full p-2 border rounded">
                    <option value="">Selecione</option>
                    {form.alternatives.map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Explicação</label>
                <textarea value={form.explicacao} onChange={e => setForm({ ...form, explicacao: e.target.value })} rows={3} className="w-full p-2 border rounded" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button onClick={onSave} className="px-4 py-2 bg-violet-600 text-white rounded flex items-center gap-2"><FiSave /> Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- APP ----------------------------- */
export default function App() {
  const emptyForm = {
    simulado: "", numeroQuestao: "", disciplina: "", assunto: "", topico: "",
    area: "", incidencia: "", dificuldade: "", resultado: "Certo", motivoErro: "",
    competencia: "", habilidade: "", enunciado: "", imagem: "", referencias: "",
    alternatives: [{ label: "A", text: "" }, { label: "B", text: "" }, { label: "C", text: "" }, { label: "D", text: "" }, { label: "E", text: "" }],
    gabarito: "A", marcada: "", explicacao: ""
  };

  const [questions, setQuestions] = useState([]);
  const [loadedFromServer, setLoadedFromServer] = useState(false);
  const [lastFetchError, setLastFetchError] = useState(null);

  // filtros
  const [query, setQuery] = useState("");
  const [filterSimulados, setFilterSimulados] = useState([]);
  const [filterNumeros, setFilterNumeros] = useState([]);
  const [filterDisciplinas, setFilterDisciplinas] = useState([]);
  const [filterAssuntos, setFilterAssuntos] = useState([]);
  const [filterTopicos, setFilterTopicos] = useState([]);
  const [filterIncidencias, setFilterIncidencias] = useState([]);
  const [filterDificuldades, setFilterDificuldades] = useState([]);
  const [filterMotivos, setFilterMotivos] = useState([]);
  const [filterAcertei, setFilterAcertei] = useState(false);
  const [filterErrei, setFilterErrei] = useState(false);
  const [filterAreaHumanas, setFilterAreaHumanas] = useState(false);
  const [filterAreaMatNat, setFilterAreaMatNat] = useState(false);

  // modal/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(JSON.parse(JSON.stringify(emptyForm)));
  const [editingMongoId, setEditingMongoId] = useState(null);
  const [editingOriginalDoc, setEditingOriginalDoc] = useState(null);

  // delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  /* ---------- fetch com fallback e debug (sem toast automático) ---------- */
  const fetchFromApi = async () => {
    setLastFetchError(null);
    try {
      let res = await fetch(`${API_BASE}/api/questions`);
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/questions?limit=5000`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let arr = [];
      if (Array.isArray(data)) arr = data;
      else if (data && typeof data === "object") {
        const arrProp = Object.values(data).find(v => Array.isArray(v));
        if (arrProp) arr = arrProp;
        else arr = [data];
      } else {
        arr = [];
      }
      const normalized = arr.map(normalizeDoc);
      setQuestions(normalized);
      setLoadedFromServer(true);
    } catch (err) {
      console.warn("Erro carregando do servidor:", err);
      setLastFetchError(err.message || String(err));
      setLoadedFromServer(false);
      setQuestions([]);
    }
  };

  useEffect(() => {
    fetchFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- normalização tolerante ---------- */
  function normalizeDoc(doc) {
    const fallbackAlts = emptyForm.alternatives.map(a => ({ ...a }));
    function parseAlternatives(field) {
      if (!field) return null;
      if (Array.isArray(field)) {
        return field.map((a, i) => (typeof a === "string" ? { label: String.fromCharCode(65 + i), text: a } : { label: a.label || String.fromCharCode(65 + i), text: a.text || a.texto || "" }));
      }
      if (typeof field === "object") {
        return Object.entries(field).map(([k, v]) => ({ label: String(k).replace(/[^A-Za-z]/g, "").toUpperCase() || String.fromCharCode(65), text: String(v || "") }));
      }
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          if (parsed) return parseAlternatives(parsed);
        } catch (e) { }
        const obj = {}; const re = /["']?([A-Ea-e])["']?\s*:\s*["']([^"']+)["']/g; let m;
        while ((m = re.exec(field)) !== null) obj[m[1].toUpperCase()] = m[2];
        if (Object.keys(obj).length) return Object.entries(obj).map(([k, v]) => ({ label: k, text: v }));
      }
      return null;
    }

    const alts = parseAlternatives(doc.Alternativas) || parseAlternatives(doc.alternativas) || parseAlternatives(doc.options) || fallbackAlts;

    let mongoId = null;
    if (doc._id) {
      if (typeof doc._id === "string") mongoId = doc._id;
      else if (doc._id.$oid) mongoId = doc._id.$oid;
      else if (typeof doc._id.toString === "function") mongoId = String(doc._id);
    }

    return {
      id: String(doc.ID || mongoId || uid()),
      _mongoId: mongoId,
      simulado: String(doc.Simulado || doc.simulado || ""),
      numeroQuestao: String(doc["Questão Nº"] || doc["Questao Nº"] || doc.numeroQuestao || doc.numero || ""),
      disciplina: String(doc.Disciplina || doc.disciplina || ""),
      assunto: String(doc.Assunto || doc.assunto || ""),
      topico: String(doc["Tópico"] || doc.topico || ""),
      area: String(doc["Área"] || doc.Area || doc.area || ""),
      incidencia: String(doc["Incidência"] || doc.incidencia || ""),
      dificuldade: String(doc["Dificuldade"] || doc.dificuldade || ""),
      resultado: String(doc["Resultado"] || doc.resultado || ""),
      motivoErro: String(doc.MotivoErro || doc.motivo_erro || ""),
      competencia: String(doc.Competencia || doc["Competência"] || ""),
      habilidade: String(doc.Habilidade || doc.habilidade || ""),
      enunciado: String(doc.Enunciado || doc.enunciado || doc.question || "") ,
      imagem: String(doc.Imagem || doc.imagem || doc.image || ""),
      referencias: String(doc.Referencias || doc["Referências"] || doc.referencias || doc.references || ""),
      alternatives: alts,
      gabarito: String(doc.Gabarito || doc.gabarito || doc.answer || (alts[0] && alts[0].label) || "A"),
      marcada: String(doc.Marquei || doc.Marcada || doc.marcada || ""),
      explicacao: String(doc.Explicacao || doc["Explicação"] || doc.explicacao || doc.explanation || ""),
      _raw: doc
    };
  }

  /* ---------- CRUD helpers (mantidos como antes) ---------- */
  async function createQuestionOnServer(payload) {
    const res = await fetch(`${API_BASE}/api/questions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status} - ${txt}`); }
    const created = await res.json();
    return normalizeDoc(created);
  }

  async function updateQuestionOnServer(mongoId, payload, originalDoc = null) {
    const tryPut = async (id) => {
      const res = await fetch(`${API_BASE}/api/questions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const txt = await res.text();
        const err = new Error(txt || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const updated = await res.json();
      return normalizeDoc(updated);
    };

    if (mongoId) {
      try { return await tryPut(mongoId); } catch (err) { console.warn("PUT inicial falhou, fallback heurístico...", err.message || err); }
    }

    const listRes = await fetch(`${API_BASE}/api/questions?limit=5000`);
    if (!listRes.ok) throw new Error(`HTTP ${listRes.status} ao buscar lista para fallback`);
    const list = await listRes.json();
    const match = findMatchingDocInList(list, payload, originalDoc);
    if (!match) throw new Error(JSON.stringify({ error: "Documento não encontrado" }));
    const foundId = extractMongoId(match);
    if (!foundId) throw new Error(JSON.stringify({ error: "ID do documento não encontrado" }));
    return await tryPut(foundId);
  }

  async function deleteQuestionOnServer(mongoId) {
    const res = await fetch(`${API_BASE}/api/questions/${mongoId}`, { method: "DELETE" });
    if (!res.ok) { const txt = await res.text(); throw new Error(`HTTP ${res.status} - ${txt}`); }
    return res.json();
  }

  function extractMongoId(doc) {
    if (!doc) return null;
    if (doc._id) {
      if (typeof doc._id === "string") return doc._id;
      if (doc._id.$oid) return doc._id.$oid;
      if (doc._id.toString) return String(doc._id);
    }
    return null;
  }

  function findMatchingDocInList(list, payload, originalDoc = null) {
    if (!Array.isArray(list)) return null;
    if (payload.ID) {
      const found = list.find(d => d.ID && String(d.ID) === String(payload.ID));
      if (found) return found;
    }
    if (originalDoc && originalDoc._raw && originalDoc._raw.ID) {
      const found = list.find(d => d.ID && String(d.ID) === String(originalDoc._raw.ID));
      if (found) return found;
    }
    if (payload.Simulado && payload["Questão Nº"]) {
      const found = list.find(d => {
        const sim = (d.Simulado || d.simulado || "").toString();
        const num = (d["Questão Nº"] || d.numeroQuestao || d.numero || "").toString();
        return sim === payload.Simulado.toString() && num === payload["Questão Nº"].toString();
      });
      if (found) return found;
    }
    if (payload.Enunciado) {
      const snippet = payload.Enunciado.toString().slice(0, 40).trim();
      if (snippet) {
        const found = list.find(d => {
          const en = (d.Enunciado || d.enunciado || d.question || "").toString();
          return en && en.slice(0, 40).trim() === snippet;
        });
        if (found) return found;
      }
    }
    if (originalDoc && originalDoc._raw) {
      const raw = originalDoc._raw;
      const found = list.find(d => {
        if (raw.Timestamp && (d.Timestamp || d.timestamp) && String(d.Timestamp || d.timestamp) === String(raw.Timestamp)) return true;
        if (raw.Referencias && String(d.Referencias || d.referencias || "").includes(String(raw.Referencias))) return true;
        return false;
      });
      if (found) return found;
    }
    return null;
  }

  /* ---------- handlers de UI ---------- */
  function openNewModal() {
    setEditingMongoId(null);
    setEditingOriginalDoc(null);
    setForm(JSON.parse(JSON.stringify(emptyForm)));
    setModalOpen(true);
  }

  function openEditModal(q) {
    setEditingMongoId(q._mongoId || null);
    setEditingOriginalDoc(q || null);
    setForm({
      simulado: q.simulado || "", numeroQuestao: q.numeroQuestao || "", disciplina: q.disciplina || "",
      assunto: q.assunto || "", topico: q.topico || "", area: q.area || "", incidencia: q.incidencia || "",
      dificuldade: q.dificuldade || "", resultado: q.resultado || "Certo", motivoErro: q.motivoErro || "",
      competencia: q.competencia || "", habilidade: q.habilidade || "", enunciado: q.enunciado || "",
      imagem: q.imagem || "", referencias: q.referencias || "", alternatives: q.alternatives?.map(a => ({ ...a })) || emptyForm.alternatives,
      gabarito: q.gabarito || "A", marcada: q.marcada || "", explicacao: q.explicacao || ""
    });
    setModalOpen(true);
  }

  async function handleSave() {
    let imageToSend = form.imagem;
    try {
      if (imageToSend && imageToSend.startsWith("data:") && imageToSend.length > 200000) {
        imageToSend = await compressDataUrl(imageToSend, 1200, 0.7);
        toast.info("Imagem comprimida automaticamente para envio.");
      }
    } catch (err) {
      console.warn("compress failed:", err);
    }

    const payload = {
      Simulado: form.simulado,
      "Questão Nº": form.numeroQuestao,
      Disciplina: form.disciplina,
      Assunto: form.assunto,
      "Tópico": form.topico,
      "Área": form.area,
      "Incidência": form.incidencia,
      "Dificuldade": form.dificuldade,
      Resultado: form.resultado,
      MotivoErro: form.motivoErro,
      Competencia: form.competencia,
      Habilidade: form.habilidade,
      Enunciado: form.enunciado,
      Imagem: imageToSend,
      Referencias: form.referencias,
      Alternativas: form.alternatives.reduce((acc, a) => ({ ...acc, [a.label]: a.text }), {}),
      Gabarito: form.gabarito,
      Marquei: form.marcada,
      Explicacao: form.explicacao,
      Timestamp: new Date().toISOString()
    };

    try {
      if (editingMongoId) {
        const updated = await updateQuestionOnServer(editingMongoId, payload, editingOriginalDoc);
        setQuestions(prev => prev.map(q => (q._mongoId === (updated._mongoId || editingMongoId) ? updated : q)));
        toast.success("Questão atualizada com sucesso!");
        setModalOpen(false);
      } else {
        const created = await createQuestionOnServer(payload);
        setQuestions(prev => [created, ...prev]);
        toast.success("Questão criada com sucesso!");
        setModalOpen(false);
      }
    } catch (err) {
      console.warn("Erro salvar:", err);
      const msg = err.message || String(err);
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        toast.error("Erro de rede ao enviar. Verifique backend e tamanho da imagem.");
      } else {
        toast.error("Erro ao salvar: " + msg);
      }
    }
  }

  function handleDeleteClick(q) {
    setToDeleteId(q._mongoId || q.id);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!toDeleteId) return;
    try {
      await deleteQuestionOnServer(toDeleteId);
      setQuestions(prev => prev.filter(q => !(q._mongoId === toDeleteId || q.id === toDeleteId)));
      setDeleteOpen(false);
      toast.error("Questão excluída.");
    } catch (err) {
      console.error("Erro deletar:", err);
      toast.error("Erro ao deletar: " + (err.message || String(err)));
    }
  }

  /* dropdown dinâmico */
  const dropdownData = useMemo(() => {
    const s = new Set(), n = new Set(), d = new Set(), a = new Set(), t = new Set(), inc = new Set(), diff = new Set(), motive = new Set();
    for (const q of questions) {
      if (q.simulado) s.add(q.simulado);
      if (q.numeroQuestao) n.add(q.numeroQuestao);
      if (q.disciplina) d.add(q.disciplina);
      if (q.assunto) a.add(q.assunto);
      if (q.topico) t.add(q.topico);
      if (q.incidencia) inc.add(q.incidencia);
      if (q.dificuldade) diff.add(q.dificuldade);
      if (q.motivoErro) motive.add(q.motivoErro);
    }
    return {
      simulados: Array.from(s).sort(),
      numeros: Array.from(n).sort(),
      disciplinas: Array.from(d).sort(),
      assuntos: Array.from(a).sort(),
      topicos: Array.from(t).sort(),
      incidencias: Array.from(inc).sort(),
      dificuldades: Array.from(diff).sort(),
      motivos: Array.from(motive).sort()
    };
  }, [questions]);

  const multiIncludes = (filterArr, value) => {
    if (!filterArr || filterArr.length === 0) return true;
    return filterArr.includes(value);
  };

  const filtered = questions.filter(q => {
    const raw = JSON.stringify(q._raw || {});
    const text = ((q.enunciado || "") + " " + (q.assunto || "") + " " + (q.disciplina || "") + " " + raw).toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (!multiIncludes(filterSimulados, q.simulado)) return false;
    if (!multiIncludes(filterNumeros, q.numeroQuestao)) return false;
    if (!multiIncludes(filterDisciplinas, q.disciplina)) return false;
    if (!multiIncludes(filterAssuntos, q.assunto)) return false;
    if (!multiIncludes(filterTopicos, q.topico)) return false;
    if (!multiIncludes(filterIncidencias, q.incidencia)) return false;
    if (!multiIncludes(filterDificuldades, q.dificuldade)) return false;
    if (!multiIncludes(filterMotivos, q.motivoErro)) return false;
    if (filterAcertei && q.resultado !== "Certo") return false;
    if (filterErrei && q.resultado !== "Errado") return false;
    if (filterAreaHumanas && q.area !== "Linguagens e Ciências Humanas") return false;
    if (filterAreaMatNat && q.area !== "Matemática e Ciências da Natureza") return false;
    return true;
  });

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6">
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <FiBarChart2 className="text-violet-600" /> Banco de Questões
              </h1>
              <p className="text-slate-500 mt-1">Gerencie suas questões</p>

              {!loadedFromServer && (
                <div className="mt-2 text-sm text-rose-700 bg-rose-50 p-2 rounded">
                  Não foi possível carregar dados do servidor. Erro: {lastFetchError || "desconhecido"}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => window.location.href = "/dashboard"} className="px-4 py-2 bg-slate-100 rounded-2xl hover:bg-slate-200 inline-flex items-center gap-2">
                <FiBarChart2 /> Dashboard
              </button>
              <button onClick={openNewModal} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-2xl inline-flex items-center gap-2">
                <FiPlus /> Nova Questão
              </button>
            </div>
          </div>

          {/* filtros */}
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* QUANTIDADE À ESQUERDA */}
              <div className="text-sm text-slate-600 self-center mr-2">{filtered.length} questões</div>

              <div className="relative min-w-[260px] flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar por enunciado, assunto..." className="w-full pl-10 pr-3 py-2 border rounded text-slate-500" />
              </div>

              <MultiSelect options={dropdownData.simulados} value={filterSimulados} onChange={setFilterSimulados} placeholder="Simulados" />
              <MultiSelect options={dropdownData.numeros} value={filterNumeros} onChange={setFilterNumeros} placeholder="Nº Questão" />
              <MultiSelect options={dropdownData.disciplinas} value={filterDisciplinas} onChange={setFilterDisciplinas} placeholder="Disciplina" />
              <MultiSelect options={dropdownData.assuntos} value={filterAssuntos} onChange={setFilterAssuntos} placeholder="Assunto" />
              <MultiSelect options={dropdownData.topicos} value={filterTopicos} onChange={setFilterTopicos} placeholder="Tópico" />

              <MultiSelect options={dropdownData.dificuldades} value={filterDificuldades} onChange={setFilterDificuldades} placeholder="Dificuldade" />
              <MultiSelect options={dropdownData.motivos} value={filterMotivos} onChange={setFilterMotivos} placeholder="Motivo do Erro" />

              <div className="flex gap-4 items-center ml-2 flex-wrap">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterAcertei} onChange={e => setFilterAcertei(e.target.checked)} /> Acertei</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterErrei} onChange={e => setFilterErrei(e.target.checked)} /> Errei</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterAreaHumanas} onChange={e => setFilterAreaHumanas(e.target.checked)} /> Linguagens e Ciências Humanas</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filterAreaMatNat} onChange={e => setFilterAreaMatNat(e.target.checked)} /> Matemática e Ciências da Natureza</label>
              </div>

              {/* RIGHT group: botão Limpar Filtros e espaço */}
              <div className="ml-auto self-center flex items-center gap-4">
                <button onClick={() => {
                  setQuery(""); setFilterSimulados([]); setFilterNumeros([]); setFilterDisciplinas([]); setFilterAssuntos([]);
                  setFilterTopicos([]); setFilterIncidencias([]); setFilterDificuldades([]); setFilterMotivos([]);
                  setFilterAcertei(false); setFilterErrei(false); setFilterAreaHumanas(false); setFilterAreaMatNat(false);
                }} className="px-3 py-2 border rounded inline-flex items-center gap-2">
                  <FiXCircle className="text-black" />
                  <span>Limpar Filtros</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {filtered.map((q) => (
            <article key={q.id} className="bg-white rounded-xl p-5 shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">Q{q.numeroQuestao || "—"}</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={difficultyColor(q.dificuldade)}>{q.dificuldade || "—"}</span>
                  {q.incidencia && <span className="text-xs px-2 py-1 rounded-full" style={incidenceColor(q.incidencia)}>{q.incidencia}</span>}
                  {(q.assunto || q.topico) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{[q.assunto || "—", q.topico || "—"].join(" - ")}</span>
                  )}
                  {q.habilidade && <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{q.habilidade}</span>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEditModal(q)} className="p-2 rounded hover:bg-slate-50"><FiEdit2 /></button>
                  <button onClick={() => handleDeleteClick(q)} className="p-2 rounded hover:bg-slate-50 text-rose-600"><FiTrash2 /></button>
                </div>
              </div>

              {q.enunciado ? <h2 className="mt-3 text-lg font-semibold text-slate-900">{q.enunciado}</h2> : null}

              {q.imagem ? (
                <div className="mt-4 flex justify-center">
                  <img src={q.imagem} alt="imagem" className="max-h-72 object-contain" />
                </div>
              ) : null}

              {q.referencias && (
                <div className="mt-4 flex justify-end text-sm text-slate-500">
                  <span>{q.referencias}</span>
                </div>
              )}

              <div className="mt-4">
                {q.alternatives.map(a => (
                  <div key={a.label} className={`p-3 mb-2 rounded border ${a.label === q.gabarito ? "bg-emerald-50 border-emerald-200" : a.label === q.marcada ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"}`}>
                    <div className="flex items-start gap-3">
                      <strong className="w-6">{a.label})</strong>
                      <div className="text-slate-800">{a.text}</div>
                      {a.label === q.gabarito && <span className="ml-auto text-emerald-600 font-medium">✓ Gabarito</span>}
                      {a.label === q.marcada && a.label !== q.gabarito && <span className="ml-auto text-rose-600 font-medium">✗ Marcada</span>}
                    </div>
                  </div>
                ))}
              </div>

              {q.motivoErro && <div className="mt-3 text-sm text-rose-600 font-medium">Motivo do erro: {q.motivoErro}</div>}

              {q.explicacao && (
                <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-3 text-slate-700">
                  <strong>Explicação:</strong> {q.explicacao}
                </div>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white p-6 rounded text-center text-slate-500">Nenhuma questão encontrada.</div>
          )}
        </main>
      </div>

      {/* Modal */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        isEditing={!!editingMongoId}
      />

      {/* Delete confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white p-5 rounded shadow max-w-sm w-full">
            <h4 className="text-lg font-semibold">Confirmar exclusão</h4>
            <p className="text-slate-600 mt-2">Deseja realmente excluir esta questão?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeleteOpen(false)} className="px-3 py-2 border rounded">Cancelar</button>
              <button onClick={confirmDelete} className="px-3 py-2 bg-rose-600 text-white rounded">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
