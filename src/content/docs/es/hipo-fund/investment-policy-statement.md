---
title: 'Declaración de política de inversión de Hipo Fund'
description: 'Cómo se invierte el Hipo Fund: asignación objetivo, límites de riesgo y concentración, custodia, liquidez y cómo una parte del crecimiento del fondo vuelve a los holders de HPO.'
---

:::caution

**Este es un borrador en revisión por la comunidad. Todavía no está en vigor.**

:::

**Borrador v1.5 · Para revisión de la comunidad y ratificación de la DAO**

---

## De un vistazo

_A continuación viene la política completa. Cuando ambas difieran, prevalecen las secciones numeradas._

**Asignación objetivo.** HPO queda fuera de la asignación. Todo lo demás:

| Segmento                                                                          | Objetivo | Banda   |
| --------------------------------------------------------------------------------- | -------- | ------- |
| Rendimiento de stablecoins, desplegado                                            | 45 %     | 35–55 % |
| Reserva de Oportunidad — solo se despliega ante un disparador de caída de Bitcoin | 10 %     | 5–15 %  |
| Bitcoin, mantenido de forma nativa                                                | 30 %     | 20–35 % |
| hGRAM                                                                             | 12 %     | 8–18 %  |
| Liquidez operativa y gas                                                          | 3 %      | 2–6 %   |

**Límites clave.**

|                                                              |                  |
| ------------------------------------------------------------ | ---------------- |
| Activos del ecosistema de TON (HPO + hGRAM + GRAM)           | ≤ 45 % del fondo |
| Activos que ningún emisor puede congelar                     | ≥ 20 % del fondo |
| Cualquier protocolo individual o cualquier emisor individual | ≤ 30 % del fondo |
| Activos fuera de la custodia multisig                        | 0 %              |
| Apalancamiento                                               | Cero, siempre    |

**Qué reciben los holders de HPO.**

| Canal                   | Cómo funciona                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retorno de valor**    | Por encima de su marca de agua máxima, el fondo devuelve hasta la mitad de su crecimiento acumulado a los holders de HPO, a un ritmo máximo del 2 % del valor del fondo al año. El crecimiento retenido por ese límite de ritmo queda en cola, no se pierde. Se paga a través del reparto de ingresos de Hipo Club o comprando HPO y quemándolo: la DAO vota la forma, no la cantidad. |
| **Respaldo en activos** | El valor del fondo como porcentaje de la capitalización de mercado de HPO se publica cada trimestre.                                                                                                                                                                                                                                                                                   |
| **Gobernanza**          | Los holders de HPO votan esta política, cada enmienda a ella y cualquier venta del HPO del fondo.                                                                                                                                                                                                                                                                                      |

**Diez reglas.**

1. **Sin apalancamiento, sin derivados, sin creación de mercado.** De ningún tamaño, nunca.
2. **El fondo no compra HPO para conservarlo.** Puede comprar HPO para quemarlo, financiado únicamente con ganancias; consulta las secciones 2.2 y 8.
3. **El fondo no es una fuente de liquidez de mercado para HPO ni de fondos operativos.**
4. **Todos los activos en multisigs de 2 de 3**: una en TON, una en EVM y una en Bitcoin.
5. **Toda posición debe poder retirarse directamente desde su contrato,** sin permiso de ningún operador ni front end.
6. **Nada de market timing.** Las bandas de reequilibrio hacen mecánicamente eso de comprar barato y vender caro.
7. **La Reserva de Oportunidad solo se despliega ante un disparador**: Bitcoin un 40 %, un 55 % y un 70 % por debajo de su máximo móvil de 12 meses, en tercios.
8. **Nadie cobra por gestionar este fondo.** Sin comisión de gestión y sin comisión de éxito.
9. **Un informe cada trimestre,** a partir de un único bloque on-chain, con el rendimiento desde el inicio y el valor actual de cada límite.
10. **La DAO fija el marco; los firmantes ejecutan dentro de él.**

**Una cosa que conviene dejar clara.** Con esta asignación, el fondo obtiene alrededor de un 2 % al año. Su marca de agua máxima es el capital aportado, unos **224.056 $**, y no hay ningún retorno de valor pagadero mientras el fondo esté por debajo de esa marca. Esta política está diseñada para capitalizar de forma constante y sobrevivir a ciclos de mercado completos, no para recuperarse rápido.

---

## 1. Propósito y origen

El Hipo Fund se creó en abril de 2025 con los ingresos de la oferta inicial de HPO, junto con las reclamaciones de HPO de las temporadas de Hipo Club. Ese capital no se asignó al equipo ni se absorbió en el presupuesto operativo de Hipo. Se colocó en una tesorería separada y públicamente visible, y se apartó para trabajar en favor del ecosistema de Hipo y de los holders de HPO en un horizonte medido en años.

Este documento establece cómo se invierte ese capital: qué puede tener el fondo, cuánto puede tener de cada cosa, quién decide qué, cómo vuelve el valor a los holders de HPO y cómo se informa de todo ello.

Una política escrita hace que las decisiones sean repetibles, de modo que el comportamiento del fondo no dependa de quién esté prestando atención ese mes. Las hace revisables, para que la comunidad pueda juzgar el proceso y no solo el resultado. Y pone los límites antes de que hagan falta, cuando es fácil ponerse de acuerdo sobre ellos.

Una vez ratificada por votación de la DAO, esta política es vinculante para los firmantes del fondo.

---

## 2. Mandato y objetivos

El Hipo Fund es una tesorería de inversión a largo plazo. Sus objetivos, por orden de prioridad:

1. **Preservar el capital** a lo largo de ciclos de mercado completos.
2. **Hacer crecer el valor real del fondo** en un horizonte medido en años.
3. **Devolver una parte de ese crecimiento a los holders de HPO**, de forma sostenible y sin consumir el principal.

### Qué no es el Hipo Fund

- **No es una cuenta de trading.** No toma posiciones a corto plazo ni intenta anticipar los movimientos del mercado.
- **No es una fuente de liquidez de mercado para HPO.** Aportar liquidez al mercado de HPO es una decisión de tokenómica financiada con las asignaciones de tesorería y de marketing de HPO.
- **No es una fuente de fondos operativos.** El fondo está separado del presupuesto operativo de Hipo y no se puede recurrir a él para gastos.

### 2.1 Cómo devuelve valor el Hipo Fund a los holders de HPO

Hipo devuelve valor a los holders de HPO a partir de sus fuentes de ingresos, de dos formas ya establecidas: mediante el reparto de ingresos de Hipo Club y comprando HPO en el mercado para quemarlo. La idea es que el Hipo Fund se convierta en otra de esas fuentes.

Cuando el fondo crece por encima de su marca de agua máxima, cada año se asigna a los holders de HPO una parte de ese crecimiento conforme a la regla de la sección 2.2. La forma que adopta —reparto de ingresos o compra y quema— se elige cuando toca hacer un reparto, usando la infraestructura que Hipo ya tiene en marcha.

Ambas formas devuelven valor real; lo hacen de manera distinta, y la elección debe reflejar las condiciones del momento:

- **La compra y quema** reduce de forma permanente el suministro de HPO y beneficia a todos los holders sin que nadie tenga que reclamar nada. Crea el mayor valor cuando HPO cotiza por debajo de lo que respaldan los activos del fondo y los fundamentales del protocolo, ya que una quema solo aporta valor si los tokens se compran por debajo de lo que valen. Su costo es el impacto de mercado: en un mercado poco profundo, una parte del gasto mueve el precio en lugar de comprar oferta.
- **El reparto de ingresos** pone cada dólar en manos de los holders a prorrata y sin impacto de mercado, y es la vía más eficiente siempre que HPO no esté claramente barato.

Además de esto, el valor del fondo como porcentaje de la capitalización de mercado circulante de HPO se publica en cada informe trimestral. Es la parte de la valoración de HPO respaldada por activos ajenos al propio token, y se informa de ella tanto si sube como si baja.

**Una nota sobre la escala.** Con el tamaño actual del fondo, un retorno de valor sería modesto, y no hay ninguno pagadero mientras el fondo esté por debajo de su marca de agua máxima. La regla importa por lo que compromete: da a los holders de HPO un derecho definido y publicado sobre el crecimiento del fondo, que escala a medida que el fondo crece y que no se puede cambiar sin una votación de la DAO.

### 2.2 La regla del retorno de valor

**Marca de agua máxima (high-water mark).** El capital total aportado al fondo, más todo lo que el fondo ya ha devuelto a los holders de HPO. Ahora mismo está en unos **224.056 $**. Sube cuando se aporta capital nuevo y por el importe de cada retorno de valor. Nunca baja.

**Por debajo de la marca de agua máxima no se devuelve nada.** Primero se reconstruye el capital. Pagar por debajo de la marca es pagar con el principal.

**Por encima de ella**, en cada ejercicio el fondo asigna al retorno de valor de HPO el **menor** de estos dos importes:

- el **50 % del valor del fondo por encima de la marca de agua máxima**, y
- el **2 % del valor total del fondo** al inicio del año

#### Por qué hay dos límites

Los dos tramos hacen cosas distintas.

**El tramo del 50 % decide si hay algo que devolver.** Mide el fondo frente a todo lo que se ha aportado a él o se ha pagado desde él, de modo que un año en el que el fondo no crece no produce nada, y en ningún caso se reparte más de la mitad del crecimiento acumulado del fondo. La otra mitad sigue invertida y sigue trabajando.

**El límite anual decide a qué velocidad se paga.** En la mayoría de los años es el límite que manda; el tramo del 50 % solo se aplica en la franja estrecha justo por encima de la marca de agua máxima. Es algo deliberado. Un fondo que paga mucho tras un año fuerte y nada durante los tres siguientes sirve peor a los holders que uno que paga de forma constante, y una tesorería de este tamaño necesita más su capitalización que un único pago grande.

**El límite marca el ritmo del pago. No lo cancela.** Como la marca de agua máxima solo sube por lo que realmente se devuelve, el crecimiento retenido por el límite se queda por encima de la marca y sigue siendo repartible en años posteriores. Nada de lo que cumple los requisitos se pierde: queda en cola.

_Ejemplo práctico._ Supongamos que el fondo llega a 300.000 $ frente a una marca de agua máxima de 224.056 $. El crecimiento por encima de la marca es de 75.944 $, así que el tramo del 50 % permite 37.972 $, pero el límite reduce el retorno del año a 6.000 $. La marca de agua máxima sube a 230.056 $. Si el valor del fondo no cambia al año siguiente, el crecimiento por encima de la marca es de 69.944 $, el límite vuelve a permitir 6.000 $ y se pagan. La cantidad limitada no se pierde: se devuelve a lo largo de los años siguientes.

#### La cantidad no es una decisión

Cuando el fondo está por encima de su marca de agua máxima, la asignación es un cálculo que se hace en el informe trimestral, no una propuesta. Una vez calculada, se aparta para los holders de HPO, se informa de ella como cantidad comprometida hasta que se pague y no se puede reabsorber en el fondo.

**Solo se vota la forma.** Los firmantes proponen reparto de ingresos, compra y quema, o una combinación de ambos, con su razonamiento, y la DAO ratifica la forma. Una propuesta que no se ratifica se revisa y se vuelve a presentar: la asignación en sí no decae. Si no se ha ratificado ninguna forma en los 90 días siguientes al informe que la activó, la asignación se ejecuta como compra y quema, que no necesita infraestructura externa y no se puede bloquear.

**La fórmula solo puede cambiarse por votación de la DAO.** Los firmantes pueden ejecutar un retorno de valor dentro de esta regla; no pueden modificarla, aplazarla ni renunciar a ella.

#### Condiciones

- El fondo sigue dentro de todos los límites de la sección 7 después del retorno
- Se financia con ingresos y con los importes ya realizados mediante el reequilibrio ordinario, nunca vendiendo Bitcoin por debajo de su banda, recurriendo a la Reserva de Oportunidad, vendiendo el HPO del fondo ni liquidando una posición con el único fin de generar una cantidad pagadera
- Si pagar la asignación completa sacara a algún segmento fuera de su banda, se paga todo lo que permitan las bandas y el resto se traslada al año siguiente, y la marca de agua máxima sube solo por la cantidad realmente pagada
- El cálculo completo se publica en el informe trimestral, incluida la marca de agua máxima antes y después

---

## 3. Gobernanza y derechos de decisión

| Decisión                                                         | Quién decide                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Enmendar esta política                                           | **Votación de la DAO** (vinculante)                                                                                |
| Cambiar la fórmula del retorno de valor                          | **Votación de la DAO** (vinculante)                                                                                |
| Reducir la posición en HPO                                       | **Votación de la DAO** (vinculante)                                                                                |
| Añadir una clase de activo no listada en la sección 5            | **Votación de la DAO** (vinculante)                                                                                |
| Introducir cualquier remuneración del gestor                     | **Votación de la DAO** (vinculante) — sección 14                                                                   |
| La forma que adopta un retorno de valor                          | Los firmantes proponen y la DAO ratifica. La **cantidad** es un cálculo según la sección 2.2 y no se somete a voto |
| Añadir un protocolo nuevo dentro de una clase de activo aprobada | Los firmantes, con anuncio en un plazo de 7 días                                                                   |
| Desplegar la Reserva de Oportunidad una vez salta un disparador  | Los firmantes, con anuncio en un plazo de 7 días                                                                   |
| Reequilibrar dentro de las bandas de la sección 6                | Los firmantes, con informe trimestral                                                                              |
| Plataforma, momento y ruta de ejecución                          | Los firmantes                                                                                                      |

La DAO fija el marco y los límites; los firmantes ejecutan dentro de ellos. Las operaciones individuales no se votan: una tesorería que necesita una votación para reequilibrar no puede reequilibrar.

**Anuncios.** Cualquier transacción individual por encima de **10.000 $**, y cualquier cambio que saque a un segmento fuera de su banda, se anuncia en los canales oficiales de Hipo en un plazo de 7 días.

---

## 4. Custodia

Todos los activos del fondo se guardan en billeteras multisig. Hay tres, cada una con una función.

| Billetera                      | Guarda                               | Firma  |
| ------------------------------ | ------------------------------------ | ------ |
| Multisig de TON `hipofund.ton` | hGRAM, HPO y GRAM para gas           | 2 de 3 |
| Multisig Safe de EVM           | Stablecoins y posiciones de préstamo | 2 de 3 |
| Multisig de Bitcoin            | BTC                                  | 2 de 3 |

- Las tres usan los mismos tres firmantes, todos miembros del equipo de Hipo.
- **Ningún activo del fondo se guarda en una billetera de firma única.**
- **El fondo no saca activos de una multisig para cumplir un requisito de elegibilidad.** Si un sistema de Hipo no admite billeteras multisig, se cambia el sistema y no el esquema de custodia. La compatibilidad con multisig es un requisito previo antes de que el fondo participe en cualquier mecanismo de reparto.
- Ningún activo del fondo se guarda en un exchange centralizado, con un custodio ni en ninguna cuenta controlada por una sola persona, salvo en tránsito conforme a la sección 4.1.
- El Bitcoin se mantiene de forma nativa, no envuelto. Cada envoltorio reintroduce un custodio, y este segmento no necesita ser productivo.

### 4.1 Mover activos entre cadenas

Las transferencias entre cadenas usan un puente on-chain con una ruta verificada y activa, ejecutada en tramos en lugar de en una sola transacción.

Cuando no existe una ruta on-chain fiable, una transferencia puede pasar por una cuenta de exchange perteneciente a un firmante, siempre que se cumpla todo lo siguiente:

- No más del **15 % del fondo** en tránsito a la vez
- Completada en **72 horas**
- Ambos tramos publicados en el siguiente informe trimestral con los hashes de transacción de cada cadena
- Acordada por al menos dos firmantes antes de empezar

Esto es un recurso de último término, no la opción por defecto. Durante el tránsito, los activos quedan fuera del control multisig y fuera del registro on-chain del que depende la transparencia del fondo. Los límites son lo que hace esa ventana lo bastante estrecha como para aceptarla.

---

## 5. Activos elegibles

El fondo solo puede tener lo siguiente. Cualquier otra cosa requiere una votación de la DAO.

**Permitido**

- **Bitcoin**, mantenido de forma nativa
- **Stablecoins respaldadas por dinero fiduciario** de emisores que publican atestaciones de sus reservas; ahora mismo USDT, USDC y USDS
- **hGRAM**
- **HPO**, solo por el saldo existente — sección 8
- **Depósitos en protocolos de préstamo blue-chip** que cumplan todo lo siguiente: al menos 1000 millones de dólares de TVL, tres o más auditorías independientes, 24 meses o más en funcionamiento sin pérdidas de fondos de usuarios no recuperadas, y retirada directa conforme a la sección 5.2
- **Saldos nativos de gas** en las cantidades necesarias para operar

**No permitido**

- Apalancamiento, endeudamiento, margen o cualquier posición que pueda ser liquidada
- Futuros perpetuos, opciones o cualquier derivado
- Creación de mercado, aportación de liquidez o vaults que tomen el otro lado de las posiciones de los traders
- **Dólares sintéticos cuyo respaldo sea una posición en derivados.** Se evaluó y se excluyó el USDe de Ethena: su rendimiento procede de las tasas de financiación de los perpetuos y no de reservas, sus posiciones cortas están en exchanges centralizados, su fondo de reserva es de aproximadamente el 1 % del suministro y su periodo de espera de 7 días para retirar del staking choca con la sección 9. En el momento de la evaluación no ofrecía ninguna prima de rendimiento frente al préstamo de stablecoins blue-chip. Es una operación de base (basis trade), no un activo de preservación de capital, y clasificarlo como tal tergiversaría el riesgo del fondo.
- Cualquier token con menos de 10 millones de dólares de volumen de negociación en 24 horas, aparte de la posición existente en HPO
- Compras de HPO para conservarlo — sección 8

### 5.1 El riesgo de congelación y el suelo que lo gestiona

Casi todo lo que tiene este fondo es un derecho frente a una empresa, y los emisores de stablecoins y de activos tokenizados pueden congelar una billetera concreta. Eso no es motivo para evitar ese tipo de activos —no existe una alternativa sin permisos a escala para el poder adquisitivo estable—, pero hay que dimensionarlo en lugar de ignorarlo.

- **Ningún emisor con capacidad de congelación puede superar el 30 % del fondo.**
- **Al menos el 20 % del fondo se mantiene en activos que ningún emisor, custodio o autoridad puede congelar por decisión unilateral.** Bitcoin es ahora mismo la única posición que cumple esta condición.

### 5.2 Retirada directa

Toda posición debe poder retirarse directamente desde el contrato inteligente, sin permiso de ningún operador, interfaz o intermediario. Antes de desplegar capital en un protocolo nuevo, los firmantes verifican que la retirada funciona mediante interacción directa con el contrato, con independencia del front end del protocolo.

Un protocolo que pueda limitar, pausar o condicionar la retirada a discreción de un operador no es elegible, sea cual sea su rendimiento. Para un fondo sin una fuente comprometida de capital nuevo, el capital que no se puede recuperar es una pérdida permanente.

### 5.3 Ampliar el universo a medida que crece el fondo

La lista de arriba es estrecha porque el fondo es pequeño: cada posición adicional cuesta el mismo esfuerzo de puesta en marcha, seguimiento e información que una grande, mientras que aporta un rendimiento demasiado pequeño como para notarse. Eso cambia a medida que el fondo crece.

| Tamaño del fondo, mantenido durante dos informes consecutivos | Qué queda disponible                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Menos de 250.000 $                                            | La lista de arriba                                                                         |
| 250.000 $ o más                                               | La DAO puede añadir **una** clase de activo más, limitada al 10 % del fondo                |
| 500.000 $ o más                                               | Un segmento oportunista de hasta el 10 % del fondo, dentro de las prohibiciones anteriores |

Cada ampliación requiere una votación de la DAO. Alcanzar un umbral hace que una incorporación sea posible, no automática.

---

## 6. Asignación objetivo

La posición en HPO queda fuera de la asignación objetivo. No se puede ampliar ni negociar en volumen, así que incluirla obligaría a todos los demás segmentos a reequilibrarse en torno a una cifra sobre la que el fondo no puede actuar.

**Posición no discrecional**

|     |                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| HPO | 9.023.524,44, en cartera. Sin compras para conservar. Reducciones solo conforme a la sección 8. **Tope de referencia del 25 % del fondo.** |

**Cartera discrecional**: todo lo demás:

| Segmento                               | Objetivo | Banda   | Propósito                                                                                |
| -------------------------------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| Rendimiento de stablecoins, desplegado | 45 %     | 35–55 % | Preservación del capital y los ingresos del fondo                                        |
| **Reserva de Oportunidad**             | 10 %     | 5–15 %  | Capital sin desplegar para grandes caídas — sección 6.1                                  |
| Bitcoin                                | 30 %     | 20–35 % | Depósito de valor a largo plazo; el activo del fondo no congelable y ajeno al ecosistema |
| hGRAM                                  | 12 %     | 8–18 %  | Alineación con Hipo, más el rendimiento del staking                                      |
| Liquidez operativa y gas               | 3 %      | 2–6 %   | Costos de transacción, colchón                                                           |

**Sobre hGRAM.** Su rendimiento está denominado en GRAM, así que la posición es una posición direccional en GRAM con un rendimiento asociado, más que un activo de ingresos. Parte del motivo para tenerla es la alineación con el protocolo al que pertenece el fondo, y ese es un motivo legítimo. Presentarla como ingresos no lo sería.

**Sobre Bitcoin.** No se presupone ningún rendimiento, ni debería presuponerse. Está dimensionado de modo que una caída del 70 % —que Bitcoin ya ha vivido antes— le cueste al fondo alrededor del 16 % de su valor. Dimensionado por tolerancia a la caída, no por convicción.

**Entrada.** Las nuevas posiciones en Bitcoin se construyen en tramos semanales iguales a lo largo de al menos ocho semanas. Una regla, no una opinión de mercado.

### 6.1 La Reserva de Oportunidad

El fondo mantiene el 10 % de su cartera discrecional en stablecoins, sin desplegar o en rendimientos con liquidez en el mismo día, para comprar en caídas severas. Se despliega **solo ante un disparador objetivo**, en tercios, en activos que ya están en la lista de elegibles:

| Disparador                                                | Despliega        |
| --------------------------------------------------------- | ---------------- |
| Bitcoin un 40 % por debajo de su máximo móvil de 12 meses | Un tercio        |
| Bitcoin un 55 % por debajo de su máximo móvil de 12 meses | Un tercio        |
| Bitcoin un 70 % por debajo de su máximo móvil de 12 meses | El último tercio |

El máximo móvil usa la serie de cierres diarios de la fuente de precios publicada del fondo. Una vez desplegada, la Reserva se reconstruye a partir del segmento de stablecoins a lo largo de los cuatro trimestres siguientes.

**Sin despliegue discrecional.** Si el disparador no ha saltado, el capital se queda donde está. El sentido de un disparador escrito es tomar la decisión por adelantado, cuando es fácil, y no durante las condiciones que la hacen difícil.

---

## 7. Límites de concentración y de riesgo

Medidos sobre el valor total del fondo y comprobados en cada informe trimestral.

| Límite                                                                              | Umbral                                               |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Cualquier protocolo individual                                                      | ≤ 30 % del fondo                                     |
| Cualquier emisor individual de stablecoins                                          | ≤ 30 % del fondo                                     |
| Cualquier emisor individual con capacidad de congelación, sumando todos los activos | ≤ 30 % del fondo                                     |
| Activos que ningún emisor puede congelar                                            | **≥ 20 % del fondo**                                 |
| Cualquier posición individual distinta de HPO                                       | ≤ 35 % del fondo                                     |
| HPO                                                                                 | ≤ 25 % del fondo (referencia — sección 8)            |
| Activos fuera de la custodia multisig                                               | **0 %**, salvo en tránsito conforme a la sección 4.1 |
| Activos del ecosistema de TON (HPO + hGRAM + GRAM)                                  | ≤ 45 % del fondo                                     |
| Apalancamiento                                                                      | Cero, en todo momento                                |

El límite de TON es la línea más importante de este documento. Los ingresos del fondo vienen de Hipo, su financiación viene de Hipo y parte de sus activos son los propios tokens de Hipo. Una tesorería concentrada en su propio ecosistema no amortigua un año difícil para ese ecosistema: lo amplifica. El límite mantiene al fondo útil precisamente cuando más se le necesita.

Si un límite se incumple por movimientos del mercado y no por una transacción, el fondo tiene un trimestre para volver a situarlo dentro, y el incumplimiento se revela en el informe de ese trimestre.

---

## 8. Política sobre HPO

**El fondo no compra HPO para conservarlo.** La posición del fondo ya es grande en relación con la liquidez de mercado de HPO, y ampliarla convierte capital líquido en una posición de la que el fondo no puede salir a nada parecido a su valor registrado. El trabajo del fondo es hacer crecer activos que se puedan desplegar, no acumular su propio token.

**Comprar HPO para quemarlo es una acción distinta y sí está permitida.** Conforme a la sección 2.2, el fondo puede comprar HPO en el mercado y destruirlo como una de las dos formas de devolver valor a los holders. Los tokens salen de circulación en lugar de incorporarse al balance del fondo, y se financia únicamente con ganancias por encima de la marca de agua máxima, nunca con capital.

**Reducir la posición existente.** El HPO del fondo se mantiene. Es la participación del fondo en su propio protocolo, y no hay forma de salir de ella en volumen en el mercado abierto.

Si alguna vez se reduce, será únicamente mediante una venta OTC a un comprador estratégico o una venta estructurada aprobada por votación de la DAO. **El fondo no vende HPO en el mercado abierto, sea cual sea el tamaño.** Cualquiera de las dos vías exige todo lo siguiente:

- **Una votación de la DAO** que apruebe la venta antes de ejecutarla
- **El uso de los importes obtenidos, indicado en la propuesta**: los holders votan sobre qué pasa con el dinero, no solo sobre si se venden los tokens
- **Divulgación completa al finalizar**, incluidos el tamaño, el precio y cualquier condición asociada a la venta

Los holders financiaron el capital con el que se compró esta posición. La votación y los requisitos de divulgación son lo que garantiza que cualquier venta se haga en unas condiciones que hayan visto y aprobado de antemano.

El tope del 25 % de la sección 7 es un nivel de referencia, no una venta forzosa. Si HPO se revaloriza por encima de él, el fondo informa del incumplimiento y la DAO decide si actúa.

---

## 9. Liquidez

- Al menos el **35 % del fondo** debe poder convertirse en stablecoins en 7 días sin pérdidas relevantes
- No más del **10 % del fondo** en posiciones con un periodo de bloqueo superior a 7 días
- Ninguna posición de la que el fondo no pudiera salir en 30 días, salvo HPO, que se revela como ilíquida en todos los informes

---

## 10. Reequilibrio

- **Revisado trimestralmente**, junto con el informe
- Reequilibrado cuando un segmento se sale **fuera de su banda**, no por calendario: los costos de transacción son reales frente a un fondo de este tamaño
- Reequilibrado de vuelta al punto medio del objetivo, ejecutado a lo largo de un periodo cuando el tamaño lo justifique
- Cualquier operación de reequilibrio por encima de 10.000 $ se anuncia en un plazo de 7 días

**El reequilibrio es la forma en que este fondo compra barato y vende caro.** Cuando Bitcoin cae por debajo de su banda, la regla obliga a comprar. Cuando sube por encima, la regla obliga a recortar. La decisión se toma por adelantado y se ejecuta de forma mecánica.

**El fondo no intenta identificar techos ni suelos de mercado.** Ninguna posición se abre, se cierra ni se redimensiona por una previsión o por el sentimiento del mercado. Actuar sobre una apuesta de mercado exige acertar dos veces —en la salida y en la reentrada—, con un proceso de firma de 2 de 3 que no puede moverse a esa velocidad. Las bandas y la Reserva de Oportunidad recogen esa misma intención mediante reglas que sí se pueden ejecutar.

---

## 11. Informes

- Un **informe completo cada trimestre**, generado a partir de un único bloque on-chain con
  [`scripts/hipo-fund-snapshot.mjs`](https://github.com/HipoFinance/website/blob/main/scripts/hipo-fund-snapshot.mjs),
  que indica el bloque, las tasas de cambio y todos los precios utilizados, para que cualquier lector pueda reproducirlo
- Cada informe incluye: la asignación frente a los objetivos de la sección 6, cada límite de la sección 7 con su valor actual, el **rendimiento desde el inicio por Modified Dietz**, un índice de referencia, el valor del fondo como porcentaje de la capitalización de mercado de HPO y todas las transacciones por encima de 10.000 $
- Las aportaciones se registran con el bloque y el precio del momento en que se reciben
- Los incumplimientos de límites se revelan, se hayan corregido o no
- Los informes se publican según el calendario, digan lo que digan las cifras

**Precios.** GRAM y Bitcoin a precio de mercado de un agregador publicado. hGRAM a la tasa de reembolso del protocolo: lo que recibiría el fondo al retirar del staking. HPO en CoinGecko, contrastado con la capitalización de mercado publicada de Hipo; se excluyen las cotizaciones de DEX con pools poco profundos. Stablecoins a 1,0000 por convención.

---

## 12. Revisión y enmienda

- Revisada **anualmente**, o antes si hay un cambio relevante: una entrada grande de capital, una nueva fuente de ingresos o un incumplimiento de límite que no se pueda corregir en un trimestre
- Las enmiendas requieren una **votación de la DAO**
- Se publican todas las versiones; las versiones sustituidas siguen disponibles en línea con sus fechas

---

## 13. Cuestiones abiertas conocidas

- **El fondo no tiene ninguna fuente comprometida de capital nuevo.** Las recompensas de staking de hGRAM son ahora mismo su única fuente de ingresos activa. Los acuerdos OTC y la vuelta de los ingresos del protocolo son ambos posibles; esta política no presupone ninguno de los dos.
- **El valor de la posición en HPO es un valor registrado, no un precio.** Todos los informes lo dicen y lo seguirán diciendo.
- **El HPO del fondo no genera ingresos** mientras la comisión de staking del protocolo esté al 0 %. Restablecer una comisión es una decisión aparte, pero ambas cosas interactúan: le daría un rendimiento a la mayor posición del fondo a la vez que reduciría el rendimiento de su hGRAM.

---

## 14. Remuneración del gestor

**Nadie cobra nada por gestionar el Hipo Fund. No hay comisión de gestión ni comisión de éxito.**

Esto se publica en lugar de dejarlo sin decir, porque la ausencia de comisión es en sí misma una política, y comprometer de antemano las condiciones para reabrir la cuestión evita que llegue más adelante una propuesta sin estructura.

Norges Bank Investment Management, que gestiona el fondo soberano en el que se inspira el Hipo Fund, cobra un presupuesto de costos reembolsado hasta un límite anual fijado por el Ministerio de Finanzas, no una parte de las ganancias. Sus costos de gestión fueron del **0,034 % de los activos en 2024**. Las comisiones ligadas al rendimiento se aplican allí a los gestores externos, no al gestor del propio fondo.

Hay otras dos cosas que también juegan en contra de tenerla aquí. Una comisión de éxito le da al gestor el lado bueno sin el lado malo, que es el incentivo equivocado para un fondo pequeño con un mandato de preservación de capital. Y la alineación ya existe de una forma mejor: los firmantes tienen HPO, así que si el fondo capitaliza, el respaldo de HPO se refuerza; exposición al resultado completo, incluido el lado malo.

**Si se reabre la cuestión**, requerirá una votación de la DAO y solo podrá proponerse cuando el fondo esté por encima de **500.000 $**, por encima de su marca de agua máxima, y haya mantenido ambas cosas durante **dos informes trimestrales consecutivos**. Toda propuesta deberá incluir: solo comisión de éxito y ninguna comisión de gestión; una marca de agua máxima estricta; una rentabilidad mínima (hurdle rate) por encima de un índice de referencia de rendimiento de stablecoins; pago en HPO bloqueado durante al menos 12 meses; y un tope anual como porcentaje de los activos.

**Si gestionar el fondo llega a requerir tiempo remunerado**, se paga con el presupuesto operativo de Hipo como un puesto definido con un costo fijo, no con el fondo y no como una parte de los rendimientos. Eso mantiene la remuneración separada de los resultados de la inversión, que es lo que exige un mandato de preservación de capital.
