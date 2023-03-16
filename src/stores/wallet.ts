import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { TonConnect, WalletInfo } from '@tonconnect/sdk'
import { TonClient, Address, beginCell, Slice, toNano } from 'ton'
import { getHttpEndpoint } from '@orbs-network/ton-access'
import { toUserFriendlyAddress } from '@tonconnect/sdk'
import { RecipientPayload } from './Root'

export const useWalletStore = defineStore('wallet', () => {
    const testnet = true
    /* cspell: disable-next-line */
    const rootAddress = Address.parseFriendly(
        'EQD5SxgI2HAWJCJVsKKdZFbdkSGX4v2tBGqRWIHXrqr6_wvJ',
    ).address

    function setRestore(value: boolean) {
        // localStorage.setItem('stake-hipo.wallet', JSON.stringify(walletInfo));
        localStorage.setItem('stake-hipo.restore-connection', JSON.stringify(value))
    }
    function getRestore(): boolean {
        const d = localStorage.getItem('stake-hipo.restore-connection')
        if (d == null) {
            return false
        }
        return JSON.parse(d)
    }

    const wallet: {
        connected: boolean
        address: string
        balance: string
        list: any[]
        testnet: boolean
    } = reactive({
        connected: false,
        address: '',
        balance: '',
        list: [],
        testnet,
    })

    const connector = new TonConnect({
        manifestUrl: 'https://github.com/StakeHipo/website/raw/main/public/manifest.json',
    })

    connector.getWallets().then((ws) => {
        wallet.list = ws
    })

    // eslint-disable-next-line no-unused-vars
    const unsubscribe = connector.onStatusChange(async (walletInfo) => {
        if (walletInfo == null) {
            setRestore(false)
            wallet.connected = false
            wallet.address = ''
            wallet.balance = ''
            return
        }

        wallet.address = toUserFriendlyAddress(connector.account?.address || '', testnet)
        wallet.balance = (await getBalance(wallet.address)).toString()
        wallet.connected = true
        if (cb) {
            cb()
            cb = null
        }
        setRestore(true)
    })

    if (getRestore()) {
        connector.restoreConnection()
    }

    let cb: Function | null = null
    function connectTo(index: number, callback: Function | null) {
        const walletConnectionSource: {
            universalLink: string
            bridgeUrl: string
        } = {
            universalLink: wallet.list[index]['universalLink'],
            bridgeUrl: wallet.list[index]['bridgeUrl'],
        }
        cb = callback
        return connector.connect(walletConnectionSource)
    }

    function disconnect() {
        if (!connector.connected) {
            return
        }
        unsubscribe() // TODO It seems this does not work ?!
        connector.disconnect()
        setRestore(false)
        wallet.address = ''
        wallet.balance = ''
        wallet.connected = false
    }

    async function getBalance(address: string) {
        const client = new TonClient({
            endpoint: await getHttpEndpoint({ network: testnet ? 'testnet' : 'mainnet' }),
        })

        return await client.getBalance(Address.parseFriendly(address).address)
    }

    connector.wallet?.provider

    async function sendDeposit(
        stakeAmount: bigint,
        recipientOwner?: Address,
        queryId?: bigint,
        returnExcess?: Address,
        notificationTonAmount?: bigint,
        notificationPayload?: Slice,
    ) {
        if (!connector.connected) {
            console.log('Not connected')
            return
        }

        if (connector.account == null) {
            console.log('Account was null')
            return
        }

        const userAddress = Address.parseRaw(connector.account.address)

        const payload = beginCell()
            .storeUint(0x696aace0, 32)
            .storeUint(queryId || 0, 64)
            .storeCoins(stakeAmount)
            .storeAddress(recipientOwner || userAddress)
            .storeAddress(returnExcess || userAddress)
            .storeCoins(notificationTonAmount || 0)
            .storeSlice(notificationPayload || beginCell().storeUint(0, 1).endCell().beginParse())
            .endCell()
            .toBoc()
            .toString('base64')

        const result = await connector.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [
                {
                    address: rootAddress.toRawString(),
                    amount: (stakeAmount + toNano('0.5')).toString(),
                    payload,
                },
            ],
        })

        // TODO parse the boc for information.
        // const c = Cell.fromBase64(boc)

        console.log('transaction result:', result)
    }

    async function sendWithdraw(
        stakeAmount: bigint,
        queryId?: bigint,
        returnExcess?: Address,
        recipientPayload?: RecipientPayload,
    ) {
        if (!connector.connected) {
            console.log('Not connected')
            return
        }

        if (connector.account == null) {
            console.log('Account was null')
            return
        }

        const userAddress = Address.parseRaw(connector.account.address)

        let rp
        if (recipientPayload != null) {
            rp = beginCell()
                .storeAddress(recipientPayload.recipient)
                .storeMaybeRef(recipientPayload.payload)
        }

        const payload = beginCell()
            .storeUint(0x595f07bc, 32)
            .storeUint(queryId || 0, 64)
            .storeCoins(stakeAmount)
            .storeAddress(returnExcess || userAddress)
            .storeMaybeBuilder(rp)
            .endCell()
            .toBoc()
            .toString('base64')

        const result = await connector.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 300,
            messages: [
                {
                    address: rootAddress.toRawString(),
                    amount: (stakeAmount + toNano('0.5')).toString(),
                    payload,
                },
            ],
        })

        // TODO parse the boc for information.
        // const c = Cell.fromBase64(boc)

        console.log('transaction result:', result)
    }

    return { wallet, connectTo, disconnect, sendDeposit }
})
