---
order: 5
section: 'staking'
question: 'Posso fazer staking com uma carteira multisig ou fria?'
---

Sim. Carteiras que não conseguem assinar transações de dapp, como carteiras multisig, fazem staking com uma transferência simples: envie o GRAM que deseja colocar em staking, mais 0,1 GRAM como pré-pagamento de taxa, para a tesouraria da Hipo com o comentário de texto "d". O pré-pagamento é arredondado generosamente para cima — a parte não utilizada é reembolsada, e o hGRAM é enviado de volta para o mesmo endereço.

Para fazer unstake de tudo, envie 0,1 GRAM para a tesouraria com o comentário de texto "w". Para fazer unstake de apenas parte do seu saldo, conecte a multisig ao app do Hipo, digite o valor e clique em Unstake: o app monta uma raw order — um endereço de destino, um valor em TON e um corpo em base64 — que você copia para a sua multisig, que é o que o multisig.ton.org chama de "Arbitrary order". O procedimento completo, incluindo o endereço da tesouraria, está em [Staking sem o app](/docs/staking-without-the-app/).
