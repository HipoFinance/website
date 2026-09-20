---
title: 'Taxas e gas'
description: 'Quanto realmente custa fazer staking e unstake com o Hipo: nenhuma parte do seu staking fica com o protocolo, uma taxa de governança hoje em 0 %, e um adiantamento de gas cuja parte não usada é devolvida.'
---

## O Hipo não fica com nenhuma parte do seu staking

O Hipo não cobra taxa do protocolo sobre o GRAM que você coloca em staking. A única taxa em nível de protocolo é a taxa de governança descrita abaixo; todo o resto ligado a uma transação de staking ou de unstake é gas de rede pago à TON, não receita do Hipo.

## A taxa de governança

O protocolo tem uma taxa de governança sobre as recompensas de validação, definida pela [Hipo DAO](/docs/dao/), atualmente em 0 %. Ela se aplica apenas às recompensas de validação, nunca ao seu GRAM em staking, e enquanto permanecer em 0 % as recompensas chegam integralmente aos holders de hGRAM. Qualquer mudança passaria por uma votação da DAO e fica visível on-chain — veja [O Hipo fica com uma parte das minhas recompensas?](/faq/#does-hipo-take-a-cut-of-my-rewards)

## Adiantamentos de gas e devoluções

Quando você faz staking ou unstake, um pequeno adiantamento de gas é anexado à transação (atualmente 0,1 GRAM); apenas uma fração — na ordem de um centésimo de GRAM — é gasta e o restante é devolvido. Os dois fluxos diferem no momento em que a devolução chega:

- **Depósito**: o adiantamento vai junto com o valor colocado em staking, e a parte não usada volta para a sua carteira pouco depois, como uma transferência de excedente separada.
- **Unstake**: o adiantamento vai junto com a queima dos tokens, e pouco ou nada volta no momento do pedido — o restante não usado é pago junto com o saque final em GRAM.

## Como ler os seus próprios números

Como a devolução do unstake chega junto com o saque, um pagamento bruto de saque superestima um pouco a recompensa pura de staking — ele carrega o gas devolvido. Para medir o retorno real de staking de uma carteira, compense todos os fluxos por ciclo: (depósitos enviados − devoluções de depósito) contra (devoluções no momento do pedido + pagamento do saque). A [página de Recompensas](/rewards/) acompanha as suas recompensas por você.

## De onde vêm os valores atuais

Os preços do gas são definidos pela rede TON e variam com ela, então nenhum número fixo citado em um documento continua correto. O [app do Hipo](/stake/) mostra o adiantamento exato antes de você confirmar. A fonte autoritativa é o getter `get_treasury_fees` da tesouraria, também exposto como a ferramenta `get_fees` do [Hipo MCP Server](/docs/hipo-mcp-server/).

## Custos fora do Hipo

Fazer swap de hGRAM em uma DEX substitui o gas do Hipo pela taxa de swap do pool mais o impacto no preço, e a taxa de conversão vem do pool, não do protocolo. A lista atual de pools está na [página DeFi](/defi/); os trade-offs estão descritos em [Riscos](/docs/risks/).

## Mais no FAQ

- [Quanto custa fazer staking?](/faq/#what-does-it-cost-to-stake)
- [Existe alguma taxa de unstake?](/faq/#are-there-any-unstaking-fees)
