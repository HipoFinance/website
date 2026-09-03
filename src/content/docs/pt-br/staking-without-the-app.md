---
title: 'Staking sem o app'
description: 'Faça staking e unstake com o Hipo usando transferências comuns de carteira — para carteiras multisig, frias e outras que não conseguem assinar transações de dapp.'
---

## Quando você precisa disso

Esta página é para carteiras que não conseguem assinar transações de dapp — carteiras multisig e algumas carteiras frias. Todo mundo mais deve usar o [app do Hipo](/stake/), que é mais barato e mostra a estimativa exata antes de você confirmar. Quando uma carteira multisig se conecta ao app do Hipo, o app mostra estas mesmas instruções com os endereços e valores prontos para copiar.

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

Isso faz unstake do saldo **inteiro** de hGRAM daquela carteira. Para fazer unstake de apenas parte dele, use uma raw order — veja a próxima seção. O unstake é liquidado pelas regras normais do protocolo, então vale o prazo do unstake Completo — veja [Como funciona o unstake](/docs/introduction/how-does-hipo-work/unstaking/) e [Quanto tempo leva o unstake?](/faq/#how-long-does-unstaking-take)

## Fazer unstake de parte — uma raw order

Um comentário de texto só pode pedir tudo, porque não tem onde colocar um valor. Um unstake parcial é uma mensagem comum com um corpo binário, então precisa de uma carteira ou multisig que consiga enviar uma — o multisig.ton.org chama isso de "Arbitrary order", e o formulário dele pede exatamente os três valores abaixo.

Abra o [app do Hipo](/unstake/) com sua multisig conectada, digite o valor que você quer tirar do staking e clique em Unstake. O app monta a ordem e mostra os três valores prontos para copiar:

- **Endereço de destino (Destination Address)** — o contrato da sua própria carteira hGRAM. Não é a tesouraria: é o contrato que guarda seu hGRAM, derivado do endereço da sua multisig. Confira no Tonviewer antes de assinar; o app linka para ele.
- **Valor em TON (TON Amount)** — 0,1 GRAM, o mesmo pré-pagamento de gas de sempre, devolvido menos a fração gasta.
- **BOC da ordem (Order BOC)** — o corpo da mensagem, em base64.

Duas coisas importantes. Só a sua própria carteira hGRAM aceita esta ordem, então se ela for assinada por engano de outra carteira, ela simplesmente retorna (bounce) e nada é queimado — diferente do comentário "w", que faria unstake de qualquer saldo que a carteira remetente tiver. E se você escolheu a taxa instantânea, o quanto pode ser resgatado instantaneamente muda a cada rodada: assine sem demora, ou escolha a melhor taxa para uma ordem que vai ter que esperar outras assinaturas.

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
- Para uma raw order, confira se o destino é o contrato da sua própria carteira hGRAM, e não um endereço vindo de outro lugar.

## Mais no FAQ

- [Posso fazer staking com uma carteira multisig ou fria?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Taxas e gas](/docs/fees-and-gas/)
