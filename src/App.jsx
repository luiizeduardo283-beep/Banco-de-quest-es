// src/App.jsx
import React, { useEffect, useState } from "react";
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, 
  FiFilter, FiXCircle, FiBarChart2 
} from "react-icons/fi";
import { AREAS_CONHECIMENTO, INCIDENCE_CATS, DIFICULDADE_OPCOES, SIMULADOS } from "./constants";

/* Utilitário simples para gerar IDs */
const uid = () => Math.random().toString(36).slice(2, 9);

const defaultQuestions = [
  {
    id: "q1",
    simulado: "ENEM 2023",
    numeroQuestao: "1",
    disciplina: "Química",
    assunto: "Química Orgânica",
    topico: "Carboidratos",
    area: "Ciências da Natureza",
    incidencia: "Alta Incidência",
    dificuldade: "Fácil",
    resultado: "Certo",
    motivoErro: "",
    competencia: "Competência 5",
    habilidade: "H21",
    enunciado: "Qual é a fórmula molecular da glicose?",
    imagem: "",
    referencias: "Livro de Química Orgânica - Volume 1",
    alternativas: [
      { label: "A", text: "C6H12O6", correct: true },
      { label: "B", text: "C12H22O11" },
      { label: "C", text: "CH4" },
      { label: "D", text: "C2H6O" },
      { label: "E", text: "C6H10O5" },
    ],
    gabarito: "A",
    marcada: "A",
    explicacao: "A glicose é um monossacarídeo com fórmula molecular C6H12O6.",
  }
];

// Componente Modal com Abas
function QuestionModal({ isOpen, onClose, editing, form, setForm, onSave }) {
  const [activeTab, setActiveTab] = useState("dados");

  if (!isOpen) return null;

  const tabs = [
    { id: "dados", label: "Dados da Questão" },
    { id: "conteudo", label: "Conteúdo" },
    { id: "alternativas", label: "Alternativas" }
  ];

  // Helpers do form
  const setAltText = (idx, text) => {
    setForm(f => {
      const copy = JSON.parse(JSON.stringify(f));
      copy.alternatives[idx].text = text;
      return copy;
    });
  };

  const setCorrectAnswer = (label) => {
    setForm(f => ({ ...f, gabarito: label }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <h3 className="text-xl font-semibold">
            {editing ? "Editar Questão" : "Nova Questão"}
          </h3>
          <button onClick={onClose} className="icon-btn">
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-auto pr-2">
          {/* ABA 1: Dados da Questão */}
          {activeTab === "dados" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Simulado</label>
                  <select 
                    value={form.simulado} 
                    onChange={e => setForm({...form, simulado: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione um simulado</option>
                    {SIMULADOS.map(sim => (
                      <option key={sim} value={sim}>{sim}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nº da Questão</label>
                  <input 
                    type="number"
                    value={form.numeroQuestao}
                    onChange={e => setForm({...form, numeroQuestao: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
                  <input 
                    value={form.disciplina}
                    onChange={e => setForm({...form, disciplina: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: Matemática"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
                  <input 
                    value={form.assunto}
                    onChange={e => setForm({...form, assunto: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: Geometria Espacial"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tópico</label>
                  <input 
                    value={form.topico}
                    onChange={e => setForm({...form, topico: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: Prismas e Pirâmides"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                  <select 
                    value={form.area} 
                    onChange={e => setForm({...form, area: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma área</option>
                    {AREAS_CONHECIMENTO.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Incidência</label>
                  <select 
                    value={form.incidencia} 
                    onChange={e => setForm({...form, incidencia: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione a incidência</option>
                    {INCIDENCE_CATS.map(inc => (
                      <option key={inc} value={inc}>{inc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dificuldade</label>
                  <select 
                    value={form.dificuldade} 
                    onChange={e => setForm({...form, dificuldade: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione a dificuldade</option>
                    {DIFICULDADE_OPCOES.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: Conteúdo */}
          {activeTab === "conteudo" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Resultado</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="resultado"
                        value="Certo"
                        checked={form.resultado === "Certo"}
                        onChange={e => setForm({...form, resultado: e.target.value})}
                        className="mr-2"
                      />
                      Certo
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="resultado"
                        value="Errado"
                        checked={form.resultado === "Errado"}
                        onChange={e => setForm({...form, resultado: e.target.value})}
                        className="mr-2"
                      />
                      Errado
                    </label>
                  </div>
                </div>

                {form.resultado === "Errado" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo do Erro</label>
                    <input 
                      value={form.motivoErro}
                      onChange={e => setForm({...form, motivoErro: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Descreva o motivo do erro"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Competência</label>
                  <input 
                    value={form.competencia}
                    onChange={e => setForm({...form, competencia: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: Competência 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Habilidade</label>
                  <input 
                    value={form.habilidade}
                    onChange={e => setForm({...form, habilidade: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Ex: H21"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enunciado</label>
                <textarea 
                  value={form.enunciado}
                  onChange={e => setForm({...form, enunciado: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Digite o enunciado da questão..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem (opcional)</label>
                <input 
                  value={form.imagem}
                  onChange={e => setForm({...form, imagem: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referências</label>
                <input 
                  value={form.referencias}
                  onChange={e => setForm({...form, referencias: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Fonte bibliográfica da questão"
                />
              </div>
            </div>
          )}

          {/* ABA 3: Alternativas */}
          {activeTab === "alternativas" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">Alternativas</label>
                {form.alternatives.map((alt, idx) => (
                  <div key={alt.label} className="flex gap-3 items-center p-3 border border-slate-200 rounded-lg">
                    <span className="font-bold w-6">{alt.label})</span>
                    <input 
                      value={alt.text}
                      onChange={e => setAltText(idx, e.target.value)}
                      className="flex-1 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder={`Texto da alternativa ${alt.label}`}
                    />
                    <button
                      onClick={() => setCorrectAnswer(alt.label)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        form.gabarito === alt.label
                          ? "bg-emerald-500 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                      title={`Marcar ${alt.label} como correta`}
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gabarito</label>
                  <select 
                    value={form.gabarito} 
                    onChange={e => setForm({...form, gabarito: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione o gabarito</option>
                    {form.alternatives.map(alt => (
                      <option key={alt.label} value={alt.label}>{alt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marquei</label>
                  <select 
                    value={form.marcada} 
                    onChange={e => setForm({...form, marcada: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">O que marquei</option>
                    {form.alternatives.map(alt => (
                      <option key={alt.label} value={alt.label}>{alt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explicação</label>
                <textarea 
                  value={form.explicacao}
                  onChange={e => setForm({...form, explicacao: e.target.value})}
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Explicação detalhada da resposta correta..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-slate-500">
            {activeTab === "dados" && "Informações básicas da questão"}
            {activeTab === "conteudo" && "Conteúdo e contexto da questão"}  
            {activeTab === "alternativas" && "Alternativas e explicação"}
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button 
              onClick={onSave}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              <FiSave /> Salvar Questão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // questions (persistidas em localStorage)
  const [questions, setQuestions] = useState(() => {
    try {
      const raw = localStorage.getItem("bq_questions_v1");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultQuestions;
  });

  // filtros / busca
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("Todas as Disciplinas");
  const [simulado, setSimulado] = useState("Todos os Simulados");
  const [numeroQuestao, setNumeroQuestao] = useState("");

  // modal / edição / deleção
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDeleteId, setToDeleteId] = useState(null);

  // form fields (sincronizados com editing)
  const emptyForm = {
    simulado: "",
    numeroQuestao: "",
    disciplina: "Química",
    assunto: "",
    topico: "",
    area: "",
    incidencia: "",
    dificuldade: "Médio",
    resultado: "Certo",
    motivoErro: "",
    competencia: "",
    habilidade: "",
    enunciado: "",
    imagem: "",
    referencias: "",
    alternatives: [
      { label: "A", text: "" },
      { label: "B", text: "" },
      { label: "C", text: "" },
      { label: "D", text: "" },
      { label: "E", text: "" },
    ],
    gabarito: "A",
    marcada: "",
    explicacao: "",
  };
  const [form, setForm] = useState(emptyForm);

  // persistir sempre que perguntas mudarem
  useEffect(() => {
    try {
      localStorage.setItem("bq_questions_v1", JSON.stringify(questions));
    } catch (e) {}
  }, [questions]);

  // dados para filtros
  const disciplines = [
    "Todas as Disciplinas",
    "Química",
    "Matemática", 
    "Física",
    "Biologia",
    "História",
  ];

  const simuladosOptions = ["Todos os Simulados", ...SIMULADOS];

  // filtrar
  const filtered = questions.filter((q) => {
    const text = (q.enunciado + " " + q.assunto + " " + q.disciplina).toLowerCase();
    const matchesQuery = !query || text.includes(query.toLowerCase());
    const matchesDiscipline = discipline === "Todas as Disciplinas" || q.disciplina === discipline;
    const matchesSimulado = simulado === "Todos os Simulados" || q.simulado === simulado;
    const matchesNumero = !numeroQuestao || q.numeroQuestao.toString().includes(numeroQuestao);
    
    return matchesQuery && matchesDiscipline && matchesSimulado && matchesNumero;
  });

  // resetar filtros
  const resetFilters = () => {
    setQuery("");
    setDiscipline("Todas as Disciplinas");
    setSimulado("Todos os Simulados");
    setNumeroQuestao("");
  };

  // abrir modal novo
  function handleNew() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  // abrir modal editar
  function handleEdit(q) {
    setEditing(q.id);
    setForm({
      simulado: q.simulado || "",
      numeroQuestao: q.numeroQuestao || "",
      disciplina: q.disciplina || "",
      assunto: q.assunto || "",
      topico: q.topico || "",
      area: q.area || "",
      incidencia: q.incidencia || "",
      dificuldade: q.dificuldade || "Médio",
      resultado: q.resultado || "Certo",
      motivoErro: q.motivoErro || "",
      competencia: q.competencia || "",
      habilidade: q.habilidade || "",
      enunciado: q.enunciado || "",
      imagem: q.imagem || "",
      referencias: q.referencias || "",
      alternatives: q.alternatives?.map(a => ({ ...a })) || emptyForm.alternatives,
      gabarito: q.gabarito || "A",
      marcada: q.marcada || "",
      explicacao: q.explicacao || "",
    });
    setModalOpen(true);
  }

  // salvar (novo ou editar)
  function handleSave() {
    // validações básicas
    if (!form.enunciado.trim()) {
      alert("Preencha o enunciado da questão.");
      return;
    }
    
    // se editing -> atualizar
    if (editing) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editing
            ? {
                ...q,
                ...form
              }
            : q
        )
      );
    } else {
      // criar novo
      const newQ = {
        id: uid(),
        ...form
      };
      setQuestions((prev) => [newQ, ...prev]);
    }
    setModalOpen(false);
  }

  // confirmar delete
  function handleDelete(q) {
    setToDeleteId(q.id);
    setDeleteOpen(true);
  }
  
  function confirmDelete() {
    setQuestions((prev) => prev.filter((p) => p.id !== toDeleteId));
    setToDeleteId(null);
    setDeleteOpen(false);
  }

  // navegar para dashboard (placeholder)
  function goToDashboard() {
    alert("Dashboard será implementado em breve!");
    // window.location.href = "/dashboard"; // Para implementação real
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <span className="inline-block w-9 h-9 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-md" />
                Banco de Questões
              </h1>
              <p className="text-slate-500 mt-1">Gerencie suas questões e monte simulados personalizados</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToDashboard}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl shadow hover:bg-slate-200 transition"
                title="Ir para Dashboard"
              >
                <FiBarChart2 /> Dashboard
              </button>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-2 rounded-2xl shadow-lg hover:scale-105 transform transition"
                title="Nova questão"
              >
                <FiPlus /> Nova Questão
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="bg-white rounded-xl shadow-md p-5 mt-6 ring-1 ring-slate-100">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por enunciado ou assunto..."
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>

              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-100"
              >
                {disciplines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={simulado}
                onChange={(e) => setSimulado(e.target.value)}
                className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-100"
              >
                {simuladosOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={numeroQuestao}
                onChange={(e) => setNumeroQuestao(e.target.value)}
                placeholder="Nº Questão"
                className="px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-100 w-32"
              />

              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                title="Remover filtros"
              >
                <FiXCircle /> Limpar
              </button>

              <button
                className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
                title="Aplicar filtros"
              >
                <FiFilter /> Filtrar
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-600 flex justify-between items-center">
              <span>{filtered.length} questões encontradas</span>
              {(query || discipline !== "Todas as Disciplinas" || simulado !== "Todos os Simulados" || numeroQuestao) && (
                <span className="text-violet-600">Filtros ativos</span>
              )}
            </div>
          </div>
        </header>

        {/* Lista de questões */}
        <main className="space-y-6">
          {filtered.map((q) => (
            <article
              key={q.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-start flex-wrap">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{q.dificuldade}</span>
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">{q.simulado}</span>
                    <span className="inline-block bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">Q{q.numeroQuestao}</span>
                    <span className="inline-block bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">{q.disciplina}</span>
                    <span className="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full">{q.incidencia}</span>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                      q.resultado === "Certo" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-rose-50 text-rose-700"
                    }`}>
                      {q.resultado}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(q)}
                    className="icon-btn text-violet-600 hover:bg-violet-50"
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    onClick={() => handleDelete(q)}
                    className="icon-btn text-rose-600 hover:bg-rose-50"
                    title="Excluir"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">{q.enunciado}</h2>
              <div className="text-sm text-slate-500 mt-1">
                <span>Assunto: {q.assunto}</span>
                {q.topico && <span className="ml-4">Tópico: {q.topico}</span>}
                {q.area && <span className="ml-4">Área: {q.area}</span>}
              </div>

              {q.competencia && q.habilidade && (
                <div className="text-sm text-slate-500 mt-1">
                  Competência: {q.competencia} | Habilidade: {q.habilidade}
                </div>
              )}

              <hr className="my-4" />

              <h3 className="font-medium mb-2">Alternativas:</h3>
              <div className="grid gap-3">
                {q.alternatives.map((a) => (
                  <div key={a.label} className={`p-3 rounded-lg border ${
                    a.label === q.gabarito 
                      ? "bg-emerald-50 border-emerald-200" 
                      : a.label === q.marcada 
                        ? "bg-rose-50 border-rose-200"
                        : "bg-white border-slate-200"
                  }`}>
                    <div className="flex items-start gap-3">
                      <strong className="w-6">{a.label})</strong>
                      <div className="text-slate-800">{a.text}</div>
                      {a.label === q.gabarito && (
                        <span className="ml-auto text-emerald-600 font-medium">✓ Gabarito</span>
                      )}
                      {a.label === q.marcada && a.label !== q.gabarito && (
                        <span className="ml-auto text-rose-600 font-medium">✗ Marcada</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm">
                <strong>Resultado:</strong>{" "}
                <span className={`font-medium ml-2 ${
                  q.resultado === "Certo" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {q.resultado}
                  {q.motivoErro && q.resultado === "Errado" && ` - ${q.motivoErro}`}
                </span>
              </div>

              {q.explicacao && (
                <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-4 text-slate-700">
                  <strong>Explicação:</strong> {q.explicacao}
                </div>
              )}
            </article>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-slate-500">
              Nenhuma questão encontrada. {query || discipline !== "Todas as Disciplinas" || simulado !== "Todos os Simulados" ? "Tente ajustar os filtros." : "Clique em 'Nova Questão' para começar."}
            </div>
          )}
        </main>
      </div>

      {/* Modal de edição/criação */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />

      {/* Modal de confirmação de exclusão */}
      {deleteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h4 className="text-lg font-semibold">Confirmar exclusão</h4>
            <p className="text-slate-600 mt-2">Você tem certeza que deseja excluir esta questão? Esta ação não pode ser desfeita.</p>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setDeleteOpen(false)} className="px-3 py-2 rounded-lg border">Cancelar</button>
              <button onClick={confirmDelete} className="px-3 py-2 rounded-lg bg-rose-600 text-white">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}