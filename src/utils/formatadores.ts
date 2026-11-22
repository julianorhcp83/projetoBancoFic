export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}


export function formatarCpfCnpj(valor: string): string {
  const digitos = apenasDigitos(valor);

  if (digitos.length === 11) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (digitos.length === 14) {
    return digitos.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return valor;
}


export function formatarData(data: Date): string {
  if (!(data instanceof Date) || Number.isNaN(data.getTime()) || data.getTime() === 0) {
    return "Não informada";
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}


export function formatarMoeda(valor: number): string {
  const seguro = Number.isFinite(valor) ? valor : 0;

  return seguro.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}