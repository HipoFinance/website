---
title: 'Política de Investimento do Hipo Fund'
description: 'Como o Hipo Fund é investido: alocação-alvo, limites de risco e concentração, custódia, liquidez, e como uma parcela do crescimento do fundo retorna aos holders de HPO.'
---

:::caution

**Este é um rascunho em revisão pela comunidade. Ainda não está em vigor.**

:::

**Rascunho v1.5 · Para revisão da comunidade e ratificação da DAO**

---

## Em resumo

_A política completa vem a seguir. Onde os dois diferirem, prevalecem as seções numeradas._

**Alocação-alvo.** O HPO fica fora da alocação. Tudo o mais:

| Fatia                                                                     | Meta | Faixa   |
| ------------------------------------------------------------------------- | ---- | ------- |
| Rendimento em stablecoins, alocado                                        | 45 % | 35–55 % |
| Reserva de Oportunidade — só é alocada com um gatilho de queda do Bitcoin | 10 % | 5–15 %  |
| Bitcoin, mantido nativamente                                              | 30 % | 20–35 % |
| hGRAM                                                                     | 12 % | 8–18 %  |
| Caixa operacional e gas                                                   | 3 %  | 2–6 %   |

**Limites principais.**

|                                                     |                 |
| --------------------------------------------------- | --------------- |
| Ativos do ecossistema TON (HPO + hGRAM + GRAM)      | ≤ 45 % do fundo |
| Ativos que nenhum emissor pode congelar             | ≥ 20 % do fundo |
| Qualquer protocolo único, ou qualquer emissor único | ≤ 30 % do fundo |
| Ativos fora da custódia multisig                    | 0 %             |
| Alavancagem                                         | Zero, sempre    |

**O que os holders de HPO recebem.**

| Canal                | Como funciona                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retorno de valor** | Acima da sua marca d'água (high-water mark), o fundo retorna aos holders de HPO até metade do seu crescimento acumulado, no ritmo de até 2 % do valor do fundo por ano. O crescimento retido pelo limite de ritmo é acumulado, não perdido. Pago via partilha de receita do Hipo Club ou pela compra e queima de HPO — a DAO vota a forma, não o valor. |
| **Lastro em ativos** | O valor do fundo como parcela da capitalização de mercado do HPO é publicado a cada trimestre.                                                                                                                                                                                                                                                          |
| **Governança**       | Os holders de HPO votam esta política, cada emenda a ela, e qualquer venda do HPO do fundo.                                                                                                                                                                                                                                                             |

**Dez regras.**

1. **Sem alavancagem, sem derivativos, sem market-making.** Em qualquer tamanho, sempre.
2. **O fundo não compra HPO para manter.** Ele pode comprar HPO para queimar, financiado apenas com ganhos — ver Seções 2.2 e 8.
3. **O fundo não é uma fonte de liquidez de mercado para o HPO nem de recursos operacionais.**
4. **Todos os ativos em multisigs 2 de 3** — uma na TON, uma na EVM, uma no Bitcoin.
5. **Toda posição deve poder ser sacada diretamente do seu contrato,** sem permissão de nenhum operador ou front end.
6. **Sem market timing.** As faixas de rebalanceamento compram na baixa e vendem na alta, mecanicamente.
7. **A Reserva de Oportunidade só é alocada com um gatilho** — Bitcoin 40 %, 55 % e 70 % abaixo da sua máxima móvel dos últimos 12 meses, em terços.
8. **Ninguém é pago para gerir este fundo.** Sem taxa de administração, sem taxa de performance.
9. **Um relatório a cada trimestre,** a partir de um único bloco on-chain, com o desempenho desde o início e o valor atual de cada limite.
10. **A DAO define o marco; os signatários executam dentro dele.**

**Uma coisa que precisa ficar clara.** Nesta alocação, o fundo rende aproximadamente 2 % ao ano. Sua marca d'água é o capital aportado a ele, aproximadamente US$ 224.056, e nenhum retorno de valor é devido até que o fundo esteja acima dessa marca. Esta política é construída para crescer de forma constante e sobreviver a ciclos completos de mercado, não para se recuperar rapidamente.

---

## 1. Propósito e origem

O Hipo Fund foi criado em abril de 2025 a partir dos recursos da oferta inicial do HPO, somados aos resgates de HPO das temporadas do Hipo Club. Esse capital não foi alocado à equipe e não foi absorvido pelo orçamento operacional do Hipo. Ele foi colocado em uma tesouraria separada e publicamente visível, e reservado para trabalhar em benefício do ecossistema Hipo e dos holders de HPO ao longo de um horizonte medido em anos.

Este documento define como esse capital é investido: o que o fundo pode manter, quanto de cada coisa ele pode manter, quem decide o quê, como o valor retorna aos holders de HPO, e como tudo isso é relatado.

Uma política escrita torna as decisões repetíveis, de modo que o comportamento do fundo não dependa de quem está prestando atenção naquele mês. Ela as torna revisáveis, de modo que a comunidade possa julgar o processo e não apenas o resultado. E ela estabelece limites antes que sejam necessários, quando é fácil concordar com eles.

Uma vez ratificada por votação da DAO, esta política é vinculante para os signatários do fundo.

---

## 2. Mandato e objetivos

O Hipo Fund é uma tesouraria de investimento de longo prazo. Seus objetivos, em ordem de prioridade:

1. **Preservar capital** ao longo de ciclos completos de mercado.
2. **Crescer o valor real do fundo** ao longo de um horizonte medido em anos.
3. **Retornar uma parcela desse crescimento aos holders de HPO**, de forma sustentável e sem consumir o principal.

### O que o Hipo Fund não é

- **Não é uma conta de trading.** Ele não assume posições de curto prazo nem tenta prever o timing do mercado.
- **Não é uma fonte de liquidez de mercado para o HPO.** Fornecer liquidez para o mercado do HPO é uma decisão de tokenomics financiada pelas alocações de tesouraria e marketing do HPO.
- **Não é uma fonte de recursos operacionais.** O fundo é separado do orçamento operacional do Hipo e não pode ser usado para cobrir despesas.

### 2.1 Como o Hipo Fund retorna valor aos holders de HPO

O Hipo retorna valor aos holders de HPO a partir de suas fontes de receita, de duas formas já estabelecidas: pela partilha de receita do Hipo Club, e pela compra de HPO no mercado seguida de queima. O Hipo Fund deve se tornar mais uma dessas fontes.

Quando o fundo cresce além da sua marca d'água, uma parcela desse crescimento é alocada aos holders de HPO a cada ano, segundo a regra da Seção 2.2. A forma que ela assume — partilha de receita ou compra e queima — é escolhida no momento em que uma distribuição se torna devida, usando a infraestrutura que o Hipo já opera.

As duas formas retornam valor real; elas fazem isso de maneiras diferentes, e a escolha deve refletir as condições do momento:

- **Compra e queima** reduz permanentemente a oferta de HPO e beneficia todos os holders sem que ninguém precise reivindicar nada. Ela cria o máximo de valor quando o HPO é negociado abaixo do que os ativos do fundo e os fundamentos do protocolo sustentam, já que uma queima só é vantajosa se os tokens forem comprados abaixo do seu valor real. Seu custo é o impacto de mercado: em um mercado raso, parte do valor gasto move o preço em vez de comprar oferta.
- **Partilha de receita** coloca cada dólar nas mãos dos holders proporcionalmente, sem impacto de mercado, e é a via mais eficiente sempre que o HPO não está claramente barato.

Junto a isso, o valor do fundo como percentual da capitalização de mercado em circulação do HPO é publicado em todo relatório trimestral. É a parcela da avaliação do HPO lastreada por ativos mantidos fora do próprio token, e ela é relatada independentemente de subir ou cair.

**Uma observação sobre a escala.** No tamanho atual do fundo, um retorno de valor seria modesto, e nenhum é devido enquanto o fundo estiver abaixo da sua marca d'água. O que importa nesta regra é o compromisso que ela assume: ela dá aos holders de HPO um direito definido e público sobre o crescimento do fundo, que se amplia conforme o fundo cresce, e que não pode ser alterado sem uma votação da DAO.

### 2.2 A regra de retorno de valor

**Marca d'água.** O total de capital aportado ao fundo, mais tudo o que o fundo já retornou aos holders de HPO. Atualmente está em aproximadamente **US$ 224.056**. Ela sobe quando novo capital é aportado, e pelo valor de cada retorno de valor. Ela nunca cai.

**Abaixo da marca d'água, nada é retornado.** O capital é reconstituído primeiro. Pagar abaixo da marca significa pagar a partir do principal.

**Acima dela**, em cada ano fiscal o fundo aloca para o retorno de valor em HPO o **menor** entre:

- **50 % do valor do fundo acima da marca d'água**, e
- **2 % do valor total do fundo** no início do ano

#### Por que existem dois limites

Os dois limites cumprem funções diferentes.

**O limite de 50 % decide se há algo a retornar.** Ele mede o fundo contra tudo o que já foi colocado nele ou pago por ele, de modo que um ano em que o fundo não cresce não produz nada — e em nenhum caso mais da metade do crescimento acumulado do fundo é pago. A outra metade permanece investida e continua trabalhando.

**O limite anual decide a velocidade do pagamento.** Na maioria dos anos, é o limite anual que prevalece; o limite de 50 % só se aplica na faixa estreita logo acima da marca d'água. Isso é deliberado. Um fundo que paga pesado depois de um ano forte e nada nos três anos seguintes serve pior aos holders do que um que paga de forma constante, e uma tesouraria deste porte precisa mais do seu efeito composto do que de um único pagamento grande.

**O limite regula o ritmo do pagamento. Ele não o cancela.** Como a marca d'água sobe apenas pelo valor efetivamente retornado, o crescimento retido pelo limite permanece acima da marca e continua distribuível em anos posteriores. Nada que se qualifica é perdido — fica em fila de espera.

_Exemplo prático._ Suponha que o fundo chegue a US$ 300.000 contra uma marca d'água de US$ 224.056. O crescimento acima da marca é de US$ 75.944, então o limite de 50 % permitiria US$ 37.972 — mas o limite anual restringe o retorno do ano a US$ 6.000. A marca d'água sobe para US$ 230.056. Se o valor do fundo permanecer inalterado no ano seguinte, o crescimento acima da marca é de US$ 69.944, o limite anual novamente permite US$ 6.000, e esse valor é pago. O valor limitado não é perdido; ele é retornado ao longo dos anos seguintes.

#### O valor não é uma decisão

Quando o fundo está acima da sua marca d'água, a alocação é um cálculo realizado no relatório trimestral, não uma proposta. Uma vez calculado, o valor é reservado para os holders de HPO, relatado como um valor comprometido até ser pago, e não pode ser reabsorvido pelo fundo.

**Apenas a forma é votada.** Os signatários propõem partilha de receita, compra e queima, ou uma divisão entre as duas, com justificativa, e a DAO ratifica a forma. Uma proposta que não é ratificada é revisada e trazida de volta — a alocação em si não caduca. Se nenhuma forma tiver sido ratificada dentro de **90 dias** a partir do relatório que a originou, a alocação é executada como compra e queima, que não precisa de infraestrutura externa e não pode ser bloqueada.

**A fórmula só pode ser alterada por votação da DAO.** Os signatários podem executar um retorno de valor dentro desta regra; eles não podem alterá-la, adiá-la ou dispensá-la.

#### Condições

- O fundo permanece dentro de todos os limites da Seção 7 após o retorno
- É financiado a partir de receita e de recursos já realizados por meio de rebalanceamento ordinário — nunca vendendo Bitcoin abaixo da sua faixa, usando a Reserva de Oportunidade, vendendo o HPO do fundo, ou liquidando uma posição unicamente para gerar um valor a pagar
- Se pagar a alocação integral fizer alguma fatia sair da sua faixa, paga-se o quanto as faixas permitirem, e o restante é transportado para o ano seguinte, com a marca d'água subindo apenas pelo valor efetivamente pago
- O cálculo completo é publicado no relatório trimestral, incluindo a marca d'água antes e depois

---

## 3. Governança e direitos de decisão

| Decisão                                                            | Quem decide                                                                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Emendar esta política                                              | **Votação da DAO** (vinculante)                                                                                   |
| Alterar a fórmula de retorno de valor                              | **Votação da DAO** (vinculante)                                                                                   |
| Reduzir a posição em HPO                                           | **Votação da DAO** (vinculante)                                                                                   |
| Adicionar uma classe de ativo não listada na Seção 5               | **Votação da DAO** (vinculante)                                                                                   |
| Introduzir qualquer remuneração de gestor                          | **Votação da DAO** (vinculante) — Seção 14                                                                        |
| A forma que um retorno de valor assume                             | Os signatários propõem, a DAO ratifica. O **valor** é um cálculo segundo a Seção 2.2 e não está sujeito a votação |
| Adicionar um novo protocolo dentro de uma classe de ativo aprovada | Signatários, anunciado em até 7 dias                                                                              |
| Alocar a Reserva de Oportunidade quando um gatilho disparar        | Signatários, anunciado em até 7 dias                                                                              |
| Rebalancear dentro das faixas da Seção 6                           | Signatários, relatado trimestralmente                                                                             |
| Praça de execução, timing e rota                                   | Signatários                                                                                                       |

A DAO define o marco e os limites; os signatários executam dentro deles. Operações individuais não são votadas — uma tesouraria que precisa de uma votação para rebalancear não consegue rebalancear.

**Anúncio.** Qualquer transação individual acima de **US$ 10.000**, e qualquer mudança que faça uma fatia sair da sua faixa, é anunciada nos canais oficiais do Hipo em até 7 dias.

---

## 4. Custódia

Todos os ativos do fundo são mantidos em carteiras multisig. São três, cada uma com uma função.

| Carteira                    | Guarda                               | Assinatura |
| --------------------------- | ------------------------------------ | ---------- |
| Multisig TON `hipofund.ton` | hGRAM, HPO, GRAM para gas            | 2 de 3     |
| Multisig Safe na EVM        | Stablecoins e posições de empréstimo | 2 de 3     |
| Multisig Bitcoin            | BTC                                  | 2 de 3     |

- As três usam os mesmos três signatários, todos integrantes da equipe do Hipo.
- **Nenhum ativo do fundo é mantido em carteira de assinatura única.**
- **O fundo não move ativos para fora da multisig para atender a um requisito de elegibilidade.** Se um sistema do Hipo não suporta carteiras multisig, é o sistema que é alterado, não o arranjo de custódia. O suporte a multisig é um pré-requisito antes de o fundo participar de qualquer mecanismo de distribuição.
- Nenhum ativo do fundo é mantido em uma exchange centralizada, com um custodiante, ou em qualquer conta controlada por uma única pessoa, exceto em trânsito conforme a Seção 4.1.
- O Bitcoin é mantido nativamente, não wrapped. Todo wrapper reintroduz um custodiante, e esta fatia não tem necessidade de ser produtiva.

### 4.1 Movimentação de ativos entre blockchains

Transferências entre blockchains usam uma bridge on-chain com uma rota ativa e verificada, executadas em parcelas, e não como uma única transação.

Quando não existe uma rota on-chain confiável, uma transferência pode passar por uma conta de exchange pertencente a um signatário, sujeita a todas as condições a seguir:

- No máximo **15 % do fundo** em trânsito de cada vez
- Concluída dentro de **72 horas**
- As duas pernas publicadas no relatório trimestral seguinte, com os hashes de transação em cada blockchain
- Aprovada por pelo menos dois signatários antes de começar

Isso é uma alternativa de exceção, não a regra. Durante o trânsito, os ativos ficam fora do controle da multisig e fora do registro on-chain do qual depende a transparência do fundo. São esses limites que tornam essa janela estreita o suficiente para ser aceitável.

---

## 5. Ativos elegíveis

O fundo só pode manter o seguinte. Qualquer outra coisa exige uma votação da DAO.

**Permitido**

- **Bitcoin**, mantido nativamente
- **Stablecoins lastreadas em moeda fiduciária** de emissores que publicam atestados de reserva — atualmente USDT, USDC, USDS
- **hGRAM**
- **HPO**, apenas no saldo já existente — Seção 8
- **Depósitos em protocolos de empréstimo blue-chip** que atendam a todos os seguintes critérios: pelo menos US$ 1 bilhão de TVL, três ou mais auditorias independentes, 24 meses ou mais em operação sem perda não recuperada de recursos de usuários, e saque direto conforme a Seção 5.2
- **Saldos nativos de gas** em quantidades operacionalmente necessárias

**Não permitido**

- Alavancagem, empréstimos tomados, margem, ou qualquer posição que possa ser liquidada
- Futuros perpétuos, opções, ou qualquer derivativo
- Market-making, provisão de liquidez, ou vaults que assumem o lado oposto das posições de traders
- **Dólares sintéticos cujo lastro é uma posição em derivativos.** O USDe da Ethena foi avaliado e excluído: seu rendimento vem de taxas de funding de perpétuos, e não de reservas, suas pernas vendidas ficam em exchanges centralizadas, seu fundo de reserva é de aproximadamente 1 % da oferta, e seu período de espera de 7 dias para unstake conflita com a Seção 9. No momento da avaliação, ele não oferecia nenhum prêmio de rendimento sobre o empréstimo de stablecoins blue-chip. É uma basis trade, não um ativo de preservação de capital, e classificá-lo como tal distorceria o risco do fundo.
- Qualquer token com volume de negociação em 24 horas menor que US$ 10 milhões, exceto a posição já existente em HPO
- Compras de HPO para manter — Seção 8

### 5.1 Risco de congelamento, e o piso que o administra

A maior parte do que este fundo mantém é um direito sobre uma empresa, e emissores de stablecoins e de ativos tokenizados podem congelar uma carteira específica. Isso não é motivo para evitar esses ativos — não existe alternativa permissionless em escala para poder de compra estável — mas o risco precisa ser dimensionado, não ignorado.

- **Nenhum emissor congelável individual pode exceder 30 % do fundo.**
- **Pelo menos 20 % do fundo é mantido em ativos que nenhum emissor, custodiante ou autoridade pode congelar por ação unilateral.** Atualmente, o Bitcoin é a única posição que atende a esse critério.

### 5.2 Saque direto

Toda posição deve poder ser sacada diretamente do contrato inteligente, sem permissão de nenhum operador, interface ou intermediário. Antes de alocar capital em um novo protocolo, os signatários verificam que o saque funciona por interação direta com o contrato, independentemente do front end do protocolo.

Um protocolo que pode bloquear, pausar ou condicionar o saque a critério de um operador não é elegível, independentemente do rendimento. Para um fundo sem fonte comprometida de novo capital, capital que não pode ser recuperado é uma perda permanente.

### 5.3 Ampliando o universo conforme o fundo cresce

A lista acima é restrita porque o fundo é pequeno: cada posição adicional custa o mesmo esforço de configuração, monitoramento e relato que uma posição grande, enquanto contribui com um retorno pequeno demais para fazer diferença. Isso muda conforme o fundo cresce.

| Tamanho do fundo, sustentado por dois relatórios consecutivos | O que se torna disponível                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Abaixo de US$ 250.000                                         | A lista acima                                                                    |
| US$ 250.000 ou mais                                           | A DAO pode adicionar **uma** classe de ativo adicional, limitada a 10 % do fundo |
| US$ 500.000 ou mais                                           | Uma fatia oportunista de até 10 % do fundo, dentro das proibições acima          |

Cada expansão exige uma votação da DAO. Atingir um limiar torna uma adição possível, não automática.

---

## 6. Alocação-alvo

A posição em HPO fica fora da alocação-alvo. Ela não pode ser ampliada e não pode ser negociada em volume relevante, então incluí-la forçaria todas as outras fatias a rebalancear em torno de um número sobre o qual o fundo não pode agir.

**Posição não discricionária**

|     |                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------- |
| HPO | 9.023.524,44, mantidos. Sem compras para manter. Reduções apenas conforme a Seção 8. **Limite de referência de 25 % do fundo.** |

**Portfólio discricionário** — tudo o mais:

| Fatia                              | Meta | Faixa   | Finalidade                                                                             |
| ---------------------------------- | ---- | ------- | -------------------------------------------------------------------------------------- |
| Rendimento em stablecoins, alocado | 45 % | 35–55 % | Preservação de capital e a receita do fundo                                            |
| **Reserva de Oportunidade**        | 10 % | 5–15 %  | Capital não alocado para quedas expressivas — Seção 6.1                                |
| Bitcoin                            | 30 % | 20–35 % | Reserva de valor de longo prazo; o ativo do fundo não congelável e fora do ecossistema |
| hGRAM                              | 12 % | 8–18 %  | Alinhamento com o Hipo, além de rendimento de staking                                  |
| Caixa operacional e gas            | 3 %  | 2–6 %   | Custos de transação, margem de segurança                                               |

**Sobre o hGRAM.** Seu rendimento é denominado em GRAM, então a posição é uma exposição direcional a GRAM com um rendimento agregado, e não um ativo de renda. Parte do motivo para mantê-la é o alinhamento com o protocolo ao qual o fundo pertence, o que é um motivo legítimo. Apresentá-la como renda não seria.

**Sobre o Bitcoin.** Nenhum retorno é presumido, e nenhum deveria ser. Ele é dimensionado de modo que uma queda de 70 % — que o Bitcoin já sofreu antes — custe ao fundo aproximadamente 16 % do seu valor. Dimensionado pela tolerância à queda, não pela convicção.

**Entrada.** Novas posições em Bitcoin são construídas em parcelas semanais iguais ao longo de no mínimo oito semanas. Uma regra, não uma visão de mercado.

### 6.1 A Reserva de Oportunidade

O fundo mantém 10 % do seu portfólio discricionário em stablecoins, não alocadas ou em rendimento com liquidez no mesmo dia, para comprar durante quedas severas. Ela só é alocada **mediante um gatilho objetivo**, em terços, em ativos já presentes na lista de elegíveis:

| Gatilho                                                      | Aloca       |
| ------------------------------------------------------------ | ----------- |
| Bitcoin 40 % abaixo da sua máxima móvel dos últimos 12 meses | Um terço    |
| Bitcoin 55 % abaixo da sua máxima móvel dos últimos 12 meses | Um terço    |
| Bitcoin 70 % abaixo da sua máxima móvel dos últimos 12 meses | Terço final |

A máxima móvel usa a série de fechamentos diários da fonte de preços publicada do fundo. Uma vez alocada, a Reserva é reconstituída a partir da fatia de stablecoins ao longo dos quatro trimestres seguintes.

**Sem alocação discricionária.** Se o gatilho não tiver disparado, o capital permanece onde está. O propósito de um gatilho escrito é tomar a decisão com antecedência, quando é fácil, em vez de durante as condições que a tornam difícil.

---

## 7. Limites de concentração e de risco

Medidos em relação ao valor total do fundo, verificados a cada relatório trimestral.

| Limite                                                     | Limiar                                           |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Qualquer protocolo único                                   | ≤ 30 % do fundo                                  |
| Qualquer emissor de stablecoin único                       | ≤ 30 % do fundo                                  |
| Qualquer emissor congelável único, somando todos os ativos | ≤ 30 % do fundo                                  |
| Ativos que nenhum emissor pode congelar                    | **≥ 20 % do fundo**                              |
| Qualquer posição individual fora do HPO                    | ≤ 35 % do fundo                                  |
| HPO                                                        | ≤ 25 % do fundo (referência — Seção 8)           |
| Ativos fora da custódia multisig                           | **0 %**, exceto em trânsito conforme a Seção 4.1 |
| Ativos do ecossistema TON (HPO + hGRAM + GRAM)             | ≤ 45 % do fundo                                  |
| Alavancagem                                                | Zero, o tempo todo                               |

O limite da TON é a linha mais importante deste documento. A receita do fundo vem do Hipo, seu financiamento vem do Hipo, e parte dos seus ativos são os próprios tokens do Hipo. Uma tesouraria concentrada no seu próprio ecossistema não amortece um ano difícil para esse ecossistema — ela o amplifica. Esse limite mantém o fundo útil justamente quando ele é mais necessário.

Se um limite for violado por movimento de mercado, e não por uma transação, o fundo tem um trimestre para trazê-lo de volta para dentro do limite, e a violação é divulgada no relatório daquele trimestre.

---

## 8. Política de HPO

**O fundo não compra HPO para manter.** A posição do fundo já é grande em relação à liquidez de mercado do HPO, e ampliá-la converte capital líquido em uma posição da qual o fundo não consegue sair perto do seu valor de referência. A função do fundo é fazer crescer ativos que podem ser alocados, não acumular seu próprio token.

**Comprar HPO para queimar é uma ação diferente e é permitida.** Segundo a Seção 2.2, o fundo pode comprar HPO no mercado e destruí-lo como uma das duas formas de retornar valor aos holders. Os tokens saem de circulação em vez de se juntar ao balanço do fundo, e isso é financiado apenas com ganhos acima da marca d'água — nunca com capital.

**Reduzindo a posição existente.** O HPO do fundo é mantido. É a participação do fundo no seu próprio protocolo, e não há como sair dela em volume relevante no mercado aberto.

Se ela for reduzida algum dia, isso só acontece por meio de uma venda OTC a um comprador estratégico ou de uma venda estruturada aprovada por votação da DAO. **O fundo não vende HPO no mercado aberto, em nenhum volume.** Qualquer uma das duas vias exige tudo o seguinte:

- **Uma votação da DAO** aprovando a venda antes da execução
- **O uso dos recursos declarado na proposta** — os holders votam sobre o que acontece com o dinheiro, não apenas sobre se os tokens são vendidos
- **Divulgação completa na conclusão**, incluindo volume, preço e quaisquer condições associadas à venda

Os holders financiaram o capital que comprou esta posição. A exigência de votação e de divulgação é o que garante que qualquer venda aconteça em termos que eles viram e aprovaram com antecedência.

O limite de 25 % da Seção 7 é um nível de referência, não uma venda forçada. Se o HPO se valorizar além dele, o fundo relata a violação e a DAO decide se deve agir.

---

## 9. Liquidez

- Pelo menos **35 % do fundo** resgatável em stablecoins dentro de 7 dias sem perda relevante
- No máximo **10 % do fundo** em posições com bloqueio superior a 7 dias
- Nenhuma posição da qual o fundo não conseguiria sair dentro de 30 dias, exceto o HPO, divulgado como ilíquido em todo relatório

---

## 10. Rebalanceamento

- **Revisado trimestralmente**, junto com o relatório
- Rebalanceado quando uma fatia sai da sua **faixa**, e não em um calendário fixo — os custos de transação são reais para um fundo deste porte
- Rebalanceado de volta ao ponto médio da meta, executado ao longo de um período quando o volume justificar
- Qualquer operação de rebalanceamento acima de US$ 10.000 é anunciada em até 7 dias

**O rebalanceamento é como este fundo compra na baixa e vende na alta.** Quando o Bitcoin cai abaixo da sua faixa, a regra exige comprar. Quando ele sobe acima, a regra exige reduzir a posição. A decisão é tomada com antecedência e executada mecanicamente.

**O fundo não tenta identificar topos ou fundos de mercado.** Nenhuma posição é aberta, fechada ou redimensionada com base em previsão ou em sentimento. Agir com base em uma leitura de mercado exige acertar duas vezes — na saída e na reentrada — com um processo de assinatura 2 de 3 que não consegue se mover nessa velocidade. As faixas e a Reserva de Oportunidade capturam a mesma intenção por meio de regras que de fato podem ser executadas.

---

## 11. Relatórios

- Um **relatório completo a cada trimestre**, gerado a partir de um único bloco on-chain pelo [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs), listando o bloco, as taxas de conversão e todos os preços usados, para que qualquer leitor possa reproduzi-lo
- Todo relatório inclui: a alocação em relação às metas da Seção 6, cada limite da Seção 7 com seu valor atual, **desempenho desde o início pelo método Modified Dietz**, um benchmark, o valor do fundo como parcela da capitalização de mercado do HPO, e toda transação acima de US$ 10.000
- Aportes registrados com o bloco e o preço no momento do recebimento
- Violações de limite divulgadas independentemente de terem sido corrigidas
- Relatórios publicados no prazo, independentemente do que os números mostrem

**Precificação.** GRAM e Bitcoin ao preço de mercado de um agregador publicado. hGRAM à taxa de resgate do protocolo — o que o fundo receberia ao fazer unstake. HPO no CoinGecko, cruzado com a capitalização de mercado publicada do Hipo; cotações de pools rasas de DEX são excluídas. Stablecoins em 1,0000 por convenção.

---

## 12. Revisão e emenda

- Revisada **anualmente**, ou antes disso em caso de mudança relevante — um grande aporte, uma nova fonte de receita, ou uma violação de limite que não possa ser corrigida dentro de um trimestre
- Emendas exigem uma **votação da DAO**
- Toda versão é publicada; versões substituídas permanecem online com suas datas

---

## 13. Questões em aberto conhecidas

- **O fundo não tem fonte comprometida de novo capital.** As recompensas de staking do hGRAM são atualmente sua única fonte de receita ativa. Acordos OTC e a retomada da receita do protocolo são ambos possíveis; esta política não pressupõe nenhum dos dois.
- **O valor da posição em HPO é uma marcação, não um preço.** Todo relatório afirma isso e vai continuar afirmando.
- **O HPO do fundo não gera receita** enquanto a taxa de staking do protocolo estiver em 0 %. Restabelecer uma taxa é uma decisão separada, mas as duas interagem: isso daria rendimento à maior posição do fundo, ao mesmo tempo em que reduziria o rendimento do seu hGRAM.

---

## 14. Remuneração do gestor

**Ninguém recebe nada por gerir o Hipo Fund. Não há taxa de administração nem taxa de performance.**

Isso é publicado, em vez de deixado subentendido, porque a ausência de uma taxa é, em si, uma política, e comprometer-se antecipadamente com as condições para reabrir a questão evita que uma proposta desestruturada apareça mais tarde.

A Norges Bank Investment Management, que gere o fundo soberano no qual o Hipo Fund se inspira, recebe um orçamento de custos reembolsado até um limite anual definido pelo Ministério das Finanças — não uma parcela dos ganhos. Seus custos de gestão foram de 0,034 % dos ativos em 2024. As taxas baseadas em performance lá se aplicam a gestores externos, não ao gestor do próprio fundo.

Duas outras coisas também pesam contra uma taxa aqui. Uma taxa de performance dá ao gestor o ganho potencial sem a perda potencial, o que é o incentivo errado para um fundo pequeno com mandato de preservação de capital. E o alinhamento já existe de uma forma melhor: os signatários mantêm HPO, então, se o fundo cresce, o lastro do HPO se fortalece — exposição ao resultado completo, incluindo as perdas.

**Se a questão for reaberta**, isso exige uma votação da DAO e só pode ser proposto quando o fundo estiver acima de **US$ 500.000**, acima da sua marca d'água, e tiver mantido ambas as condições ao longo de **dois relatórios trimestrais consecutivos**. Qualquer proposta deve incluir: apenas uma taxa de performance e nenhuma taxa de administração; uma marca d'água rígida; uma taxa mínima de referência (hurdle rate) acima de um benchmark de rendimento de stablecoin; pagamento em HPO bloqueado por pelo menos 12 meses; e um limite anual como percentual dos ativos.

**Se gerir o fundo algum dia exigir tempo remunerado**, ele é pago com o orçamento operacional do Hipo, como uma função definida com um custo fixo — não com recursos do fundo, e não como uma parcela dos retornos. Isso mantém a remuneração separada dos resultados de investimento, que é o que um mandato de preservação de capital exige.
