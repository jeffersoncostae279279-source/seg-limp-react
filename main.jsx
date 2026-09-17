import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";

const initialReports = [
  {
    id: 1,
    title: "Poste apagado na Rua Principal",
    neighborhood: "Centro",
    address: "Rua Principal, próximo à praça",
    status: "Pendente",
    description: "Lâmpada apagada durante a noite.",
    createdAt: "15/09/2026"
  },
  {
    id: 2,
    title: "Iluminação intermitente",
    neighborhood: "Vila União",
    address: "Av. Brasil, quadra 4",
    status: "Em análise",
    description: "A luminária acende e apaga continuamente.",
    createdAt: "14/09/2026"
  }
];

function App() {
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem("seg-limp-reports");
    return saved ? JSON.parse(saved) : initialReports;
  });
  const [filter, setFilter] = useState("Todos");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("seg-limp-reports", JSON.stringify(reports));
  }, [reports]);

  function addReport(report) {
    setReports((current) => [{ ...report, id: Date.now() }, ...current]);
    setNotice("Denúncia registrada com sucesso.");
    setTimeout(() => setNotice(""), 3500);
  }

  function updateStatus(id, status) {
    setReports((current) =>
      current.map((report) => report.id === id ? { ...report, status } : report)
    );
  }

  const visible = filter === "Todos"
    ? reports
    : reports.filter((report) => report.status === filter);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">SEG<span>&</span>LIMP</Link>
        <nav>
          <Link to="/">Início</Link>
          <Link to="/denunciar">Denunciar</Link>
          <Link to="/comissoes">Comissões</Link>
        </nav>
      </header>

      {notice && <div className="toast" role="status">{notice}</div>}

      <Routes>
        <Route path="/" element={<Home reports={reports} />} />
        <Route path="/denunciar" element={<ReportForm onSubmit={addReport} />} />
        <Route path="/comissoes" element={
          <Commissions reports={visible} filter={filter} setFilter={setFilter} onStatus={updateStatus} />
        } />
      </Routes>

      <footer>
        <p>SEG&LIMP — Projeto acadêmico relacionado ao ODS 11.</p>
      </footer>
    </div>
  );
}

function Home({ reports }) {
  const navigate = useNavigate();
  const total = reports.length;
  const pending = reports.filter(r => r.status === "Pendente").length;
  const analysis = reports.filter(r => r.status === "Em análise").length;
  const resolved = reports.filter(r => r.status === "Resolvido").length;

  return (
    <main>
      <section className="hero">
        <div>
          <span className="eyebrow">ODS 11 — Cidades e Comunidades Sustentáveis</span>
          <h1>Uma cidade mais segura começa com uma iluminação que funciona.</h1>
          <p>
            Registre pontos com iluminação pública defeituosa e acompanhe o
            andamento das denúncias de forma simples e colaborativa.
          </p>
          <button className="primary" onClick={() => navigate("/denunciar")}>
            Fazer uma denúncia
          </button>
        </div>
        <div className="hero-card">
          <strong>SEG&LIMP</strong>
          <p>Sistema colaborativo para denúncia de falta de iluminação pública.</p>
        </div>
      </section>

      <section className="stats">
        <Stat label="Denúncias" value={total} />
        <Stat label="Pendentes" value={pending} />
        <Stat label="Em análise" value={analysis} />
        <Stat label="Resolvidas" value={resolved} />
      </section>

      <section className="content-section">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>Do problema ao acompanhamento</h2>
        </div>
        <div className="steps">
          <div><b>01</b><h3>Registrar</h3><p>Informe o endereço e descreva o problema.</p></div>
          <div><b>02</b><h3>Analisar</h3><p>A comissão acompanha e atualiza o status.</p></div>
          <div><b>03</b><h3>Acompanhar</h3><p>O cidadão visualiza a evolução da solicitação.</p></div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }) {
  return <div className="stat-card"><strong>{value}</strong><span>{label}</span></div>;
}

function ReportForm({ onSubmit }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", neighborhood: "", address: "", cep: "", description: ""
  });
  const [apiStatus, setApiStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function searchCep() {
    const cep = form.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setApiStatus("Digite um CEP com 8 números.");
      return;
    }
    setApiStatus("Consultando CEP...");
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!response.ok) throw new Error("CEP não encontrado");
      const data = await response.json();
      const address = [data.street, data.neighborhood, data.city, data.state]
        .filter(Boolean).join(", ");
      setForm(current => ({
        ...current,
        address,
        neighborhood: data.neighborhood || current.neighborhood
      }));
      setApiStatus("Endereço preenchido pela API.");
    } catch {
      setApiStatus("Não foi possível consultar o CEP.");
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title || !form.address || !form.description) return;
    onSubmit({
      ...form,
      status: "Pendente",
      createdAt: new Date().toLocaleDateString("pt-BR")
    });
    navigate("/comissoes");
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setApiStatus("Geolocalização não suportada neste navegador.");
      return;
    }
    setApiStatus("Obtendo localização...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const addressField = `Coordenadas: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;
        setForm(current => ({ ...current, address: addressField }));
        setApiStatus("Localização obtida pelo navegador.");
      },
      () => setApiStatus("Permissão de localização não concedida.")
    );
  }

  return (
    <main className="page">
      <section className="form-card">
        <span className="eyebrow">Nova ocorrência</span>
        <h1>Registrar falta de iluminação</h1>
        <p>Preencha os dados do local para criar uma denúncia.</p>

        <form onSubmit={submit}>
          <label>Título
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Ex.: Poste apagado" required />
          </label>

          <div className="two-cols">
            <label>CEP
              <div className="inline-input">
                <input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000" />
                <button type="button" className="secondary" onClick={searchCep}>Buscar</button>
              </div>
            </label>
            <label>Bairro
              <input name="neighborhood" value={form.neighborhood} onChange={handleChange} />
            </label>
          </div>

          <label>Endereço
            <input name="address" value={form.address} onChange={handleChange}
              placeholder="Rua, número ou referência" required />
          </label>

          <button type="button" className="secondary location" onClick={useLocation}>
            Usar minha localização
          </button>

          <label>Descrição
            <textarea name="description" value={form.description} onChange={handleChange}
              rows="5" placeholder="Explique o problema encontrado..." required />
          </label>

          {apiStatus && <p className="api-status">{apiStatus}</p>}

          <div className="form-actions">
            <Link className="secondary" to="/">Cancelar</Link>
            <button className="primary" type="submit">Enviar denúncia</button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Commissions({ reports, filter, setFilter, onStatus }) {
  return (
    <main className="page">
      <section className="content-section">
        <span className="eyebrow">Painel de acompanhamento</span>
        <h1>Comissões e denúncias</h1>
        <p>Área demonstrativa para acompanhar e atualizar ocorrências.</p>

        <div className="filters">
          {["Todos", "Pendente", "Em análise", "Resolvido"].map(item =>
            <button key={item}
              className={filter === item ? "filter active" : "filter"}
              onClick={() => setFilter(item)}>
              {item}
            </button>
          )}
        </div>

        <div className="report-list">
          {reports.map(report => (
            <article className="report" key={report.id}>
              <div>
                <span className={`badge ${report.status.toLowerCase().replace(" ", "-")}`}>
                  {report.status}
                </span>
                <h3>{report.title}</h3>
                <p>{report.address}</p>
                <small>{report.description} • {report.createdAt}</small>
              </div>
              <select value={report.status} onChange={e => onStatus(report.id, e.target.value)}>
                <option>Pendente</option>
                <option>Em análise</option>
                <option>Resolvido</option>
              </select>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
