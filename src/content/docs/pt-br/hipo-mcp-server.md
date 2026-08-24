---
title: 'Hipo MCP Server'
description: 'Conecte o Claude, o Cursor ou qualquer cliente de IA compatível com MCP à documentação e aos dados on-chain ao vivo do Hipo.'
---

## O que é o Hipo MCP Server?

O Hipo MCP Server é um pequeno serviço de código aberto que permite que assistentes de IA acessem dados relacionados ao Hipo, incluindo informações sobre o staking de GRAM e outros temas. Ele fala o [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), um padrão aberto para conectar clientes de IA a dados externos, de modo que qualquer cliente compatível com MCP — Claude, Claude Code, Cursor e outros — pode consultar a documentação do Hipo e buscar números on-chain ao vivo em vez de adivinhar de memória.

Depois de conectado, seu assistente consegue responder a perguntas como:

- _Qual é a taxa de conversão atual entre hGRAM e GRAM, e qual APY isso implica?_
- _Quanto GRAM está em staking no Hipo neste momento?_
- _Quando termina a rodada de validação atual e quando meu depósito adiado vai emitir hGRAM?_
- _Qual é o saldo de hGRAM deste endereço e quanto ele vale em GRAM?_
- _Qual taxa de gas devo anexar a um depósito?_

As respostas vêm dos getters dos contratos inteligentes do Hipo na TON, não dos dados de treinamento do modelo, então elas são atuais no momento em que você pergunta.

O servidor é estritamente **somente leitura**. Ele não guarda chaves, não assina nada e não envia mensagens para a blockchain. Ele pode olhar, mas nunca pode mover seus fundos — conectá-lo não é uma forma de alguém fazer staking, unstake ou transferências em seu nome.

## Conectando

### Servidor hospedado (recomendado)

O Hipo mantém uma instância pública. Aponte seu cliente MCP para:

```
https://mcp.hipo.finance/mcp
```

No [Claude Code](https://claude.com/product/claude-code), um comando basta:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Isso registra o servidor para o projeto atual. Para alcançá-lo a partir de todos os projetos, passe `-s user` — `user` aqui é uma palavra-chave literal de escopo, não um espaço reservado para o seu nome de usuário:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

De um jeito ou de outro, use o comando em vez de editar um arquivo de configuração à mão: o Claude Code guarda seus servidores MCP na própria configuração, e um bloco `mcpServers` colocado em `settings.json` é ignorado. Execute `claude mcp list` para confirmar que o servidor está conectado e reinicie o Claude Code depois — os servidores são conectados na inicialização, então um servidor recém-adicionado não fica disponível em uma sessão que já está em execução.

Outros clientes são configurados com um arquivo JSON (Claude Desktop, Cursor e a maioria dos demais) e recebem uma entrada como esta:

```json
{
  "mcpServers": {
    "hipo": {
      "type": "http",
      "url": "https://mcp.hipo.finance/mcp"
    }
  }
}
```

### Rodando localmente

Se você preferir rodar o servidor por conta própria, ele é publicado no npm como [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) e fala stdio. Isso exige Node.js 20 ou mais recente:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

O mesmo conselho vale aqui — adicione-o com o comando, não editando um arquivo à mão. Para outros clientes, a entrada de configuração JSON é:

```json
{
  "mcpServers": {
    "hipo": {
      "command": "npx",
      "args": ["-y", "@hipo-finance/mcp"]
    }
  }
}
```

## Ferramentas

Estas são as perguntas que o servidor consegue responder. Seu cliente de IA escolhe a certa sozinho — você pergunta em linguagem comum.

| Ferramenta           | O que ela retorna                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | A taxa atual entre hGRAM e GRAM, o total de GRAM em staking, a oferta de hGRAM e o APY recente derivado das atualizações de taxa on-chain                             |
| `get_treasury_state` | Totais da tesouraria: TVL em GRAM, oferta de hGRAM, depósitos e unstakes pendentes, participações em rodadas ativas, a flag de parada e os parâmetros de governança   |
| `get_round_timing`   | O tempo das rodadas de validação: limites da rodada atual e da próxima, a janela de participação na eleição e por quanto tempo os valores em staking ficam congelados |
| `get_fees`           | As taxas de gas atuais para depósitos, unstakes e solicitações de empréstimo                                                                                          |
| `get_wallet_status`  | O saldo de hGRAM de um endereço, seu valor em GRAM e quaisquer stakes ou unstakes pendentes                                                                           |
| `get_reward_history` | O histórico de recompensas de staking de GRAM de um endereço por rodada, incluindo o nível no Hipo Club e as recompensas em HPO                                       |
| `get_participation`  | A participação do Hipo em uma rodada de validação: estado, contagem de empréstimos, totais e horário de liberação dos valores em staking                              |
| `get_loan_info`      | O contrato de empréstimo de um tomador por rodada: endereço, estado de implantação, saldo e partes envolvidas                                                         |
| `get_max_punishment` | A punição máxima que o protocolo pode aplicar a um determinado valor em staking de um validador                                                                       |

As quatro primeiras ferramentas não precisam de nenhuma entrada. `get_wallet_status`, `get_reward_history` e `get_loan_info` recebem um endereço da TON — o endereço do próprio dono ou do tomador, não o endereço da carteira de jettons — e `get_max_punishment` recebe um valor em GRAM. `get_participation` e `get_loan_info` também aceitam um horário de início de rodada, mas ele é opcional: se você omiti-lo, elas informam sobre a rodada atual.

Toda resposta traz o mesmo lembrete de que as ferramentas retornam dados ao vivo do protocolo, não aconselhamento financeiro: os valores mudam a cada rodada de validação e nenhum retorno é garantido.

## Recursos de documentação

Além dos dados ao vivo, o servidor expõe os documentos técnicos do Hipo como recursos MCP, buscados em seus locais públicos canônicos para que estejam sempre atualizados:

| Recurso                    | Conteúdo                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | O README do repositório dos contratos inteligentes: resumo do protocolo e endereços dos contratos implantados |
| `hipo://docs/architecture` | Contratos, a máquina de estados da rodada de validação e as invariantes do protocolo                          |
| `hipo://docs/integration`  | Esquemas de mensagens e o guia de integração para carteiras e outros protocolos                               |
| `hipo://docs/schema`       | Os esquemas TL-B completos de todos os contratos do Hipo                                                      |
| `hipo://docs/knowledge`    | A base de conhecimento curada do Hipo ([llms.txt](https://hipo.finance/llms.txt))                             |

## Exemplo

Uma chamada a `get_exchange_rate` retorna JSON simples. Os números mudam a cada rodada, então trate-os como um formato, não como valores atuais:

```json
{
  "oneHgramInGram": "1.143623345",
  "oneGramInHgram": "0.874413769",
  "totalCoinsGram": "2501952.200844389",
  "totalTokensHgram": "2187741.455006677",
  "recentApy": "15.59%",
  "apyNote": "APY is derived from the last on-chain rate update (current_rate / previous_rate compounded to a year). Rewards accrue in the exchange rate: hGRAM becomes worth more GRAM over time; there is no separate claim.",
  "disclaimer": "Live protocol data, not financial advice. Values change every validation round and no returns are guaranteed."
}
```

O servidor nunca reimplementa a matemática do protocolo. Cada número acima vem de um getter de contrato, e o repositório de contratos é a fonte da verdade para os endereços implantados.

## Auto-hospedagem

O servidor tem licença MIT e fica em [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Ele traz dois transportes — `stdio` para clientes locais e HTTP com streaming para uma implantação hospedada — e um Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Toda a configuração é opcional; os padrões apontam para a mainnet (rede principal) através da API pública do toncenter.

| Variável de ambiente       | Padrão                                 | Finalidade                                                                                                                 |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` ou `testnet`                                                                                                     |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Endpoint da API HTTP da TON                                                                                                |
| `TONCENTER_API_KEY`        | _(nenhum)_                             | Chave de API do toncenter; sem ela vale o limite de requisições público, e as chamadas limitadas são repetidas com backoff |
| `TONCENTER_API_KEY_FILE`   | _(nenhum)_                             | Caminho de um arquivo que contém a chave de API, como um segredo do Docker; tem precedência sobre `TONCENTER_API_KEY`      |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Por quanto tempo o estado da tesouraria, os horários e as taxas ficam em cache entre chamadas de ferramentas               |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Por quanto tempo os recursos de documentação ficam em cache                                                                |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | URL base da API de recompensas do Hipo; deixe-a vazia para desativar `get_reward_history`                                  |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Somente para o transporte HTTP                                                                                             |
