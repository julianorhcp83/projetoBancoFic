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
  onFechar: () => void;
}

export function ClienteDetalhes({
  cliente,
  contas,
  agencias,
  onFechar,
}: ClienteDetalhesProps) {
  // Filtra todas as contas pertencentes a este cliente comparando apenas os dígitos do CPF/CNPJ
  const cpfClienteDigitos = apenasDigitos(cliente.cpfCnpj);
  const contasDoCliente = contas.filter(
    (conta) => apenasDigitos(conta.cpfCnpjCliente) === cpfClienteDigitos
  );

  // Busca a agência correspondente ao código de agência do cliente
  const agenciaDoCliente = agencias.find(
    (agencia) => agencia.codigo === cliente.codigoAgencia
  );

  return (
    <section
      aria-label="Detalhes do cliente selecionado"
      style={{
        marginTop: "2rem",
        padding: "1.25rem",
        border: "2px solid #0f52ba",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Detalhes de {cliente.nomeSocial || cliente.nome}
        </h2>
        <button type="button" onClick={onFechar} style={{ padding: "0.4rem 0.8rem" }}>
          Fechar detalhes
        </button>
      </div>

      {/* Dados cadastrais completos do cliente */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Dados Pessoais e Financeiros</h3>
        <ul style={{ lineHeight: 1.7, paddingLeft: "1.25rem" }}>
          <li>
            <strong>Nome completo:</strong> {cliente.nome}
          </li>
          {cliente.nomeSocial && (
            <li>
              <strong>Nome social:</strong> {cliente.nomeSocial}
            </li>
          )}
          <li>
            <strong>CPF/CNPJ:</strong> {formatarCpfCnpj(cliente.cpfCnpj)}
          </li>
          <li>
            <strong>RG:</strong> {cliente.rg || "Não informado"}
          </li>
          <li>
            <strong>Data de nascimento:</strong> {formatarData(cliente.dataNascimento)}
          </li>
          <li>
            <strong>Estado civil:</strong> {cliente.estadoCivil}
          </li>
          <li>
            <strong>E-mail:</strong> {cliente.email || "Não informado"}
          </li>
          <li>
            <strong>Endereço:</strong> {cliente.endereco || "Não informado"}
          </li>
          <li>
            <strong>Renda anual:</strong> {formatarMoeda(cliente.rendaAnual)}
          </li>
          <li>
            <strong>Patrimônio:</strong> {formatarMoeda(cliente.patrimonio)}
          </li>
        </ul>
      </div>

      {/* Dados da agência vinculada */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Agência Vinculada</h3>
        {agenciaDoCliente ? (
          <div style={{ padding: "0.85rem", border: "1px solid #ccc", borderRadius: "8px" }}>
            <div>
              <strong>Código:</strong> {agenciaDoCliente.codigo}
            </div>
            <div>
              <strong>Nome:</strong> {agenciaDoCliente.nome}
            </div>
            <div>
              <strong>Endereço:</strong> {agenciaDoCliente.endereco || "Não informado"}
            </div>
          </div>
        ) : (
          <p>
            Agência de código <strong>{cliente.codigoAgencia}</strong> não encontrada na lista de agências.
          </p>
        )}
      </div>

      {/* Contas bancárias do cliente */}
      <div>
        <h3>Contas Bancárias ({contasDoCliente.length})</h3>
        {contasDoCliente.length === 0 ? (
          <p>Este cliente não possui contas cadastradas na planilha.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {contasDoCliente.map((conta) => (
              <div
                key={conta.id}
                style={{
                  padding: "0.85rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <strong>Tipo de conta:</strong>{" "}
                  {conta.tipo === "poupanca" ? "Conta Poupança" : "Conta Corrente"}
                </div>
                <div>
                  <strong>Saldo:</strong> {formatarMoeda(conta.saldo)}
                </div>
                <div>
                  <strong>Limite de crédito:</strong> {formatarMoeda(conta.limiteCredito)}
                </div>
                <div>
                  <strong>Crédito disponível:</strong>{" "}
                  {formatarMoeda(conta.creditoDisponivel)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}