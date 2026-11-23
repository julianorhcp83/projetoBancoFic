# Consulta Bancária — Banestes

Aplicação web desenvolvida em React, TypeScript e Vite para buscar, normalizar e consultar dados de clientes, contas e agências a partir de planilhas públicas do Google Sheets exportadas em CSV.

## Como o projeto funciona

Os dados vêm de três abas de planilha (`clientes`, `contas` e `agencias`) via `fetch` e são lidos com o PapaParse. Como os dados brutos da planilha podem ter variações de formatação, espaços extras ou formatos diferentes, o projeto separa o fluxo em etapas:

- **Tipagem (`src/types/`):** define as estruturas de `Cliente`, `Conta` e `Agencia`.
- **Busca e normalização (`src/services/`):** baixa os CSVs, faz o *parse* e padroniza campos como datas, valores numéricos, estado civil e tipo de conta.
- **Formatação (`src/utils/`):** ajuda a formatar CPF/CNPJ, datas (`DD/MM/AAAA`), valores em moeda (`R$`) e limpar caracteres não numéricos na hora de buscar.
- **Interface (`src/components/` e `src/App.tsx`):** exibe a listagem resumida com busca por nome ou CPF/CNPJ, filtros (como estado civil e agência), paginação de até **10 clientes por página** e o painel de detalhes com os dados completos do cliente, sua agência e suas contas.

## Tecnologias usadas

- React + TypeScript
- Vite
- PapaParse

## Como rodar o projeto localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Para gerar o build de produção e conferir se está tudo compilando sem erros:
   ```bash
   npm run build
   ```