import type { FormEvent } from 'react'
import type { Model } from './Model'

// Shared onInput handler for the amount field on /stake/ and /unstake/ (desktop and the Telegram Mini
// App variant both wire this in). By the time this handler runs, the browser has already spliced the
// typed character into the DOM's value and moved the caret past it — that happens before React ever
// sees the event. model.setAmount can refuse the keystroke (Model.ts: a single-character append that
// types a viable amount into a dead end, like the second "," in "0,,"), in which case model.amountRaw
// stays exactly what it was. A controlled input would eventually resync to that on React's next
// render regardless, but nothing forces one here, so the DOM would sit ahead of the model — showing
// the rejected character and a caret past it — until some unrelated update happened to re-render the
// field. So the rejection is made visible immediately: put the DOM value back to what the model kept,
// and the caret back one position (the guard only ever fires on an append, so "one position back" is
// always the end of the restored value).
export function onAmountInput(model: Model, event: FormEvent<HTMLInputElement>): void {
  const input = event.currentTarget
  const caret = input.selectionStart
  model.setAmount(input.value)
  if (model.amountRaw !== input.value) {
    input.value = model.amountRaw
    if (caret !== null) {
      input.setSelectionRange(caret - 1, caret - 1)
    }
  }
}
