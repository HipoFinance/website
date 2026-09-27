---
title: 'Hipo Fund — tesouraria on-chain'
description: 'O Hipo Fund — uma tesouraria on-chain que dá lastro ao token HPO.'
---

<figure><img src="/docs/images/hipo-fund-1.jpg" alt="Banner promocional com o texto 'HipoFund.ton', um saco de dinheiro cercado por ícones de Bitcoin, Tether, HPO e TON e um gráfico de crescimento em alta."></figure>

## 📌 O que é o Hipo Fund

O Hipo Fund é a tesouraria de investimento de longo prazo do Hipo. Ele guarda os recursos das vendas de tokens
HPO e dos resgates de temporada do Hipo Club, e é mantido separado do orçamento operacional do Hipo.

A ideia foi emprestada do fundo do petróleo da Noruega: em vez de gastar a receita conforme ela chega, separar
uma parte e administrá-la no longo prazo. O Hipo Fund existe para construir valor duradouro por trás do HPO,
não para cobrir custos do dia a dia.

Todos os ativos que ele guarda ficam on-chain e podem ser verificados por qualquer pessoa.

---

## 📊 Situação atual

| Indicador                                         | Valor                                                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Capital inicial (18 de abril de 2025)**         | US$ 186.963,96                                                                                          |
| **Capital aportado desde então**                  | ≈ US$ 37.092 (resgates da Temporada 2 e da Temporada 3)                                                 |
| **Último valor informado (24 de agosto de 2026)** | US$ 98.776,51                                                                                           |
| **Retorno desde o início (Modified Dietz)**       | −58,4 %                                                                                                 |
| **GRAM no mesmo período**                         | −49,8 %                                                                                                 |
| **Último relatório**                              | [relatório de agosto de 2026](/docs/hipo-fund/quarterly-report-august-24-2026/)                         |
| **Política de Investimento**                      | [Ratificada por votação da DAO em 18 de setembro de 2026](/docs/hipo-fund/investment-policy-statement/) |

O fundo está abaixo do seu capital inicial, principalmente por causa da queda do preço do GRAM sobre uma
carteira que, no primeiro ano, era fortemente atrelada ao GRAM. A contabilidade completa está no relatório de
agosto de 2026.

A [**Política de Investimento**](/docs/hipo-fund/investment-policy-statement/) (Investment Policy Statement) define
alocações-alvo, limites de risco, requisitos de liquidez e regras de rebalanceamento. Os holders de HPO a
ratificaram por votação da DAO em 18 de setembro de 2026, e o Hipo Fund é gerido sob ela.

---

## 🏦 Carteiras

Todos os ativos do Hipo Fund em repouso ficam em uma multisig 2 de 3. São três signatários, todos integrantes da equipe
do Hipo, os mesmos três em todas as carteiras.

| Blockchain   | Guarda                               | Endereço                                                                                                                                                         |
| ------------ | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TON**      | hGRAM, HPO, USDT, GRAM para gas      | [`EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr`](https://tonviewer.com/EQDa2GcC9KwiWIL6jmrGp2ulhC7hnNo8DUunEtkMKe4r_Dnr) (hipofund.ton)                      |
| **Ethereum** | USDC e posições de empréstimo (Aave) | [`0xaAf440f8E7E45Bf63a19fE29107E240B9844a173`](https://etherscan.io/address/0xaAf440f8E7E45Bf63a19fE29107E240B9844a173)                                          |
| **Bitcoin**  | BTC                                  | [`bc1qpk3g8saskt89acwa976hvzjv8jrcqdn0d2lpf9l9a5ksrj0akfnsxneedc`](https://mempool.space/address/bc1qpk3g8saskt89acwa976hvzjv8jrcqdn0d2lpf9l9a5ksrj0akfnsxneedc) |

A carteira na Ethereum é uma Safe; a mesma Safe, com o mesmo endereço e os mesmos signatários, também existe na Base.

O fundo passou para uma nova carteira de Bitcoin em 27 de setembro de 2026, depois que uma das três chaves da carteira
anterior se revelou incorreta. Os endereços da carteira anterior agora estão vazios:
[`bc1qzuwj…qk2w`](https://mempool.space/address/bc1qzuwj3wm88qhnpw7zw4kyk0jdmph0v7h7m7z2dstttx4mzm7hm4es43qk2w),
[`bc1qqz9m…g3jp`](https://mempool.space/address/bc1qqz9mds6pfak0sg8l79h28nf6cwvaasl08zh6xc8jwl3sthmtzhgqfgg3jp) e
[`bc1qce5f…c3w7`](https://mempool.space/address/bc1qce5ftgna5g34kaup44ucvlmu5wtj9cyxuf507n2l8apnxrma9rcqdec3w7). Uma
carteira de Bitcoin pode gerar um endereço novo para cada depósito, então, se os BTC do fundo algum dia estiverem em mais
de um endereço, cada relatório trimestral lista todos eles.

A carteira original de assinatura única do fundo —
[`UQBwGlrp…DdLfG`](https://tonviewer.com/UQBwGlrpvnLzWM1qOXW2DPe99mg1W5pcf2R_uxSeDiVDdLfG) — foi esvaziada em setembro de
2026 e não guarda ativos do fundo em repouso. Ela não é um local de custódia, mas pode servir de passagem breve quando
ativos são movidos entre blockchains nos termos da
[Seção 4.1](/docs/hipo-fund/investment-policy-statement/#41-movimentação-de-ativos-entre-blockchains) da Política de
Investimento; enquanto passam por ela, uma única chave os controla. Ela também continua sendo a proponente da multisig
na TON: pode propor uma transação, mas executá-la ainda exige dois dos três signatários.

:::note[Uma observação sobre formatos de endereço]
A TON mostra a mesma carteira em duas formas — bounceable (`EQ…`) e non-bounceable (`UQ…`). Os quatro últimos
caracteres são diferentes, mas a conta é idêntica.
:::

---

## 💵 Como o Hipo Fund é financiado

O Hipo Fund nunca recebeu nenhuma alocação da tokenomics do HPO. Seu capital vem de:

- **Recursos das vendas de tokens HPO**, incluindo o ILO e acordos OTC com investidores estratégicos
- **Resgates de temporada do Hipo Club** (Temporadas 2 e 3). Desde a Temporada 4, as recompensas em HPO vão
  direto para os holders de hGRAM, então não existe janela de resgate por temporada nem novos resgates desse
  tipo
- **Recompensas de staking do hGRAM** — atualmente a única fonte de receita ativa do fundo
- **Participação nos lucros sobre o HPO que o fundo guarda**, quando a partilha de receita do protocolo está
  ativa. A taxa de staking está em 0 % desde 6 de junho de 2026, então nenhuma distribuição está sendo feita
  no momento

Todo o HPO em posse do fundo foi comprado no mercado aberto.

---

## 💰 Relatório de abertura — 18 de abril de 2025

- **Capital inicial:** US$ 186.963,96
- **Data de início dos relatórios:** 18 de abril de 2025

### 🔸 Alocação inicial da carteira

| Ativo              | Quantidade   | Alocação  | Valor (USD)        | Observações                                      |
| ------------------ | ------------ | --------- | ------------------ | ------------------------------------------------ |
| hGRAM              | 34.955,22    | 59,59 %   | US$ 111.405,91     | GRAM em staking                                  |
| HPO                | 6.754.307,59 | 38,64 %   | US$ 72.238,04      | Token de governança e de participação nos lucros |
| Stablecoins (USDT) | 3.304,14     | 1,77 %    | US$ 3.304,14       | Preservação de capital e reserva livre           |
| GRAM               | 5,30         | 0,01 %    | US$ 15,87          | Exposição direta a GRAM                          |
| **Total**          |              | **100 %** | **US$ 186.963,96** |                                                  |

_As porcentagens são arredondadas para duas casas decimais e podem não somar exatamente 100._

:::note[Correção, 29 de agosto de 2026]
A avaliação do HPO nesta tabela foi publicada antes como US$ 15.000, o que era um erro — as quatro linhas não
somavam o capital inicial informado. O HPO agora aparece com US$ 72.238,04, seu valor de mercado em 18 de
abril de 2025 (US$ 0,010695 por HPO), e as quatro porcentagens de alocação foram recalculadas a partir dos
valores em USD para que a tabela feche em US$ 186.963,96. As porcentagens publicadas antes eram 59,28 %
(hGRAM), 1,76 % (USDT), 38,95 % (HPO) e 0,01 % (GRAM). A tabela de comparação do
[relatório de agosto de 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) foi corrigida para bater com
esta. Nenhum saldo mudou.
:::

---

## 🔒 Como o fundo é gerido

**Totalmente on-chain e verificável**\
Todos os ativos em repouso ficam nas carteiras multisig acima e podem ser conferidos por qualquer pessoa a qualquer
momento.
O fundo só guarda ativos que podem ser acompanhados de forma transparente on-chain.

**Relatórios baseados em snapshot**\
Os relatórios de agosto de 2026 em diante são gerados pelo
[`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
que lê todos os saldos de um único bloco da masterchain da TON e lista esse bloco, a taxa de conversão do
hGRAM e cada preço usado nas Observações do relatório. Qualquer leitor pode rodar o script de novo e
reproduzir as tabelas.

Os relatórios de [agosto de 2025](/docs/hipo-fund/quarterly-report-august-1-2025/) e de
[dezembro de 2025](/docs/hipo-fund/quarterly-report-december-18-2025/) são anteriores ao script e foram
montados à mão. Desde então, seus saldos foram conferidos contra a blockchain e batem; suas avaliações usaram
convenções de preço diferentes, o que está registrado no relatório de agosto de 2026.

**Relatórios periódicos**\
O Hipo Fund publica um relatório a cada trimestre. Todo relatório traz o desempenho desde o início e um
benchmark. O próximo relatório está previsto para **dezembro de 2026**.

**Decisões anunciadas**\
Mudanças relevantes na carteira são anunciadas nos canais oficiais do Hipo, e mudanças na estratégia do fundo
vão a votação na DAO.

**Crescimento com controle de risco**\
O fundo é gerido para preservação de capital no longo prazo e crescimento sustentável. As alocações-alvo, os
limites de concentração, os requisitos de liquidez e as regras de rebalanceamento estão definidos na Política
de Investimento.

**Governança**\
Os holders de HPO votam sobre os rumos do Hipo Fund pela [DAO do Hipo](/docs/dao/) no
[ton.vote](https://ton.vote/EQBjc5x7yY4XaB4br1n2fOfw3XwrNN5IckvkQHb4vTH8YgTv). A Política de Investimento,
ratificada em 18 de setembro de 2026, é a primeira política do Hipo Fund adotada por votação vinculante. A execução dentro de uma política aprovada
fica com os signatários da multisig; mudanças na política vão para a DAO.

---

## ⚠️ Riscos

O Hipo Fund é uma tesouraria cripto e seu valor oscila com o mercado. Os principais riscos:

- **Risco de mercado.** As posições do fundo que não são stablecoins estão expostas aos preços do GRAM e do
  HPO.
- **Risco de concentração.** Os ativos do fundo estão concentrados no ecossistema da TON e no token do próprio
  Hipo.
- **Risco de liquidez.** A posição em HPO é grande em relação à liquidez do HPO no mercado. O valor informado
  é o preço de mercado multiplicado pelo saldo; não é uma afirmação de que a posição inteira poderia ser
  vendida por esse preço.
- **Risco de custódia.** O fundo depende dos signatários da multisig e das suas chaves. Um limiar de 2 de 3 elimina
  qualquer ponto único de falha, mas não o risco de duas chaves serem perdidas ou comprometidas ao mesmo tempo.
- **Risco de contrato inteligente.** Ativos mantidos em protocolos DeFi, incluindo o hGRAM, carregam o risco
  de falha de um contrato.

Esses riscos são geridos, não eliminados. A Política de Investimento define limites para cada um deles.

---

## 💜 Para a comunidade Hipo

O Hipo Fund pertence à comunidade. Seu crescimento sustenta o valor e a longevidade do HPO e beneficia cada
holder de HPO. Temos compromisso com relatórios periódicos e transparentes e com governança aberta.

Quer sugerir estratégias, ferramentas DeFi ou projetos da TON para o fundo? Participe da conversa no
[@hipo_chat no Telegram](https://t.me/hipo_chat).
