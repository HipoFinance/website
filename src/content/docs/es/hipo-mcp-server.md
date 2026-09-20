---
title: 'Hipo MCP Server'
description: 'Conecta Claude, Cursor o cualquier cliente de IA compatible con MCP a la documentación y a los datos on-chain en vivo de Hipo.'
---

## ¿Qué es el Hipo MCP Server?

El Hipo MCP Server es un servicio pequeño y de código abierto que permite a los asistentes de IA acceder a datos relacionados con Hipo, incluida información sobre el staking de GRAM y otros temas. Habla el [Model Context Protocol](https://modelcontextprotocol.io/) (MCP), un estándar abierto para conectar clientes de IA con datos externos, de modo que cualquier cliente compatible con MCP —Claude, Claude Code, Cursor y otros— puede consultar la documentación de Hipo y los números on-chain en vivo en lugar de adivinarlos de memoria.

Una vez conectado, tu asistente puede responder preguntas como:

- _¿Cuál es la tasa de cambio hGRAM/GRAM actual y qué APY implica?_
- _¿Cuánto GRAM hay en staking en Hipo ahora mismo?_
- _¿Cuándo termina la ronda de validación en curso y cuándo acuñará hGRAM mi depósito diferido?_
- _¿Cuál es el saldo de hGRAM de esta dirección y cuánto vale en GRAM?_
- _¿Qué comisión de gas debería adjuntar a un depósito?_

Las respuestas salen de los getters de los contratos inteligentes de Hipo en TON, no de los datos de entrenamiento del modelo, así que están actualizadas al momento en que preguntas.

El servidor es estrictamente de **solo lectura**. No guarda claves, no firma nada y no envía mensajes a la blockchain. Puede mirar, pero nunca puede mover tus fondos: conectarlo no es una vía para que nadie haga staking, retire del staking ni transfiera en tu nombre.

## Conexión

### Servidor alojado (recomendado)

Hipo mantiene una instancia pública. Apunta tu cliente MCP a:

```
https://mcp.hipo.finance/mcp
```

En [Claude Code](https://claude.com/product/claude-code) basta con un comando:

```sh
claude mcp add --transport http hipo https://mcp.hipo.finance/mcp
```

Eso registra el servidor para el proyecto actual. Para poder usarlo desde todos los proyectos, añade `-s user`; aquí `user` es una palabra clave literal de ámbito, no un marcador de posición para tu nombre de usuario:

```sh
claude mcp add -s user --transport http hipo https://mcp.hipo.finance/mcp
```

En cualquier caso, usa el comando en lugar de editar a mano un archivo de configuración: Claude Code guarda sus servidores MCP en su propia configuración, y un bloque `mcpServers` colocado en `settings.json` se ignora. Ejecuta `claude mcp list` para confirmar que el servidor está conectado y reinicia Claude Code después: los servidores se conectan al arrancar, así que uno recién añadido no está disponible en una sesión que ya está en marcha.

Otros clientes se configuran con un archivo JSON (Claude Desktop, Cursor y la mayoría) y toman una entrada como esta:

```json
{
  "mcpServers": {
    "hipo": {
      "type": "http",
      "url": "https://mcp.hipo.finance/mcp"
    }
  }
}
```

### Ejecutarlo en local

Si prefieres ejecutar el servidor tú mismo, está publicado en npm como [`@hipo-finance/mcp`](https://www.npmjs.com/package/@hipo-finance/mcp) y habla stdio. Requiere Node.js 20 o superior:

```sh
claude mcp add hipo -- npx -y @hipo-finance/mcp
```

Aquí vale el mismo consejo: añádelo con el comando, no editando un archivo a mano. Para otros clientes, la entrada de configuración JSON es:

```json
{
  "mcpServers": {
    "hipo": {
      "command": "npx",
      "args": ["-y", "@hipo-finance/mcp"]
    }
  }
}
```

## Herramientas

Estas son las preguntas que el servidor puede responder. Tu cliente de IA elige la herramienta adecuada por sí mismo: tú preguntas en lenguaje natural.

| Herramienta          | Qué devuelve                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_exchange_rate`  | La tasa hGRAM↔GRAM actual, el total de GRAM en staking, el suministro de hGRAM y el APY reciente derivado de las actualizaciones de tasa on-chain                                      |
| `get_treasury_state` | Totales de la tesorería: TVL en GRAM, suministro de hGRAM, depósitos y unstakings pendientes, participaciones en rondas activas, el indicador de parada y los parámetros de gobernanza |
| `get_round_timing`   | Tiempos de la ronda de validación: límites de la ronda actual y de la siguiente, la ventana de participación en las elecciones y cuánto tiempo siguen congelados los depósitos         |
| `get_fees`           | Las comisiones de gas actuales para depósitos, unstakings y solicitudes de préstamo                                                                                                    |
| `get_wallet_status`  | El saldo de hGRAM de una dirección dada, su valor en GRAM y cualquier staking o unstaking pendiente                                                                                    |
| `get_reward_history` | El historial de recompensas de staking en GRAM de una dirección dada por ronda, incluidos el nivel de Hipo Club y las recompensas en HPO                                               |
| `get_participation`  | La participación de Hipo en una ronda de validación: estado, número de préstamos, totales y hora de liberación de los depósitos                                                        |
| `get_loan_info`      | El contrato de préstamo de un prestatario por ronda: dirección, estado de despliegue, saldo y partes implicadas                                                                        |
| `get_max_punishment` | La penalización máxima que el protocolo puede aplicar para un depósito de validador dado                                                                                               |

Las cuatro primeras herramientas no necesitan ninguna entrada. `get_wallet_status`, `get_reward_history` y `get_loan_info` toman una dirección de TON —la dirección propia del titular o del prestatario, no la de su billetera jetton— y `get_max_punishment` toma una cantidad de staking en GRAM. `get_participation` y `get_loan_info` también aceptan una hora de inicio de ronda, pero es opcional: si la omites, informan de la ronda actual.

Todas las respuestas llevan el mismo recordatorio de que las herramientas devuelven datos del protocolo en vivo, no asesoramiento financiero: los valores cambian en cada ronda de validación y no se garantiza ningún rendimiento.

## Recursos de documentación

Además de los datos en vivo, el servidor expone los documentos técnicos de Hipo como recursos MCP, obtenidos de sus ubicaciones públicas canónicas para que estén siempre actualizados:

| Recurso                    | Contenido                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `hipo://docs/overview`     | El README del repositorio de contratos inteligentes: resumen del protocolo y direcciones desplegadas |
| `hipo://docs/architecture` | Los contratos, la máquina de estados de la ronda de validación y los invariantes del protocolo       |
| `hipo://docs/integration`  | Los esquemas de mensajes y la guía de integración para billeteras y otros protocolos                 |
| `hipo://docs/schema`       | Los esquemas TL-B completos de todos los contratos de Hipo                                           |
| `hipo://docs/knowledge`    | La base de conocimiento curada de Hipo ([llms.txt](https://hipo.finance/llms.txt))                   |

## Ejemplo

Una llamada a `get_exchange_rate` devuelve JSON plano. Los números cambian en cada ronda, así que tómalos como una forma, no como valores actuales:

```json
{
  "oneHgramInGram": "1.143623345",
  "oneGramInHgram": "0.874413769",
  "totalCoinsGram": "2501952.200844389",
  "totalTokensHgram": "2187741.455006677",
  "recentApy": "15.59%",
  "apyNote": "APY is derived from the last on-chain rate update (current_rate / previous_rate compounded to a year). Rewards accrue in the exchange rate: hGRAM becomes worth more GRAM over time; there is no separate claim.",
  "disclaimer": "Live protocol data, not financial advice. Values change every validation round and no returns are guaranteed."
}
```

El servidor nunca reimplementa las matemáticas del protocolo. Cada número de arriba viene de un getter de contrato, y el repositorio de contratos es la fuente de verdad para las direcciones desplegadas.

## Autoalojamiento

El servidor tiene licencia MIT y vive en [github.com/HipoFinance/mcp](https://github.com/HipoFinance/mcp). Incluye dos transportes —`stdio` para clientes locales y HTTP en streaming para un despliegue alojado— y un Dockerfile:

```sh
docker build -t hipo-mcp .
docker run -p 3000:3000 -e TONCENTER_API_KEY=... hipo-mcp
```

Toda la configuración es opcional; los valores por defecto apuntan a mainnet a través de la API pública de toncenter.

| Variable de entorno        | Valor por defecto                      | Para qué sirve                                                                                                                       |
| -------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `HIPO_NETWORK`             | `mainnet`                              | `mainnet` o `testnet`                                                                                                                |
| `TONCENTER_ENDPOINT`       | `https://toncenter.com/api/v2/jsonRPC` | Endpoint de la API HTTP de TON                                                                                                       |
| `TONCENTER_API_KEY`        | _(ninguno)_                            | Clave de la API de toncenter; sin ella se aplica el límite de peticiones público, y las llamadas limitadas se reintentan con backoff |
| `TONCENTER_API_KEY_FILE`   | _(ninguno)_                            | Ruta a un archivo que contiene la clave de la API, como un secreto de Docker; tiene prioridad sobre `TONCENTER_API_KEY`              |
| `HIPO_STATE_CACHE_SECONDS` | `5`                                    | Cuánto tiempo se cachean entre llamadas el estado de la tesorería, los tiempos y las comisiones                                      |
| `HIPO_DOCS_CACHE_SECONDS`  | `300`                                  | Cuánto tiempo se cachean los recursos de documentación                                                                               |
| `HIPO_REWARDS_API_BASE`    | `https://api.hipogang.io`              | URL base de la API de recompensas de Hipo; déjala vacía para desactivar `get_reward_history`                                         |
| `PORT` / `HOST`            | `3000` / `0.0.0.0`                     | Solo para el transporte HTTP                                                                                                         |
