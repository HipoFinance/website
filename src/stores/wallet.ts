import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { TonConnect } from '@tonconnect/sdk'
import { TonClient, Address } from 'ton'
import { getHttpEndpoint } from '@orbs-network/ton-access'
import { toUserFriendlyAddress } from '@tonconnect/sdk'

export const useWalletStore = defineStore('wallet', () => {
    const testnet = true

    function setRestore(value) {
        // localStorage.setItem('stake-hipo.wallet', JSON.stringify(walletInfo));
        localStorage.setItem('stake-hipo.restore-connection', JSON.stringify(value))
    }
    function getRestore() {
        const d = localStorage.getItem('stake-hipo.restore-connection')
        if (d == null) {
            return d
        }
        return JSON.parse(d)
    }

    const wallet = reactive({
        connected: false,
        address: '',
        balance: '',
        list: [],
    })

    const connector = new TonConnect({
        manifestUrl: 'https://733amir.github.io/tonchallenge/manifest.json',
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

        wallet.address = toUserFriendlyAddress(connector.account.address, testnet)
        wallet.balance = await getBalance(wallet.address)
        wallet.connected = true
        setRestore(true)
    })

    if (getRestore()) {
        connector.restoreConnection()
    }

    function connectTo(index) {
        const walletConnectionSource = {
            universalLink: wallet.list[index]['universalLink'],
            bridgeUrl: wallet.list[index]['bridgeUrl'],
        }
        return connector.connect(walletConnectionSource)
    }

    function disconnect() {
        setRestore(false)
        wallet.address = ''
        wallet.balance = ''
        wallet.connected = false
    }

    async function getBalance(address) {
        const client = new TonClient({
            endpoint: await getHttpEndpoint({ network: testnet ? 'testnet' : 'mainnet' }),
        })

        return await client.getBalance(Address.parseFriendly(address).address)
    }

    return { wallet, connectTo, disconnect }
})
