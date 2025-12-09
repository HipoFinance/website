import { makeObservable, observable, action, computed } from 'mobx'

const cookieBannerClosed = 'banner.closed'

export class Model {
    isBannerClosed = false
    isMenuHidden = true

    marketCap = -1
    totalVolume = -1
    holdersCount = -1

    constructor() {
        makeObservable(this, {
            isBannerClosed: observable,
            isMenuHidden: observable,
            marketCap: observable,
            totalVolume: observable,
            holdersCount: observable,

            updateHpoData: action,
            setMarketCap: action,
            setTotalVolume: action,
            setHoldersCount: action,
            closeBanner: action,
            toggleMenu: action,

            getMarketCap: computed,
            getTotalVolume: computed,
            getHoldersCount: computed,
        })
    }

    init() {
        this.updateHpoData()

        const value = getCookie(cookieBannerClosed)
        this.isBannerClosed = value === 'closed'
    }

    closeBanner() {
        this.isBannerClosed = true
        setCookie(cookieBannerClosed, 'closed', 24)
    }

    toggleMenu() {
        this.isMenuHidden = !this.isMenuHidden
    }

    get getMarketCap() {
        if (this.marketCap > 0) {
            return '$' + formatCompact1Fraction(this.marketCap)
        } else {
            return '-'
        }
    }

    get getTotalVolume() {
        if (this.totalVolume > 0) {
            return '$' + formatCompact1Fraction(this.totalVolume)
        } else {
            return '-'
        }
    }

    get getHoldersCount() {
        if (this.holdersCount > 0) {
            return formatCompact1Fraction(this.holdersCount)
        } else {
            return '-'
        }
    }

    setMarketCap(val: number) {
        this.marketCap = val
    }

    setTotalVolume(val: number) {
        this.totalVolume = val
    }

    setHoldersCount(val: number) {
        this.holdersCount = val
    }

    updateHpoData = () => {
        let timer = setTimeout(this.updateHpoData, 300_000)

        fetch('https://gauge.hipo.finance/data')
            .then((res) => res.json())
            .then(
                (res: {
                    ok: boolean
                    result: {
                        hpo: {
                            holders_count: number
                            market: {
                                market_cap: { usd: number }
                                total_volume: { usd: number }
                            }
                        }
                    }
                }) => {
                    this.setMarketCap(
                        res.ok && res.result.hpo.market.market_cap.usd > 0 ? res.result.hpo.market.market_cap.usd : -1,
                    )

                    this.setTotalVolume(
                        res.ok && res.result.hpo.market.total_volume.usd > 0
                            ? res.result.hpo.market.total_volume.usd
                            : -1,
                    )

                    this.setHoldersCount(res.ok && res.result.hpo.holders_count > 0 ? res.result.hpo.holders_count : -1)
                },
            )
            .catch(() => {
                clearTimeout(timer)
                timer = setTimeout(this.updateHpoData, 5000)
            })
    }

    dummyTrue() {
        return true
    }
}

function setCookie(name: string, value: string, hours: number) {
    const d = new Date()
    d.setTime(d.getTime() + hours * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${d.toUTCString()}; path=/; SameSite=Lax; Secure`
}

function getCookie(name: string): string | null {
    const cookie = document.cookie
    const regexp = new RegExp('(^| )' + name + '=([^;]+)')
    const match = regexp.exec(cookie)

    return match ? match[2] : null
}

function formatCompact1Fraction(n: number): string {
    return n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })
}
