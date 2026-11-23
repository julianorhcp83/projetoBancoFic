import { useEffect, useState } from "react";
import { ClienteDetalhes } from "./components/ClienteDetalhes";
import { ClienteLista } from "./components/ClienteLista";
import { fetchDadosBanco, type DadosBanco } from "./services/bankApi";
import type { Cliente } from "./types/bank";

function App() {
  const [dados, setDados] = useState<DadosBanco | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  useEffect(() => {
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

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Consulta Bancária — Banestes</h1>

      {carregando && <p>Carregando dados da planilha...</p>}

      {erro && (
        <div role="alert" style={{ padding: "1rem", border: "1px solid red", borderRadius: "6px" }}>
          <strong>Erro ao carregar dados:</strong> {erro}
        </div>
      )}

      {!carregando && !erro && dados && (
        <>
          <ClienteLista
            clientes={dados.clientes}
            agencias={dados.agencias}
            clienteSelecionadoId={clienteSelecionado?.id ?? null}
            onSelecionarCliente={(cliente) => setClienteSelecionado(cliente)}
          />

          {clienteSelecionado && (
            <ClienteDetalhes
              cliente={clienteSelecionado}
              contas={dados.contas}
              agencias={dados.agencias}
              onFechar={() => setClienteSelecionado(null)}
            />
          )}
        </>
      )}
    </main>
  );
}

export default App;