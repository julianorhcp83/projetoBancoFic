import Papa from "papaparse";
import{
    normalizarAgencias, normalizarClientes, normalizarContas
} from "./bankNormalizer";
import type {Agencia, Cliente, Conta} from "../types/bank";

/// link das planilhas em CSV
const URLs = {
    clientes: "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=clientes",
    contas: "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=contas",
    agencias: "https://docs.google.com/spreadsheets/d/1LkyaeCgiyaIN1IxXnbZQPmVMIcht3PIxMDUXHsvczK0/gviz/tq?tqx=out:csv&sheet=agencias"
    };

//busca o CSV em tempo de execucao usando fetch e response.text()
async function fetchCSV(url: string): Promise<Record<string, string>[]>{
    const response = await fetch(url);

    if(!response.ok){
        throw new Error(`Falha ao buscar CSV (${response.status})`);
    }

    const csvTexto = await response.text();

    //converte o texto CSV em obj usando a primeira linha como cabecalho
    const parsed = Papa.parse<Record<string, string>>(csvTexto, {
        header: true,
        skipEmptyLines: true,
    });

    return parsed.data;
}

export interface DadosBanco {
    clientes: Cliente[];
    contas: Conta[];
    agencias: Agencia[];
}

//baixa as 3 tabelas em paralelo e devolve tudo tipado e normalizado
export async function fetchDadosBanco(): Promise<DadosBanco>{
    const [clientesB, contasB, agenciasB] = await Promise.all([
        fetchCSV(URLs.clientes),
        fetchCSV(URLs.contas),
        fetchCSV(URLs.agencias),
    ]);

    return { 
        clientes: normalizarClientes(clientesB),
        contas: normalizarContas(contasB),
        agencias: normalizarAgencias(agenciasB),
    };
}