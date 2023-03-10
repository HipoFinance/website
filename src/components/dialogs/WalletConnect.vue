<script setup>
import { TonConnect } from '@tonconnect/sdk'
import QRCode from 'qrcode-svg'
import { ref, onBeforeMount, defineEmits } from 'vue'

const emit = defineEmits(['walletConnect'])

const wallets = ref([])
const svg = ref(null)
const scanDialog = ref(false)
const walletDialog = ref(false)

const connector = new TonConnect({
    manifestUrl: 'https://733amir.github.io/tonchallenge/manifest.json',
})
// eslint-disable-next-line no-unused-vars
const unsubscribe = connector.onStatusChange((walletInfo) => {
    // update state/reactive variables to show updates in the ui

    scanDialog.value = false
    walletDialog.value = false

    console.log('wallet:', JSON.stringify(walletInfo))

    // eslint-disable-next-line no-unused-vars
    const w = {
        device: {
            platform: 'iphone',
            appName: 'Tonkeeper',
            appVersion: '2.9.0.268',
            maxProtocolVersion: 2,
            features: ['SendTransaction'],
        },
        provider: 'http',
        account: {
            address: '0:069769d731aa8b567fd078905e8c85e10edcfd1a9aa31ae29f120da476a81624',
            chain: '-3',
            walletStateInit:
                'te6cckECFgEAAwQAAgE0ARUBFP8A9KQT9LzyyAsCAgEgAxACAUgEBwLm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQUGAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAgPAgEgCQ4CAVgKCwA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIAwNABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xESExQAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF08Bnj6haO00bZg7PmzPNy/cUv6cIklD6lOqpurMHSHqQJyns+4=',
        },
    }
})

onBeforeMount(async function () {
    const walletsList = await connector.getWallets() // or use `walletsList` fetched before
    wallets.value = walletsList
        .filter(function (info) {
            return info.universalLink != null && info.bridgeUrl != null
        })
        .map(function (info) {
            return {
                prependAvatar: info.imageUrl,
                title: info.name,
                height: 65,
                universalLink: info.universalLink,
                bridgeUrl: info.bridgeUrl,
            }
        })
})

// const embeddedWallet = walletsList.find(
//   wallet => isWalletInfoInjected(wallet) && wallet.embedded
// );

// if (embeddedWallet) {
//   connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
// }

function select(index) {
    const walletConnectionSource = {
        universalLink: wallets.value[index]['universalLink'],
        bridgeUrl: wallets.value[index]['bridgeUrl'],
    }
    const universalLink = connector.connect(walletConnectionSource)

    var qrcode = new QRCode({
        content: universalLink,
        padding: 4,
        width: 256,
        height: 256,
        color: '#000000',
        background: '#ffffff',
        ecl: 'L',
        container: 'svg-viewbox', //Responsive use
        join: true, //Crisp rendering and 4-5x reduced file size
    })
    svg.value = qrcode.svg()
    scanDialog.value = true
}
</script>

<template>
    <v-dialog width="350" @update:modelValue="emit('walletConnect')" v-model="walletDialog">
        <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="#FF7E73" variant="tonal"> Connect Wallet </v-btn>
        </template>
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-toolbar
                    color="#FF7E73"
                    title="Select Your Wallet"
                    style="color: white"
                ></v-toolbar>
                <v-card-text>
                    <v-list>
                        <v-list-item
                            v-for="(item, i) in wallets"
                            :prepend-avatar="item.prependAvatar"
                            :title="item.title"
                            :key="item.title"
                            :height="65"
                            @click="select(i)"
                        ></v-list-item>
                    </v-list>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
    <v-dialog v-model="scanDialog" width="350">
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-toolbar color="#FF7E73" title="Scan QRCode" style="color: white"></v-toolbar>
                <v-card-text>
                    <div v-html="svg"></div>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<style scoped></style>
