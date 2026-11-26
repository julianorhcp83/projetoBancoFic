import { useEffect, useState } from "react";
import { CadastroCliente } from "./components/CadastroCliente";
import { ClienteLista } from "./components/ClienteLista";
import { fetchDadosBanco, type DadosBanco } from "./services/bankApi";
import type { Cliente } from "./types/bank";

function App() {
  const [dados, setDados] = useState<DadosBanco | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  useEffect(() => {
    // flag p evitar att estado se o componente desmontar no meio do fetch
    let ativo = true;

    fetchDadosBanco()
      .then((resultado) => {
        if (ativo) {
          setDados(resultado);
          setErro(null);
        }
      })
      .catch((err: unknown) => {
        if (ativo) {
          const mensagem =
            err instanceof Error ? err.message : "Erro inesperado ao carregar dados.";
          setErro(mensagem);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);
  // adiciona um novo cliente apenas na memoria (some com F5)
  function AddCliente(novoCliente: Cliente) {
    setDados((atual) => {
      if (!atual) return atual;
      return {
        ...atual,
        clientes: [novoCliente, ...atual.clientes],
      };
    });
    setClienteSelecionado(novoCliente);
  }

  return (
    <main className="container py-4">
      <h1 className="mb-4">Consulta Bancária — FicBank</h1>

      {carregando && (
        <div className="d-flex align-items-center gap-2 my-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status" />
          <p className="mb-0">Carregando dados da planilha...</p>
        </div>
      )}

      {erro && (
        <div role="alert" className="alert alert-danger">
          <strong>Erro ao carregar dados:</strong> {erro}
        </div>
      )}

      {!carregando && !erro && dados && (
        <>
          <CadastroCliente
            agencias={dados.agencias}
            onAdicionarCliente={AddCliente}
          />

          <ClienteLista
            clientes={dados.clientes}
            contas={dados.contas}
            agencias={dados.agencias}
            clienteSelecionadoId={clienteSelecionado?.id ?? null}
            onSelecionarCliente={(cliente) => setClienteSelecionado(cliente)}
            onFecharDetalhes={() => setClienteSelecionado(null)}
          />
        </>
      )}
    </main>
  );
}

export default App;