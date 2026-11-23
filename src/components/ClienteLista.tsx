import { useEffect, useMemo, useState } from "react";
import type {Agencia, Cliente, EstadoCivil} from "../types/bank";
import { apenasDigitos, formatarCpfCnpj } from "../utils/formatadores";

const ITENS_POR_PAG = 10;

interface ClienteListaProps{
    clientes: Cliente[];
    agencias: Agencia[];
    clienteSelecionadoId?: string | null;
    onSelecionarCliente?: (cliente: Cliente) => void;
}

export function ClienteLista({
  clientes,
  agencias,
  clienteSelecionadoId = null,
  onSelecionarCliente,
}: ClienteListaProps) {
  const [busca, setBusca] = useState("");
  const [estadoCivilFiltro, setEstadoCivilFiltro] = useState<"Todos" | EstadoCivil>("Todos");
  const [agenciaFiltro, setAgenciaFiltro] = useState<string>("todas");
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Mapa rápido de código da agência -> nome da agência
  const mapaAgencias = useMemo(() => {
    const mapa = new Map<number, Agencia>();
    for (const agencia of agencias) {
      mapa.set(agencia.codigo, agencia);
    }
    return mapa;
  }, [agencias]);

  // Aplica busca (nome ou CPF/CNPJ) e filtros (estado civil e agência)
  const clientesFiltrados = useMemo(() => {
    const termoTexto = busca.trim().toLowerCase();
    const termoDigitos = apenasDigitos(busca);

    return clientes.filter((cliente) => {
      const correspondeBusca =
        !termoTexto ||
        cliente.nome.toLowerCase().includes(termoTexto) ||
        (cliente.nomeSocial ?? "").toLowerCase().includes(termoTexto) ||
        (termoDigitos.length > 0 &&
          apenasDigitos(cliente.cpfCnpj).includes(termoDigitos)) ||
        cliente.cpfCnpj.toLowerCase().includes(termoTexto);

      const correspondeEstadoCivil =
        estadoCivilFiltro === "Todos" || cliente.estadoCivil === estadoCivilFiltro;

      const correspondeAgencia =
        agenciaFiltro === "todas" ||
        String(cliente.codigoAgencia) === agenciaFiltro;

      return correspondeBusca && correspondeEstadoCivil && correspondeAgencia;
    });
  }, [clientes, busca, estadoCivilFiltro, agenciaFiltro]);

  // Sempre que busca ou filtro mudar, volta para a primeira página
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, estadoCivilFiltro, agenciaFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / ITENS_POR_PAG));

  // Garante que paginaAtual nunca passe do total de páginas
  const paginaSegura = Math.min(paginaAtual, totalPaginas);

  const clientesPaginados = useMemo(() => {
    const inicio = (paginaSegura - 1) * ITENS_POR_PAG;
    return clientesFiltrados.slice(inicio, inicio + ITENS_POR_PAG);
  }, [clientesFiltrados, paginaSegura]);

  function limparFiltros() {
    setBusca("");
    setEstadoCivilFiltro("Todos");
    setAgenciaFiltro("todas");
    setPaginaAtual(1);
  }

  return (
    <section>
      <h2>Clientes ({clientesFiltrados.length})</h2>

      {/* Barra de busca e filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF/CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: "0.5rem", minWidth: "240px" }}
        />

        <select
          aria-label="Filtrar por estado civil"
          value={estadoCivilFiltro}
          onChange={(e) => setEstadoCivilFiltro(e.target.value as "Todos" | EstadoCivil)}
          style={{ padding: "0.5rem" }}
        >
          <option value="Todos">Todos os estados civis</option>
          <option value="Solteiro">Solteiro</option>
          <option value="Casado">Casado</option>
          <option value="Viúvo">Viúvo</option>
          <option value="Divorciado">Divorciado</option>
        </select>

        <select
          aria-label="Filtrar por agência"
          value={agenciaFiltro}
          onChange={(e) => setAgenciaFiltro(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="todas">Todas as agências</option>
          {agencias.map((agencia) => (
            <option key={agencia.id} value={String(agencia.codigo)}>
              {agencia.codigo} - {agencia.nome}
            </option>
          ))}
        </select>

        {(busca || estadoCivilFiltro !== "Todos" || agenciaFiltro !== "todas") && (
          <button type="button" onClick={limparFiltros} style={{ padding: "0.5rem 0.75rem" }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Listagem resumida */}
      {clientesPaginados.length === 0 ? (
        <p>Nenhum cliente encontrado com os critérios informados.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {clientesPaginados.map((cliente) => {
            const agencia = mapaAgencias.get(cliente.codigoAgencia);
            const selecionado = clienteSelecionadoId === cliente.id;

            return (
              <article
                key={cliente.id}
                style={{
                  border: selecionado ? "2px solid #0f52ba" : "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "0.9rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong>{cliente.nomeSocial || cliente.nome}</strong>
                  {cliente.nomeSocial && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.9rem" }}>
                      ({cliente.nome})
                    </span>
                  )}
                  <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    CPF/CNPJ: {formatarCpfCnpj(cliente.cpfCnpj)} • Estado civil: {cliente.estadoCivil}
                  </div>
                  <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
                    Agência: {agencia ? `${agencia.codigo} - ${agencia.nome}` : `Cód. ${cliente.codigoAgencia}`} • {cliente.email}
                  </div>
                </div>

                {onSelecionarCliente && (
                  <button
                    type="button"
                    onClick={() => onSelecionarCliente(cliente)}
                    style={{ padding: "0.45rem 0.85rem" }}
                  >
                    Ver detalhes
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Paginação (máximo 10 clientes por página) */}
      <nav
        aria-label="Paginação de clientes"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          disabled={paginaSegura <= 1}
        >
          Anterior
        </button>

        <span>
          Página <strong>{paginaSegura}</strong> de <strong>{totalPaginas}</strong> (até{" "}
          {ITENS_POR_PAG} por página)
        </span>

        <button
          type="button"
          onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          disabled={paginaSegura >= totalPaginas}
        >
          Próxima
        </button>
      </nav>
    </section>
  );
}