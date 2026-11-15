import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Check, ChevronDown, Copy, LogOut } from 'lucide-react'
import { Model } from './Model'

interface Props {
  model: Model
  pillClassName: string
  panelClassName?: string
  className?: string
}

// The connected-wallet pill as a small dropdown (Copy address, Disconnect), shared by Header.tsx
// and tma/TmaHeader.tsx. A tap on your own address used to disconnect at once; now Disconnect is
// two taps, and the pill is narrower because it no longer spells out "Disconnect".
const WalletMenu = observer(({ model, pillClassName, panelClassName, className }: Props) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Read by the copy callback, which can resolve after the menu has closed: a slow clipboard write
  // must not then start a timer that would close the menu the next time it opens.
  const openRef = useRef(open)
  openRef.current = open

  // A click outside the component closes the menu, as does Escape; the pill is inside the ref, so
  // its own onClick does the toggling.
  useEffect(() => {
    if (!open) {
      return
    }
    const onClick = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // However the menu closes (outside click, Escape, the pill, the copy timer), a pending "Address
  // copied" timer is dropped: left running it would close a menu reopened within its 1.5 s.
  useEffect(() => {
    if (!open) {
      clearTimeout(timerRef.current)
      setCopied(false)
    }
  }, [open])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const itemClass =
    'hover:bg-surface-deep hover:text-accent text-text-muted flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-start text-sm font-medium whitespace-nowrap'

  return (
    <div ref={rootRef} className={'relative shrink-0' + (className == null ? '' : ' ' + className)}>
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label={model.t('app.header.walletMenu', { address: model.isolate(model.connectedAddressShort) })}
        className={pillClassName + ' flex items-center gap-1.5'}
        onClick={() => {
          setOpen(!open)
        }}
      >
        <bdi className='num'>{model.connectedAddressShort}</bdi>
        <ChevronDown
          className={'size-3.5 shrink-0 transition-transform' + (open ? ' rotate-180' : '')}
          aria-hidden='true'
        />
      </button>

      {open && (
        <div
          role='menu'
          className={
            'border-border bg-surface absolute end-0 top-full z-20 mt-2 min-w-44 rounded-xl border py-1.5 shadow-lg ' +
            (panelClassName ?? '')
          }
        >
          <button
            type='button'
            role='menuitem'
            className={itemClass}
            onClick={() => {
              // No clipboard API at all (an insecure origin) does nothing rather than throw.
              navigator.clipboard?.writeText(model.connectedAddressFriendly).then(
                () => {
                  if (!openRef.current) {
                    return
                  }
                  setCopied(true)
                  clearTimeout(timerRef.current)
                  timerRef.current = setTimeout(() => {
                    setCopied(false)
                    setOpen(false)
                  }, 1500)
                },
                () => undefined,
              )
            }}
          >
            {copied ? (
              <Check className='size-4 shrink-0' aria-hidden='true' />
            ) : (
              <Copy className='size-4 shrink-0' aria-hidden='true' />
            )}
            {copied ? model.t('app.header.addressCopied') : model.t('app.header.copyAddress')}
          </button>
          <button
            type='button'
            role='menuitem'
            className={itemClass}
            onClick={() => {
              setOpen(false)
              model.disconnect()
            }}
          >
            <LogOut className='size-4 shrink-0' aria-hidden='true' />
            {model.t('app.header.disconnect')}
          </button>
        </div>
      )}
    </div>
  )
})

export default WalletMenu
