import { useEffect, useMemo, useState } from "react";
import type { Agencia, Cliente, Conta, EstadoCivil } from "../types/bank";
import { apenasDigitos, formatarCpfCnpj } from "../utils/formatadores";
import { ClienteDetalhes } from "./ClienteDetalhes";

//max de 10 clientes por pagina
const ITENS_POR_PAG = 10;

interface ClienteListaProps {
  clientes: Cliente[];
  contas: Conta[];
  agencias: Agencia[];
  clienteSelecionadoId?: string | null;
  onSelecionarCliente?: (cliente: Cliente) => void;
  onFecharDetalhes?: () => void;
}

export function ClienteLista({
  clientes,
  contas,
  agencias,
  clienteSelecionadoId = null,
  onSelecionarCliente,
  onFecharDetalhes,
}: ClienteListaProps) {
  const [busca, setBusca] = useState("");
  const [estadoCivilFiltro, setEstadoCivilFiltro] = useState<"Todos" | EstadoCivil>("Todos");
  const [agenciaFiltro, setAgenciaFiltro] = useState<string>("todas");
  const [paginaAtual, setPaginaAtual] = useState(1);

  //indexa agencias por codigo
  const mapaAgencias = useMemo(() => {
    const mapa = new Map<number, Agencia>();
    for (const agencia of agencias) {
      mapa.set(agencia.codigo, agencia);
    }
    return mapa;
  }, [agencias]);

  //filtro por nome, nome social, cpf/cnpj, estado civil e agencia
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

  //volta pra pagina 1 smp que algum filtro muda
  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, estadoCivilFiltro, agenciaFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / ITENS_POR_PAG));
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">
          Clientes <span className="badge bg-secondary">{clientesFiltrados.length}</span>
        </h2>
      </div>

      {/* Barra de busca e filtros */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-3">
          <select
            aria-label="Filtrar por estado civil"
            className="form-select"
            value={estadoCivilFiltro}
            onChange={(e) => setEstadoCivilFiltro(e.target.value as "Todos" | EstadoCivil)}
          >
            <option value="Todos">Todos os estados civis</option>
            <option value="Solteiro">Solteiro</option>
            <option value="Casado">Casado</option>
            <option value="Viúvo">Viúvo</option>
            <option value="Divorciado">Divorciado</option>
          </select>
        </div>

        <div className="col-12 col-md-4 d-flex gap-2">
          <select
            aria-label="Filtrar por agência"
            className="form-select"
            value={agenciaFiltro}
            onChange={(e) => setAgenciaFiltro(e.target.value)}
          >
            <option value="todas">Todas as agências</option>
            {agencias.map((agencia) => (
              <option key={agencia.id} value={String(agencia.codigo)}>
                {agencia.codigo} - {agencia.nome}
              </option>
            ))}
          </select>

          {(busca || estadoCivilFiltro !== "Todos" || agenciaFiltro !== "todas") && (
            <button
              type="button"
              onClick={limparFiltros}
              className="btn btn-outline-secondary text-nowrap"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Listagem resumida com detalhes expansíveis logo abaixo do item */}
      {clientesPaginados.length === 0 ? (
        <div className="alert alert-warning">
          Nenhum cliente encontrado com os critérios informados.
        </div>
      ) : (
        <div className="d-grid gap-3">
          {clientesPaginados.map((cliente) => {
            const agencia = mapaAgencias.get(cliente.codigoAgencia);
            const selecionado = clienteSelecionadoId === cliente.id;

            return (
              <div key={cliente.id}>
                <article
                  className={`card shadow-sm ${
                    selecionado ? "border-primary border-2" : ""
                  }`}
                >
                  <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        <strong className="fs-5">
                          {cliente.nomeSocial || cliente.nome}
                        </strong>
                        {cliente.nomeSocial && (
                          <span className="text-muted small">({cliente.nome})</span>
                        )}
                        <span className="badge bg-light text-dark border">
                          {cliente.estadoCivil}
                        </span>
                      </div>

                      <div className="text-muted small mt-1">
                        CPF/CNPJ: <strong>{formatarCpfCnpj(cliente.cpfCnpj)}</strong> •{" "}
                        Agência:{" "}
                        {agencia
                          ? `${agencia.codigo} - ${agencia.nome}`
                          : `Cód. ${cliente.codigoAgencia}`}
                      </div>

                      {cliente.email && (
                        <div className="text-muted small">{cliente.email}</div>
                      )}
                    </div>

                    {onSelecionarCliente && (
                      <button
                        type="button"
                        onClick={() =>
                          selecionado && onFecharDetalhes
                            ? onFecharDetalhes()
                            : onSelecionarCliente(cliente)
                        }
                        className={`btn btn-sm ${
                          selecionado ? "btn-primary" : "btn-outline-primary"
                        }`}
                      >
                        {selecionado ? "Ocultar detalhes" : "Ver detalhes"}
                      </button>
                    )}
                  </div>
                </article>

                {/* Detalhes abertos logo abaixo do card selecionado */}
                {selecionado && (
                  <div className="mt-2 ms-md-3">
                    <ClienteDetalhes
                      cliente={cliente}
                      contas={contas}
                      agencias={agencias}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação (máximo 10 clientes por página) */}
      <nav
        aria-label="Paginação de clientes"
        className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2"
      >
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          disabled={paginaSegura <= 1}
        >
          Anterior
        </button>

        <span className="text-muted small">
          Página <strong>{paginaSegura}</strong> de <strong>{totalPaginas}</strong> (até{" "}
          {ITENS_POR_PAG} por página)
        </span>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
          disabled={paginaSegura >= totalPaginas}
        >
          Próxima
        </button>
      </nav>
    </section>
  );
}