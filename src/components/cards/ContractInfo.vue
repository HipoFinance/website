<script lang="ts" setup>
import { ref, watch } from 'vue'
import { getHttpEndpoint } from '@orbs-network/ton-access'
import { TonClient, Address, TupleBuilder, Dictionary, fromNano } from 'ton'
import { sha256 } from 'ton-crypto'
import { useWalletStore } from '../../stores/wallet'

const { wallet, rootAddress, gethTonAddress } = useWalletStore()

const tonAddStr = ref('')
const hTonAddStr = ref('')
watch(
    () => wallet.address,
    () => {
        tonAddStr.value = wallet.address.toString()
        gethTonAddress().then((a) => {
            hTonAddStr.value = a.toString()
        })
    }
)
// make some query to mainnet
const address = rootAddress
const addStr = address.toString()
// const address2 = address.toRawString()
const balance = ref(0)
getHttpEndpoint({ network: 'testnet' }).then((endpoint) => {
    const client = new TonClient({ endpoint }) // initialize ton library
    client.getBalance(address).then((b) => {
        balance.value = b
    })
})

// const endpoint = await getHttpEndpoint({ network: 'testnet' }) // get the decentralized RPC endpoint
// const client = new TonClient({ endpoint }) // initialize ton library
// client.getBalance(address).then((b) => {
//     balance.value = b
// })

// const m1 = await client.runMethod(address, 'get_total_balances')
// const n11 = ref(m1.stack.readBigNumber())
// const n12 = ref(m1.stack.readBigNumber())
// const n13 = ref(m1.stack.readBigNumber())
//
// const m2 = await client.runMethod(address, 'get_jetton_data')
// const n21 = ref(m2.stack.readBigNumber())
// const n22 = ref(m2.stack.readBigNumber())
// const n23 = ref(m2.stack.readAddress())
// const n24 = m2.stack.readCell()
// // const n25 = ref(m2.stack.readCell())
//
// const d = removeBits(n24, 8).loadDict(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell())
// const decimalsKey = await toSha256('decimals')
// const symbolKey = await toSha256('symbol')
// const nameKey = await toSha256('name')
// const imageKey = await toSha256('image')
// const descriptionKey = await toSha256('description')
// const decimals = ref(fromTextCell(d.get(decimalsKey)))
// const symbol = ref(fromTextCell(d.get(symbolKey)))
// const name = ref(fromTextCell(d.get(nameKey)))
// const image = ref(fromTextCell(d.get(imageKey)))
// const description = ref(fromTextCell(d.get(descriptionKey)))
//
// const walletAddress = 'EQAGl2nXMaqLVn_QeJBejIXhDtz9GpqjGuKfEg2kdqgWJEOy'
// const t = new TupleBuilder()
// t.writeAddress(Address.parseFriendly(walletAddress).address)
// const m3 = await client.runMethod(address, 'get_wallet_address', t.build())
// const n31 = ref(m3.stack.readAddress())

// function toTextCell(s) {
//     return beginCell().storeUint(0, 8).storeStringTail(s).endCell()
// }

// async function toSha256(s) {
//     // eslint-disable-next-line no-undef
//     return BigInt('0x' + (await sha256(s)).toString('hex'))
// }
//
// function fromTextCell(c) {
//     const p = c.beginParse()
//     p.loadBits(8)
//     return p.loadStringTail()
// }
//
// function removeBits(c, n) {
//     const p = c.beginParse()
//     p.loadBits(n)
//     return p
// }
</script>

<template>
    <div class="text-h5 d-flex justify-center ma-4">Hipo Figures</div>
    <v-card class="rounded-shaped">
        <v-card-text>
            <v-container fluid>
                <v-row>
                    <v-col>
                        Total staked with <span style="color: #776464;">Hipo:</span>
                    </v-col>
                    <v-col style="text-align: right;">
                        {{ fromNano(balance) }}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        Contract:
                    </v-col>
                    <v-col style="text-align: right;">
                        {{ addStr.substring(0, 4) + '...' + addStr.substring(addStr.length - 4) }}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        TON Wallet:
                    </v-col>
                    <v-col style="text-align: right;">
                        {{ tonAddStr.substring(0, 4) + '...' + tonAddStr.substring(tonAddStr.length - 4) }}
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        hTON Wallet:
                    </v-col>
                    <v-col style="text-align: right;">
                        {{ hTonAddStr.substring(0, 4) + '...' + hTonAddStr.substring(hTonAddStr.length - 4) }}
                    </v-col>
                </v-row>
            </v-container>
            <!-- <div><span style="color: red">Address</span>: {{ address2 }}</div> -->
            <!-- <div><span style="color: red">Balance</span>: {{ balance }}</div> -->
            <!-- <br /> -->
            <!-- <div> -->
            <!--     <span style="color: red">get_total_balances</span>: {{ n11 }}, {{ n12 }}, {{ n13 }} -->
            <!-- </div> -->
            <!-- <br /> -->
            <!-- <div> -->
            <!--     <span style="color: red">get_jetton_data</span>: {{ n21 }}, {{ n22 }}, {{ n23 }} -->
            <!-- </div> -->
            <!-- <div><span style="color: orange">decimals</span>: {{ decimals }}</div> -->
            <!-- <div><span style="color: orange">symbol</span>: {{ symbol }}</div> -->
            <!-- <div><span style="color: orange">name</span>: {{ name }}</div> -->
            <!-- <div><span style="color: orange">image</span>: {{ image }}</div> -->
            <!-- <div><span style="color: orange">description</span>: {{ description }}</div> -->
            <!-- <br /> -->
            <!-- <div> -->
            <!--     <span style="color: red">get_wallet_address</span> of {{ walletAddress }}: {{ n31 }} -->
            <!-- </div> -->
        </v-card-text>
        <v-card-actions></v-card-actions>
    </v-card>
</template>

<style scoped></style>
