---
title: 'Staking sem o app'
description: 'Faça staking e unstake com o Hipo usando transferências comuns de carteira — para carteiras multisig, frias e outras que não conseguem assinar transações de dapp.'
---

## Quando você precisa disso

Esta página é para carteiras que não conseguem assinar transações de dapp — carteiras multisig e algumas carteiras frias. Todo mundo mais deve usar o [app do Hipo](/stake/), que é mais barato e mostra a estimativa exata antes de você confirmar. Quando uma carteira multisig se conecta ao app do Hipo, o app mostra estas mesmas instruções com o endereço da tesouraria pronto para copiar.

## Fazer staking — o comentário "d"

Envie o GRAM que você quer colocar em staking **mais 0,1 GRAM** como pré-pagamento de gas para a tesouraria do Hipo:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Defina o comentário de texto da transação exatamente como:

```
d
```

O comentário precisa estar em minúsculas, em texto simples e sem criptografia. O pré-pagamento é arredondado para cima com folga — só uma fração é gasta, e a parte não usada é devolvida (veja [Taxas e gas](/docs/fees-and-gas/)). O hGRAM é enviado de volta para o mesmo endereço de onde veio a transferência.

## Fazer unstake de tudo — o comentário "w"

Envie 0,1 GRAM para o mesmo endereço da tesouraria com o comentário de texto:

```
w
```

Isso faz unstake do saldo **inteiro** de hGRAM daquela carteira — não existe valor parcial. O unstake é liquidado pelas regras normais do protocolo, então vale o prazo do unstake Completo — veja [Como funciona o unstake](/docs/introduction/how-does-hipo-work/unstaking/) e [Quanto tempo leva o unstake?](/faq/#how-long-does-unstaking-take)

## Queimar hGRAM pelo minter

Você também pode resgatar GRAM diretamente queimando hGRAM em [minter.ton.org](https://minter.ton.org/), usando o endereço do master do hGRAM (Parent):

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Depois da queima, você recebe GRAM pela taxa de resgate atual. O endereço do parent pode mudar em atualizações do protocolo — confira antes em [Contratos e auditorias](/docs/contracts-and-audits/).

## Ou faça swap em uma DEX

Existem pools de hGRAM na DeDust, na STON.fi, na TONCO, na GroypFi e na swap.coffee — a lista atual está na [página de DeFi](/defi/). Há taxas de swap e impacto de preço.

## Antes de enviar

- Confira o endereço da tesouraria em [Contratos e auditorias](/docs/contracts-and-audits/) — nunca confie em um endereço vindo de mensagem encaminhada; veja [Conscientização sobre phishing](/docs/security/phishing-awareness-and-prevention/).
- O comentário precisa ser texto simples, exatamente `d` ou `w`.
- Uma transferência sem comentário, ou com o comentário errado, não é um pedido de staking nem de unstake.

## Mais no FAQ

- [Posso fazer staking com uma carteira multisig ou fria?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Taxas e gas](/docs/fees-and-gas/)
