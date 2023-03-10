<script setup>
import { ref, onBeforeMount, defineEmits } from 'vue'
import { useWalletStore } from '../../stores/wallet'
import { TonConnect } from '@tonconnect/sdk'
import { toUserFriendlyAddress } from '@tonconnect/sdk';
import QRCode from 'qrcode-svg'


const emit = defineEmits(['walletConnect'])

const wallets = ref([])
const svg = ref(null)
const walletDialog = ref(false)
const scanDialog = ref(false)
const { walletData, setWalletData } = useWalletStore();

const connector = new TonConnect({
    manifestUrl: 'https://733amir.github.io/tonchallenge/manifest.json',
})
// eslint-disable-next-line no-unused-vars
const unsubscribe = connector.onStatusChange((walletInfo) => {
    // update state/reactive variables to show updates in the ui

    scanDialog.value = false
    walletDialog.value = false

    console.log('wallet:', JSON.stringify(walletInfo))
    setWalletData(walletInfo);
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

const btnText = ref("Connect Wallet");
if (walletData() != null) {
    const rawAddress = walletData().account.address; // like '0:abcdef123456789...'
    const bouncableUserFriendlyAddress = toUserFriendlyAddress(rawAddress);
    btnText.value = bouncableUserFriendlyAddress.substring(0, 8);
}
function buttonClicked() {
    if (walletData() != null) {
        return;
    }

    walletDialog.value = true;
}
</script>

<template>
    <v-btn @click="buttonClicked" color="#FF7E73" variant="tonal"> {{ btnText }} </v-btn>
    <v-dialog width="350" @update:modelValue="emit('walletConnect')" v-model="walletDialog">
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
