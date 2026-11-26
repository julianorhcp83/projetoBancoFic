import { useState, type FormEvent } from "react";
import type { Agencia, Cliente, EstadoCivil } from "../types/bank";
import { apenasDigitos } from "../utils/formatadores";

interface CadastroClienteProps {
  agencias: Agencia[];
  onAdicionarCliente: (novoCliente: Cliente) => void;
}

const ESTADOS_CIVIS: EstadoCivil[] = [
  "Solteiro",
  "Casado",
  "Viuvo",
  "Divorciado",
];

// converte a string yyyy-mm-dd do input date pra objeto Date
function parseDataInput(valor: string): Date | null {
  // Espera formato YYYY-MM-DD vindo de <input type="date">
  const partes = valor.split("-");
  if (partes.length !== 3) return null;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
    return null;
  }

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return null;
  }

  return data;
}

export function CadastroCliente({
  agencias,
  onAdicionarCliente,
}: CadastroClienteProps) {
  const [aberto, setAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [nomeSocial, setNomeSocial] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [rg, setRg] = useState("");
  const [dataNascimentoStr, setDataNascimentoStr] = useState("");
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil>("Solteiro");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [rendaAnualStr, setRendaAnualStr] = useState("");
  const [patrimonioStr, setPatrimonioStr] = useState("");
  const [codigoAgenciaStr, setCodigoAgenciaStr] = useState<string>(
    agencias[0] ? String(agencias[0].codigo) : ""
  );

  const [erroValidacao, setErroValidacao] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  // primeira agencia eh selecionada se o state iniciar vazio
  const agenciaSelecionadaId =
    codigoAgenciaStr || (agencias[0] ? String(agencias[0].codigo) : "");

  function limparFormulario() {
    setNome("");
    setNomeSocial("");
    setCpfCnpj("");
    setRg("");
    setDataNascimentoStr("");
    setEstadoCivil("Solteiro");
    setEmail("");
    setEndereco("");
    setRendaAnualStr("");
    setPatrimonioStr("");
    if (agencias[0]) {
      setCodigoAgenciaStr(String(agencias[0].codigo));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroValidacao(null);
    setSucessoMsg(null);

    //validacoes basicas antes de montar o obj Cliente
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroValidacao("Informe o nome completo do cliente.");
      return;
    }

    const digitosCpfCnpj = apenasDigitos(cpfCnpj);
    if (digitosCpfCnpj.length !== 11 && digitosCpfCnpj.length !== 14) {
      setErroValidacao("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
      return;
    }

    const dataNasc = parseDataInput(dataNascimentoStr);
    if (!dataNasc) {
      setErroValidacao("Informe uma data de nascimento válida.");
      return;
    }

    const emailLimpo = email.trim();
    if (!emailLimpo || !emailLimpo.includes("@")) {
      setErroValidacao("Informe um e-mail válido.");
      return;
    }

    const enderecoLimpo = endereco.trim();
    if (!enderecoLimpo) {
      setErroValidacao("Informe o endereço do cliente.");
      return;
    }

    const rendaAnual = Number(rendaAnualStr);
    if (rendaAnualStr.trim() === "" || Number.isNaN(rendaAnual) || rendaAnual < 0) {
      setErroValidacao("Informe uma renda anual válida (zero ou maior).");
      return;
    }

    const patrimonio = Number(patrimonioStr);
    if (patrimonioStr.trim() === "" || Number.isNaN(patrimonio) || patrimonio < 0) {
      setErroValidacao("Informe um patrimônio válido (zero ou maior).");
      return;
    }

    const codigoAgencia = Number(agenciaSelecionadaId);
    if (!Number.isFinite(codigoAgencia) || codigoAgencia <= 0) {
      setErroValidacao("Selecione uma agência válida.");
      return;
    }

    //monta o obj de acordo com a interface Cliente e gera id no front
    const novoCliente: Cliente = {
      id: `CLI-MEM-${Date.now()}`,
      cpfCnpj: digitosCpfCnpj,
      ...(rg.trim() ? { rg: rg.trim() } : {}),
      dataNascimento: dataNasc,
      nome: nomeLimpo,
      ...(nomeSocial.trim() ? { nomeSocial: nomeSocial.trim() } : {}),
      email: emailLimpo,
      endereco: enderecoLimpo,
      rendaAnual,
      patrimonio,
      estadoCivil,
      codigoAgencia,
    };

    onAdicionarCliente(novoCliente);
    limparFormulario();
    setSucessoMsg(
      `Cliente "${novoCliente.nomeSocial || novoCliente.nome}" cadastrado em memória (visível até recarregar a página).`
    );
  }

  return (
    <section className="mb-4" aria-label="Cadastro de novo cliente">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          aria-expanded={aberto}
          onClick={() => {
            setAberto((prev) => !prev);
            setErroValidacao(null);
          }}
        >
          {aberto ? "Fechar formulário de cadastro" : "+ Novo cliente (em memória)"}
        </button>

        {sucessoMsg && (
          <span className="text-success small" role="status">
            {sucessoMsg}
          </span>
        )}
      </div>

      {aberto && (
        <div className="card mt-3 shadow-sm">
          <div className="card-header bg-dark text-white border-bottom">
            <h2 className="h5 mb-0">Cadastrar Novo Cliente</h2>
          </div>

          <form className="card-body" onSubmit={handleSubmit} noValidate>
            {erroValidacao && (
              <div className="alert alert-danger" role="alert">
                {erroValidacao}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label htmlFor="cad-nome" className="form-label">
                  Nome completo *
                </label>
                <input
                  id="cad-nome"
                  type="text"
                  className="form-control"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Mariana Silva"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cad-nome-social" className="form-label">
                  Nome social (opcional)
                </label>
                <input
                  id="cad-nome-social"
                  type="text"
                  className="form-control"
                  value={nomeSocial}
                  onChange={(e) => setNomeSocial(e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-cpf-cnpj" className="form-label">
                  CPF ou CNPJ *
                </label>
                <input
                  id="cad-cpf-cnpj"
                  type="text"
                  className="form-control"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  placeholder="Apenas números ou formatado"
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-rg" className="form-label">
                  RG (opcional)
                </label>
                <input
                  id="cad-rg"
                  type="text"
                  className="form-control"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  placeholder="Ex.: 1234567 ES"
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-data-nasc" className="form-label">
                  Data de nascimento *
                </label>
                <input
                  id="cad-data-nasc"
                  type="date"
                  className="form-control"
                  value={dataNascimentoStr}
                  onChange={(e) => setDataNascimentoStr(e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-estado-civil" className="form-label">
                  Estado civil *
                </label>
                <select
                  id="cad-estado-civil"
                  className="form-select"
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value as EstadoCivil)}
                >
                  {ESTADOS_CIVIS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-email" className="form-label">
                  E-mail *
                </label>
                <input
                  id="cad-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label htmlFor="cad-agencia" className="form-label">
                  Agência *
                </label>
                <select
                  id="cad-agencia"
                  className="form-select"
                  value={agenciaSelecionadaId}
                  onChange={(e) => setCodigoAgenciaStr(e.target.value)}
                >
                  {agencias.map((ag) => (
                    <option key={ag.id} value={String(ag.codigo)}>
                      {ag.codigo} - {ag.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label htmlFor="cad-endereco" className="form-label">
                  Endereço *
                </label>
                <input
                  id="cad-endereco"
                  type="text"
                  className="form-control"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro, cidade - UF"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cad-renda" className="form-label">
                  Renda anual (R$) *
                </label>
                <input
                  id="cad-renda"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={rendaAnualStr}
                  onChange={(e) => setRendaAnualStr(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="cad-patrimonio" className="form-label">
                  Patrimônio (R$) *
                </label>
                <input
                  id="cad-patrimonio"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={patrimonioStr}
                  onChange={(e) => setPatrimonioStr(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  limparFormulario();
                  setErroValidacao(null);
                }}
              >
                Limpar campos
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar cliente na lista
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}