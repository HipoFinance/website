---
title: 'Staking sin la app'
description: 'Haz staking y retira del staking con Hipo usando transferencias simples desde tu billetera, pensado para billeteras multisig, frías y otras que no pueden firmar transacciones de dapp.'
---

## Cuándo necesitas esto

Esta página es para billeteras que no pueden firmar transacciones de dapp: billeteras multisig y algunas billeteras frías. Todos los demás deberían usar la [app de Hipo](/stake/), que es más barata y muestra la estimación exacta antes de confirmar. Cuando una billetera multisig se conecta a la app de Hipo, al pulsar Staking o Unstaking la orden pasa directamente a tu app de billetera; estas instrucciones son la alternativa para cuando eso no funciona.

## Hacer staking: el comentario «d»

Envía el GRAM del que quieras hacer staking **más 0,1 GRAM** como prepago de gas a la tesorería de Hipo:

```
EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ
```

Pon como comentario de texto de la transacción exactamente:

```
d
```

El comentario debe ir en minúscula, en texto plano y sin cifrar. El prepago se redondea al alza con holgura: solo se gasta una fracción y la parte no usada se reembolsa (consulta [Comisiones y gas](/docs/fees-and-gas/)). El hGRAM se envía de vuelta a la misma dirección desde la que llegó la transferencia.

## Retirar todo del staking: el comentario «w»

Envía 0,1 GRAM a la misma dirección de la tesorería con el comentario de texto:

```
w
```

Esto retira del staking **todo** el saldo de hGRAM de esa billetera. Para retirar solo una parte, usa una orden en crudo: consulta la sección siguiente. El unstaking se liquida bajo las reglas normales del protocolo, así que se aplican los tiempos del unstaking Completo: consulta [Cómo funciona el unstaking](/docs/introduction/how-does-hipo-work/unstaking/) y [¿Cuánto tarda el unstaking?](/faq/#how-long-does-unstaking-take)

## Retirar una parte: una orden en crudo

Un comentario de texto solo puede pedirlo todo, porque no tiene dónde poner una cantidad. Un unstaking parcial es un mensaje corriente con un cuerpo binario, así que necesita una billetera o un multisig capaz de enviarlo: multisig.ton.org lo llama «Arbitrary order», y su formulario toma exactamente los tres valores de abajo.

Abre la [app de Hipo](/unstake/) con tu multisig conectado, escribe la cantidad que quieres retirar del staking y pulsa Unstaking. La app pasa la orden a tu app de billetera, que la crea como una solicitud multisig para que la aprueben los demás firmantes. **Comprueba que tu multisig es la billetera seleccionada antes de firmar**: el enlace no puede elegirla por ti. Si no se abre ninguna app de billetera, la app muestra los tres valores para que puedas crear la orden a mano:

- **Destination Address** — el contrato de tu propia billetera de hGRAM. No es la tesorería: es el contrato que guarda tu hGRAM, derivado de tu dirección multisig. Verifícalo en Tonviewer antes de firmar; la app enlaza a él.
- **TON Amount** — 0,1 GRAM, el mismo prepago de gas que en todas partes, reembolsado salvo la fracción que se gasta.
- **Order BOC** — el cuerpo del mensaje, en base64.

Dos cosas que conviene saber. Solo el contrato de tu propia billetera de hGRAM acepta esta orden, así que si se firma por error desde otra billetera simplemente rebota y no se quema nada, a diferencia del comentario «w», que retiraría del staking el saldo que tenga la billetera emisora. Y si elegiste la tasa instantánea, la cantidad que se puede canjear al instante cambia con cada ronda: firma sin demora, o elige la mejor tasa para una orden que tiene que esperar a otras firmas.

## Quemar hGRAM a través del minter

También puedes canjear GRAM directamente quemando hGRAM en [minter.ton.org](https://minter.ton.org/), usando la dirección del master de hGRAM (Parent):

```
EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w
```

Tras quemarlo, recibes GRAM a la tasa de canje vigente. La dirección de Parent puede cambiar con las actualizaciones del protocolo: consulta antes [Contratos y auditorías](/docs/contracts-and-audits/).

## O intercambiar en un DEX

Hay pools de hGRAM en DeDust, STON.fi, TONCO, GroypFi y swap.coffee; la lista actual está en la [página de DeFi](/defi/). Se aplican las comisiones de swap y el impacto en el precio.

## Antes de enviar

- Verifica la dirección de la tesorería en [Contratos y auditorías](/docs/contracts-and-audits/); nunca te fíes de una dirección que llegue en un mensaje reenviado, consulta [Prevención del phishing](/docs/security/phishing-awareness-and-prevention/).
- El comentario debe ser texto plano, exactamente `d` o `w`.
- Una transferencia sin comentario, o con el comentario equivocado, no es una solicitud de staking ni de unstaking.
- Para una orden en crudo, comprueba que el destino es el contrato de tu propia billetera de hGRAM y no una dirección de otro sitio.

## Más en las preguntas frecuentes

- [¿Puedo hacer staking con una billetera multisig o fría?](/faq/#can-i-stake-with-a-multisig-or-cold-wallet)
- [Comisiones y gas](/docs/fees-and-gas/)
