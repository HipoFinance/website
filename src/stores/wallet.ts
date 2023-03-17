import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { TonConnect, UserRejectsError, WalletInfo } from '@tonconnect/sdk'
import { TonClient, Address, beginCell, Slice, toNano, Cell, TupleBuilder } from 'ton'
import { getHttpEndpoint } from '@orbs-network/ton-access'
import { toUserFriendlyAddress } from '@tonconnect/sdk'
import { RecipientPayload } from './Root'

interface Wallet {
    connected: boolean
    address: string
    balance: string
    list: any[]
    testnet: boolean
}

export const useWalletStore: () => {
    rootAddress: Address
    wallet: Wallet
    connectTo: Function
    disconnect: Function
    sendDeposit: Function
    sendWithdraw: Function
    getTonBalance: () => Promise<bigint>
    gethTonBalance: () => Promise<bigint>
    gethTonAddress: () => Promise<Address>
} = defineStore('wallet', () => {
    const testnet = true
    let tonClient: TonClient | null = null
    getHttpEndpoint({ network: testnet ? 'testnet' : 'mainnet' })
        .then((endpoint) => {
            tonClient = new TonClient({
                endpoint: endpoint,
            })
        })

    /* cspell: disable-next-line */
    const rootAddress = Address.parseFriendly(
        // 'EQD5SxgI2HAWJCJVsKKdZFbdkSGX4v2tBGqRWIHXrqr6_wvJ',
        'EQAvfVyBQ5IPLuoxtkSzzMzCVOClMqueZLHTuDyAEOweBIFi',
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

    const wallet: Wallet = reactive({
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

    async function getBalance(address: string): Promise<bigint> {
        return await tonClient.getBalance(Address.parseFriendly(address).address)
    }

    async function gethBalance(address: string): Promise<bigint> {
        const subAddress = await getSubWallet(Address.parseFriendly(address).address)
        const m = await tonClient.runMethod(subAddress, 'get_balances')
        return m.stack.readBigNumber()
    }

    async function getSeqNo(address: string | undefined): Promise<number> {
        if (address == null) {
            return 0;
        }

        const m = await tonClient.runMethod(Address.parse(address), 'seqno')
        return m.stack.readNumber()
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sendDeposit(
        stakeAmount: bigint,
        recipientOwner?: Address,
        queryId?: bigint,
        returnExcess?: Address,
        notificationTonAmount?: bigint,
        notificationPayload?: Slice,
    ): Promise<Boolean> {
        if (!connector.connected) {
            console.log('Not connected')
            return false
        }

        if (connector.account == null) {
            console.log('Account was null')
            return false
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

        console.log('getting the seqno')
        const seqNo = await getSeqNo(connector.account.address)
        console.log('initial seqno', seqNo)
        try {
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
            console.log('transaction result:', result)
            // TODO parse the boc for information.
            // const c = Cell.fromBase64("te6cckECGQEABAgAAuGIAUCLGaG3fjRQIIRoB5wx2DJ33roigGC71KvYq8BHzD14GlNXTYdyQSxsStmUcfGmrV4wKnG52H+7iXOK5KszxcDtWkW7dDKM48awy9zHJCvhR/xI6E2bhaGi04DRTO+ERAimpoxf/////AAAAAAADgEXAgE0AhYBFP8A9KQT9LzyyAsDAgEgBBECAUgFCALm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQYHAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAkQAgEgCg8CAVgLDAA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA0OABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xITFBUAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF3TwK3KVbG80yPrAN+0DBYlmjYtHAY68E86g+37hxqe6QAFqQgB8pYwEbDgLEhEq2FFOsituyJDL8X7WgjVIrEDr11V9f6gTjspIAAAAAAAAAAAAAAAAAAEYAKlpaqzgAAAAAAAAAABQJUC+QAgBQIsZobd+NFAghGgHnDHYMnfeuiKAYLvUq9irwEfMPXkAKBFjNDbvxooEEI0A84Y7Bk7710RQDBd6lXsVeAj5h68BPMO4Dw==")

            for (let i = 0; i < 20; i++) {
                const newSeqNo = await getSeqNo(connector.account.address)
                console.log('new seqno', newSeqNo)
                if (seqNo < newSeqNo) {
                    return true
                }
                await sleep(3000)
            }
        } catch (e) {
            if (e instanceof UserRejectsError) {
                alert('You rejected the transaction.');
            }
        }
        return false
    }

    async function getSubWallet(address: Address): Promise<Address> {
        const t = new TupleBuilder()
        t.writeAddress(address)
        const m = await tonClient.runMethod(rootAddress, 'get_wallet_address', t.build())
        return m.stack.readAddress()
    }

    async function sendWithdraw(
        stakeAmount: bigint,
        queryId?: bigint,
        returnExcess?: Address,
        recipientPayload?: RecipientPayload,
    ): Promise<Boolean> {
        if (!connector.connected) {
            console.log('Not connected')
            return false
        }

        if (connector.account == null) {
            console.log('Account was null')
            return false
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

        console.log('getting the seqno')
        const seqNo = await getSeqNo(connector.account.address)
        console.log('initial seqno', seqNo)
        try {
            const result = await connector.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: [
                    {
                        // address: rootAddress.toRawString(),
                        address: (await getSubWallet(userAddress)).toRawString(),
                        amount: (stakeAmount + toNano('0.5')).toString(),
                        payload,
                    },
                ],
            })
            console.log('transaction result:', result)
            // TODO parse the boc for information.
            // const c = Cell.fromBase64(boc)

            for (let i = 0; i < 20; i++) {
                const newSeqNo = await getSeqNo(connector.account.address)
                console.log('new seqno', newSeqNo)
                if (seqNo < newSeqNo) {
                    return true
                }
                await sleep(3000)
            }
        } catch (e) {
            if (e instanceof UserRejectsError) {
                alert('You rejected the transaction.');
            }
        }
        return false
    }

    return {
        rootAddress, wallet, connectTo, disconnect, sendDeposit, sendWithdraw, getTonBalance() {
            return getBalance(wallet.address)
        }, gethTonBalance() {
            return gethBalance(wallet.address)
        }, gethTonAddress() {
            return getSubWallet(Address.parseFriendly(wallet.address).address)
        }
    }
})
