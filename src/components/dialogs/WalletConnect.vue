<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useWalletStore } from '../../stores/wallet'
import QRCode from 'qrcode-svg'
import { fromNano } from 'ton-core';
import { useRouter } from 'vue-router';

const props = defineProps<{
    redirectToApp?: Boolean
}>()

const emit = defineEmits(['walletConnect'])
const { wallet, connectTo, disconnect } = useWalletStore()

const svg = ref(null)
const scanDialog = ref(false)
const walletDialog = ref(false)
const btnText = ref('Connect Wallet')
const router = useRouter()

function buttonClicked() {
    if (!wallet.connected) {
        walletDialog.value = true
    } else if (props.redirectToApp) {
        router.push({ name: 'app' })
    }
}

function onConnect(connected: Boolean) {
    if (!connected) {
        btnText.value = 'Connect Wallet'
        return
    }
    scanDialog.value = false
    walletDialog.value = false
    const l = wallet.address.length
    btnText.value = wallet.address.substring(0, 4) + '...' + wallet.address.substring(l - 4) + ': ' + fromNano(wallet.balance).substring(0, 5)
    if (wallet.testnet) {
        btnText.value += ' (TEST)'
    }
}
onConnect(wallet.connected)
watch(
    () => wallet.connected,
    onConnect,
)

const wallets = ref([])
watch(
    () => wallet.list,
    (l) => {
        if (l == null) {
            wallets.value = []
            return
        }

        wallets.value = l
            .filter(function (info) {
                // TODO support all wallets.
                return info.universalLink != null && info.bridgeUrl != null
            })
            .map(function (info) {
                return {
                    prependAvatar: info.imageUrl,
                    title: info.name,
                    universalLink: info.universalLink,
                    bridgeUrl: info.bridgeUrl,
                }
            })
    },
)

function select(index) {
    const universalLink = connectTo(index, props.redirectToApp ? () => router.push({ name: 'app' }) : null)
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
    <v-btn @click="buttonClicked" color="#FF7E73" variant="tonal">
        {{ btnText }}

        <v-menu activator="parent" v-if="wallet.connected">
            <v-list>
                <v-list-item>
                    <v-btn @click="disconnect" color="#FF7E73" variant="tonal">Logout</v-btn>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>

    <v-dialog width="350" @update:modelValue="emit('walletConnect')" v-model="walletDialog">
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-toolbar color="#FF7E73" title="Select Your Wallet" style="color: white"></v-toolbar>
                <v-card-text>
                    <v-list>
                        <v-list-item v-for="(item, i) in wallets" :prepend-avatar="item.prependAvatar" :title="item.title"
                            :key="item.title" :height="65" @click="select(i)"></v-list-item>
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
