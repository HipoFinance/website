---
title: 'Recompensas do Hipo'
---

Nosso objetivo é construir o Hipo como um protocolo realmente conduzido pela comunidade, no qual o valor e as decisões ficam com a comunidade.

Fazer staking de GRAM com o Hipo paga você em três fluxos separados, em três ritmos diferentes:

- **Recompensas base**\
  Recompensas de staking de GRAM, refletidas na taxa de conversão do hGRAM em relação ao GRAM — liquidadas **a cada rodada de validação** (~18 h), sem nada para resgatar
- **Recompensas turbinadas**\
  HPO extra sobre o valor em GRAM do que você tem em staking, a um coeficiente definido pelo seu nível no [Hipo Club](https://t.me/HipoFinanceBot/join) — acumulado **a cada rodada de validação**, sacável assim que o seu saldo passar de 100 HPO
- **Recompensas adicionais**\
  Manter HPO → receber uma parte da receita do protocolo — paga **ao fim de cada temporada do Hipo Club**

Dá para acompanhar as três no [app do Hipo](/club/) e no [Hipo Club](https://t.me/HipoFinanceBot/join).

## Recompensas base: a taxa de conversão

Você faz staking de GRAM e recebe hGRAM. Não há período de bloqueio nem nada para resgatar: as recompensas de validação se acumulam dentro do protocolo, então cada hGRAM passa a valer mais GRAM ao longo do tempo. O seu saldo de hGRAM nunca muda — o valor dele é que muda.

Esse é o fluxo principal, e é a ele que se refere o APY da [página Stats](/stats/). Como o Hipo não fica com nenhuma parte do que você tem em staking e a [taxa de governança](/docs/fees-and-gas/) está atualmente em 0 %, toda a recompensa de validação vai para a taxa de conversão.

## Recompensas turbinadas: HPO do Hipo Club

Além da taxa de conversão, o [Hipo Club](/docs/giveaways-and-prizes/hipo-club/) paga HPO a você por manter hGRAM. Esse fluxo é separado, é pago em HPO e não em GRAM, e você o saca dentro do Club.

### A fórmula

A cada rodada de validação, cada membro ganha:

```
HPO reward = GRAM value of your stake × HPOrewardRate × LevelRate
```

- **HPOrewardRate** está atualmente em **0,0015295**. Ele é definido pela governança e pode mudar.
- **LevelRate** é o coeficiente ligado ao seu nível no Hipo Club.

Uma rodada de validação dura 65.536 segundos — cerca de 18,2 horas —, então há aproximadamente **481 rodadas por ano**. Na taxa atual, cada GRAM que você tem em staking rende cerca de **0,74 HPO por ano** no nível 1.

A base é quanto o que você tem em staking **vale em GRAM neste momento** — o seu saldo de hGRAM na taxa de conversão atual —, e não o valor que você depositou originalmente. Como as recompensas base empurram esse valor para cima a cada rodada, as suas recompensas em HPO crescem junto: os dois fluxos se compõem.

### Coeficientes de nível

A partir da Temporada 6 (31 de outubro de 2026), o coeficiente é o número do seu nível:

| Nível       | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ----------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Coeficiente | 1×  | 2×  | 3×  | 4×  | 5×  | 6×  | 7×  | 8×  | 9×  | 10× |

Cada nível soma o mesmo 1×: o nível 2 ganha o dobro do nível 1, o nível 5 cinco vezes mais e o nível 10 dez vezes mais. Até o fim da Temporada 5, a taxa subia de forma mais acentuada, de 1,2× no nível 2 a 8,2× no nível 9.

### O que isso dá na prática

Recompensas anuais em HPO na taxa atual:

| Em staking (GRAM) | Nível 1 (1×) | Nível 5 (5×) | Nível 10 (10×) |
| ----------------- | ------------ | ------------ | -------------- |
| 1.000             | ~736 HPO     | ~3.680 HPO   | ~7.360 HPO     |
| 5.000             | ~3.680 HPO   | ~18.400 HPO  | ~36.800 HPO    |
| 10.000            | ~7.360 HPO   | ~36.800 HPO  | ~73.600 HPO    |
| 50.000            | ~36.800 HPO  | ~184.000 HPO | ~368.000 HPO   |

### Quanto isso vale

As recompensas em HPO são pagas em um token que tem preço de mercado, e esse preço varia. Avaliado pelo preço de mercado do HPO em 16 de outubro de 2026, o reforço acrescenta cerca de **0,22 ponto percentual** ao seu retorno anual efetivo no nível 1, e cerca de **2,2 ponto percentual** no nível 10.

Ou seja, um staker no nível 10 ganha aproximadamente o APY de staking de GRAM da [página Stats](/stats/), **mais cerca de 2,2 %** em termos de HPO.

:::note
Dizemos isso desta forma de propósito. Um número grande de HPO, sozinho, não diz quanto você está ganhando, e o mercado do HPO é pequeno — o token é pouco negociado, então o valor de uma posição grande em HPO não é o mesmo que o de uma pequena. Preferimos que você saiba disso a que seja pego de surpresa.
:::

### Níveis

O seu nível multiplica tudo o que está acima: no nível 10, o mesmo valor em staking rende dez vezes o que rende no nível 1. Você também ganha 1 % das recompensas em HPO geradas pelas pessoas que você convida.

Há duas formas de subir de nível:

- **Upgrade sazonal** — resgate as recompensas que você ganhou pelo menos uma vez durante a temporada; o seu nível sobe automaticamente no fim dela.
- **Upgrade instantâneo** — pague a taxa de subida de nível e o seu nível sobe na hora.

Duas regras importam:

- **Vender o HPO recebido como recompensa reinicia você para o nível 1.** O Club foi feito para recompensar quem segura os tokens, e esse é o mecanismo. Enviar o HPO recebido como recompensa para uma exchange, ou para uma carteira que você não conectou ao Club, conta como venda; movê-lo entre as suas próprias carteiras conectadas, não — veja [Usando várias carteiras](/docs/wallets-and-rewards/).
- **Não há janela de resgate.** As recompensas se acumulam a cada rodada e podem ser sacadas sempre que o seu saldo for de pelo menos **100 HPO**.

## Recompensas adicionais: participação nos lucros

O HPO é o token de governança do Hipo. Mantê-lo dá a você voto na [DAO](/docs/dao/) e uma parte da receita do protocolo, distribuída ao fim de cada temporada do Hipo Club — veja [Participação nos lucros](/docs/profit-sharing/).

:::note
Enquanto a [taxa de governança](/docs/fees-and-gas/) for de **0 %**, o protocolo não arrecada receita, então não há nada a distribuir nesse fluxo. A participação nos lucros volta quando a taxa voltar. É a taxa de 0 % que faz as recompensas base serem tão altas quanto são.
:::

Quanto mais você participa, mais você recebe — e maior é o seu papel na construção do futuro do Hipo.

---

_O HPOrewardRate, os limiares de nível, a taxa de conversão do hGRAM e o preço de mercado do HPO mudam. Os números desta página estão atualizados até a última revisão e não são garantia de recompensas futuras. Os números ao vivo do protocolo estão sempre na [página Stats](/stats/)._
