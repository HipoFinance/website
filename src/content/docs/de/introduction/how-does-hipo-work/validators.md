---
title: 'Validatoren'
---

## GRAM-Token an Validatoren verleihen

1. **Erlaubnisfreies Validator-Modell**: Hipo verleiht gestaktes GRAM über ein offenes Modell an Validatoren — jeder Validator kann bieten, ohne Zustimmung von Hipo.
2. **Auktionsmodell für Validatoren**: In jeder Validierungsrunde bieten Validatoren darauf, gestaktes GRAM zu leihen, indem sie die Reward-Rate nennen, die sie zahlen werden. Die Contracts von Hipo wählen die besten Gebote automatisch aus, sodass Staker den besten in dieser Runde verfügbaren Kurs erhalten.
3. **Sicherer Ablauf**: Alle Abläufe — vom Leihen des gestakten GRAM bis zur Verteilung der Rewards — werden sicher über die Smart Contracts von Hipo ausgeführt. Das Protokoll hat [Sicherheitsaudits](https://github.com/HipoFinance/audits) durchlaufen, um die Integrität und Sicherheit der Nutzergelder zu gewährleisten.
4. **Sicherheiten des Validators**: Ein kreditnehmender Validator muss eigenes GRAM sperren, das die maximale Slashing-Strafe der Runde plus den zugesagten Reward abdeckt. Eine Strafe wird aus diesen Sicherheiten genommen, nicht aus dem gestakten GRAM.

<figure><img src="/docs/images/introduction-how-does-hipo-work-validators-1.jpg" alt="Diagramm: Das Hipo-Protokoll verleiht GRAM an einen Validator, der auf TON validiert und das GRAM samt Staking-Rewards zurückgibt."></figure>
