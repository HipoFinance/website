---
title: 'Validadores'
---

## Emprestar tokens GRAM aos validadores

1. **Modelo de validadores sem permissão**: a Hipo empresta o GRAM em staking aos validadores por meio de um modelo aberto — qualquer validador pode dar um lance, sem aprovação da Hipo.
2. **Modelo de leilão entre validadores**: em cada rodada de validação, os validadores dão lances para tomar emprestado o GRAM em staking informando a taxa de recompensa que vão pagar. Os contratos da Hipo escolhem automaticamente os melhores lances, então os stakers ficam com a melhor taxa disponível naquela rodada.
3. **Processo seguro**: todos os processos, incluindo o empréstimo do GRAM em staking e a distribuição das recompensas, são executados com segurança pelos contratos inteligentes da Hipo. O protocolo passou por [auditorias de segurança](https://github.com/HipoFinance/audits) para garantir a integridade e a proteção dos fundos dos usuários.
4. **Garantia do validador**: um validador que toma emprestado precisa bloquear GRAM próprio suficiente para cobrir a penalidade máxima de slashing da rodada mais a recompensa que prometeu. Uma penalidade é descontada dessa garantia, não do GRAM em staking.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagrama: o protocolo Hipo empresta GRAM a um validador, que valida na TON e devolve o GRAM mais as recompensas de staking."></figure>
