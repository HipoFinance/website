---
title: 'Riscos'
description: 'Os riscos de fazer staking de GRAM com o Hipo — contrato inteligente, validador, liquidez, variação das recompensas e phishing — e o que o protocolo faz em relação a cada um.'
---

Staking e DeFi sempre envolvem risco, e o Hipo não garante retornos. Esta página lista os riscos de fazer staking de GRAM com o Hipo, o que o protocolo faz em relação a cada um e o que você mesmo pode fazer.

## Risco de contrato inteligente

Bugs ou vulnerabilidades em contratos inteligentes podem afetar os fundos. Os contratos do Hipo são de código aberto e passaram por quatro auditorias independentes — Quantstamp (abril de 2025) e ProgramCrafter (março de 2024) nos contratos v2, TonTech e Daniil Sedov (outubro de 2023) na v1 — e são escritos em FunC com Blueprint, com um conjunto de testes público. Verifique você mesmo os endereços com os quais interage, comparando com [Contratos e auditorias](/docs/contracts-and-audits/).

## Risco de validador e de staking

As recompensas de staking dependem de os validadores participarem corretamente das rodadas de validação da TON. Antes de poder tomar emprestado o GRAM em staking, um validador precisa bloquear uma garantia que cubra a penalidade máxima de slashing da rodada mais a recompensa que prometeu, de modo que uma penalidade sai dessa garantia, e não do GRAM em staking. Um desempenho abaixo do esperado ainda pode aparecer como uma recompensa menor naquela rodada — veja [Validadores e o marketplace](/docs/introduction/how-does-hipo-work/validators/) e [O que acontece se um validador tiver desempenho abaixo do esperado?](/faq/#what-happens-if-a-validator-underperforms)

## Risco de liquidez

Um unstake Instantâneo só é concluído quando o protocolo tem GRAM livre suficiente para cobri-lo; o [app](/unstake/) mostra o máximo disponível no momento. Um unstake Completo sempre se concretiza, mas é liquidado depois da rodada de validação atual — no pior caso, a espera pode chegar a cerca de 36 horas. Sair por uma [DEX](/defi/) depende da liquidez do pool e traz impacto no preço — veja [Por que o unstake instantâneo às vezes fica indisponível?](/faq/#why-is-instant-unstaking-sometimes-unavailable)

## Variação das recompensas

A taxa de recompensas muda ao longo do tempo conforme as ofertas dos validadores e as condições da rede, e nenhum retorno fixo é prometido. Os números ao vivo e o histórico estão na [página Stats](/stats/), nunca nesta página.

## Risco de phishing

Use apenas links oficiais do Hipo e confira cada solicitação da carteira antes de assinar. Os canais oficiais e os endereços dos contratos estão listados em [Atenção ao phishing](/docs/security/phishing-awareness-and-prevention/) e em [Contratos e auditorias](/docs/contracts-and-audits/).

## O que o Hipo não promete

- Nada de retornos fixos — as recompensas variam a cada rodada de validação.
- Nada de staking sem risco — os riscos acima sempre se aplicam.
- Nada de saque nativo instantâneo em todos os casos — o Instantâneo depende da liquidez do protocolo.

## Mais no FAQ

- [Posso perder meus fundos?](/faq/#can-i-lose-my-funds)
- [O Hipo é seguro?](/faq/#is-hipo-safe)
