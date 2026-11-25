import type { Agencia, Cliente, Conta } from "../types/bank";
import {
  apenasDigitos,
  formatarCpfCnpj,
  formatarData,
  formatarMoeda,
} from "../utils/formatadores";

interface ClienteDetalhesProps {
  cliente: Cliente;
  contas: Conta[];
  agencias: Agencia[];
}

export function ClienteDetalhes({
  cliente,
  contas,
  agencias,
}: ClienteDetalhesProps) {
  const cpfClienteDigitos = apenasDigitos(cliente.cpfCnpj);
  const contasDoCliente = contas.filter(
    (conta) => apenasDigitos(conta.cpfCnpjCliente) === cpfClienteDigitos
  );

  const agenciaDoCliente = agencias.find(
    (agencia) => agencia.codigo === cliente.codigoAgencia
  );

  return (
    <section
      aria-label="Detalhes do cliente selecionado"
      className="card border-primary mt-0 shadow"
    >
      <div className="card-header bg-dark text-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 className="h5 mb-0">
          Detalhes de {cliente.nomeSocial || cliente.nome}
        </h2>
      </div>

      <div className="card-body">
        <div className="row g-4 mb-4">
          {/* Dados cadastrais completos do cliente */}
          <div className="col-12 col-md-7">
            <h3 className="h6 text-uppercase text-muted mb-3">
              Dados Pessoais e Financeiros
            </h3>
            <ul className="list-group list-group-flush">
              <li className="list-group-item px-0">
                <strong>Nome completo:</strong> {cliente.nome}
              </li>
              {cliente.nomeSocial && (
                <li className="list-group-item px-0">
                  <strong>Nome social:</strong> {cliente.nomeSocial}
                </li>
              )}
              <li className="list-group-item px-0">
                <strong>CPF/CNPJ:</strong> {formatarCpfCnpj(cliente.cpfCnpj)}
              </li>
              <li className="list-group-item px-0">
                <strong>RG:</strong> {cliente.rg || "Não informado"}
              </li>
              <li className="list-group-item px-0">
                <strong>Data de nascimento:</strong>{" "}
                {formatarData(cliente.dataNascimento)}
              </li>
              <li className="list-group-item px-0">
                <strong>Estado civil:</strong> {cliente.estadoCivil}
              </li>
              <li className="list-group-item px-0">
                <strong>E-mail:</strong> {cliente.email || "Não informado"}
              </li>
              <li className="list-group-item px-0">
                <strong>Endereço:</strong> {cliente.endereco || "Não informado"}
              </li>
              <li className="list-group-item px-0">
                <strong>Renda anual:</strong> {formatarMoeda(cliente.rendaAnual)}
              </li>
              <li className="list-group-item px-0">
                <strong>Patrimônio:</strong> {formatarMoeda(cliente.patrimonio)}
              </li>
            </ul>
          </div>

          {/* Dados da agência vinculada */}
          <div className="col-12 col-md-5">
            <h3 className="h6 text-uppercase text-muted mb-3">
              Agência Vinculada
            </h3>
            {agenciaDoCliente ? (
              <div className="card bg-light border-0">
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Código:</strong> {agenciaDoCliente.codigo}
                  </p>
                  <p className="mb-2">
                    <strong>Nome:</strong> {agenciaDoCliente.nome}
                  </p>
                  <p className="mb-0">
                    <strong>Endereço:</strong>{" "}
                    {agenciaDoCliente.endereco || "Não informado"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="alert alert-secondary">
                Agência de código <strong>{cliente.codigoAgencia}</strong> não
                encontrada na lista de agências.
              </div>
            )}
          </div>
        </div>

        {/* Contas bancárias do cliente */}
        <div>
          <h3 className="h6 text-uppercase text-muted mb-3">
            Contas Bancárias ({contasDoCliente.length})
          </h3>
          {contasDoCliente.length === 0 ? (
            <div className="alert alert-secondary mb-0">
              Este cliente não possui contas cadastradas na planilha.
            </div>
          ) : (
            <div className="row g-3">
              {contasDoCliente.map((conta) => (
                <div key={conta.id} className="col-12 col-md-6">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className={`badge ${
                            conta.tipo === "poupanca"
                              ? "bg-info text-dark"
                              : "bg-primary"
                          }`}
                        >
                          {conta.tipo === "poupanca"
                            ? "Conta Poupança"
                            : "Conta Corrente"}
                        </span>
                        <span className="text-muted small">ID: {conta.id}</span>
                      </div>
                      <p className="mb-1">
                        <strong>Saldo:</strong> {formatarMoeda(conta.saldo)}
                      </p>
                      <p className="mb-1">
                        <strong>Limite de crédito:</strong>{" "}
                        {formatarMoeda(conta.limiteCredito)}
                      </p>
                      <p className="mb-0">
                        <strong>Crédito disponível:</strong>{" "}
                        {formatarMoeda(conta.creditoDisponivel)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}