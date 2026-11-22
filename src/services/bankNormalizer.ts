import type { Agencia, Cliente, Conta, EstadoCivil, t_Conta} from "../types/bank";

type linhaCSV = Record<string, string | undefined>;

function mapearCampos(linha: linhaCSV): Record<string, string>{
    const result: Record<string, string> = {};

    for(const [chave, valor] of Object.entries(linha)){
        const chaveLimpa = chave.trim().toLowerCase();
        const valorLimpo = (valor ?? "").trim();

        if(!(chaveLimpa in result) && valorLimpo !== ""){
            result[chaveLimpa] = valorLimpo;
        }
    }

    return result;
}

function pegarCampo(campos: Record<string, string>, chavesPossiveis: string[]): string{
    for (const chave of chavesPossiveis){
        const achou = campos[chave.toLowerCase()];
        if(achou !== undefined && achou !== ""){
            return achou;
        }
    }

    return "";
}

function parseNumero(valor: string): number {
    if(!valor) return 0;

    let limpo = valor.replace(/[R$\s]/g, "");

    if(limpo.includes(",") && limpo.includes(".")){
        limpo = limpo.replace(/\./g, "").replace(",", ".");
    }else if (limpo.includes(",")){
        limpo = limpo.replace(",", ".");
    }

    const nmr = Number(limpo);
    return Number.isNaN(nmr) ? 0 : nmr;

}

function parseData(valor: string): Date {
    if(!valor) return new Date(0);

    const partesBr = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(partesBr) {
        const dia = Number(partesBr[1]);
        const mes = Number(partesBr[2]) - 1;
        const ano = Number(partesBr[3]);
        return new Date(ano, mes, dia);
    }

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? new Date(0) : data;
}

function normalizarEstadoCivil(valor: string): EstadoCivil {
  const texto = valor.toLowerCase();

  if (texto.startsWith("casad")) return "Casado";
  if (texto.startsWith("viúv") || texto.startsWith("viuv")) return "Viuvo";
  if (texto.startsWith("divorci")) return "Divorciado";
  return "Solteiro";
}

function normalizarTipoConta(valor: string): t_Conta {
  const texto = valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto.includes("poup")) return "poupanca";
  return "corrente";
}

export function normalizarClientes(linhas: linhaCSV[]): Cliente[] {
  return linhas
    .map((linha, indice) => {
      const c = mapearCampos(linha);
      const id = pegarCampo(c, ["id"]) || `cliente-${indice + 1}`;
      const cpfCnpj = pegarCampo(c, ["cpfcnpj", "cpf_cnpj", "cpf/cnpj", "cpf"]);
      const nome = pegarCampo(c, ["nome", "nomecompleto", "nome_completo"]);

      if (!nome && !cpfCnpj) return null;

      const rg = pegarCampo(c, ["rg"]);
      const nomeSocial = pegarCampo(c, ["nomesocial", "nome_social"]);

      const cliente: Cliente = {
        id,
        cpfCnpj,
        ...(rg ? { rg } : {}),
        dataNascimento: parseData(
          pegarCampo(c, ["datanascimento", "data_nascimento", "nascimento"])
        ),
        nome,
        ...(nomeSocial ? { nomeSocial } : {}),
        email: pegarCampo(c, ["email", "e-mail"]),
        endereco: pegarCampo(c, ["endereco", "endereço"]),
        rendaAnual: parseNumero(pegarCampo(c, ["rendaanual", "renda_anual", "renda"])),
        patrimonio: parseNumero(pegarCampo(c, ["patrimonio", "patrimônio"])),
        estadoCivil: normalizarEstadoCivil(
          pegarCampo(c, ["estadocivil", "estado_civil"])
        ),
        codigoAgencia: Math.trunc(
          parseNumero(pegarCampo(c, ["codigoagencia", "codigo_agencia", "agencia"]))
        ),
      };

      return cliente;
    })
    .filter((item): item is Cliente => item !== null);
}

export function normalizarContas(linhas: linhaCSV[]): Conta[] {
  return linhas
    .map((linha, indice) => {
      const c = mapearCampos(linha);
      const id = pegarCampo(c, ["id"]) || `conta-${indice + 1}`;
      const cpfCnpjCliente = pegarCampo(c, [
        "cpfcnpjcliente",
        "cpf_cnpj_cliente",
        "cpfcnpj",
        "cpf_cnpj",
      ]);

      if (!cpfCnpjCliente && !pegarCampo(c, ["id"])) return null;

      const conta: Conta = {
        id,
        cpfCnpjCliente,
        tipo: normalizarTipoConta(pegarCampo(c, ["tipo", "tipoconta", "tipo_conta"])),
        saldo: parseNumero(pegarCampo(c, ["saldo"])),
        limiteCredito: parseNumero(
          pegarCampo(c, ["limitecredito", "limite_credito", "limite"])
        ),
        creditoDisponivel: parseNumero(
          pegarCampo(c, ["creditodisponivel", "credito_disponivel"])
        ),
      };

      return conta;
    })
    .filter((item): item is Conta => item !== null);
}

export function normalizarAgencias(linhas: linhaCSV[]): Agencia[] {
  return linhas
    .map((linha, indice) => {
      const c = mapearCampos(linha);
      const id = pegarCampo(c, ["id"]) || `agencia-${indice + 1}`;
      const nome = pegarCampo(c, ["nome"]);

      if (!nome && !pegarCampo(c, ["codigo", "código"])) return null;

      const agencia: Agencia = {
        id,
        codigo: Math.trunc(
          parseNumero(pegarCampo(c, ["codigo", "código", "codigoagencia"]))
        ),
        nome,
        endereco: pegarCampo(c, ["endereco", "endereço"]),
      };

      return agencia;
    })
    .filter((item): item is Agencia => item !== null);
}