<script lang="ts" setup>
import { reactive, ref } from 'vue'
import WalletConnect from '../components/dialogs/WalletConnect.vue'
import ContractInfo from '../components/cards/ContractInfo.vue'
import StakeAction from '../components/cards/StakeAction.vue'
import { useWalletStore } from '../stores/wallet'

const { wallet } = useWalletStore()

const displayCode = ref(1)
const containerSpace = reactive({
    marginTop: '192px',
    marginBottom: '192px',
})
function resize() {
    const w = window.innerWidth
    let adj = 0
    if (window.innerWidth > window.innerHeight) {
        adj = 16
    }
    if (w < 600) {
        displayCode.value = 1 // 'xs'
        containerSpace.marginTop = '96px'
        containerSpace.marginBottom = '96px'
    } else if (w < 960) {
        displayCode.value = 2 // 'sm'
        containerSpace.marginTop = '96px'
        containerSpace.marginBottom = '96px'
    } else if (w < 1264 - adj) {
        displayCode.value = 3 // 'md'
    } else if (w < 1904 - adj) {
        displayCode.value = 4 // 'lg'
    } else {
        displayCode.value = 5 // 'xl'
    }
}

let data = reactive({
    drawer: false,
})

function closeNavDraw() {
    data.drawer = false
}
</script>

<template>
    <v-app-bar class="px-3 justify-center" color="white" flat>
        <!-- <v-container class="d-flex d-md-none align-center" style="max-width: 1200px"> -->
        <!--     <v-app-bar-nav-icon variant="text" @click.stop="data.drawer = !data.drawer"> -->
        <!--         <v-icon icon="mdi-menu" color="#FF7E73" /> -->
        <!--     </v-app-bar-nav-icon> -->
        <!--     <v-spacer></v-spacer> -->
        <!--     <img style="margin: 8px; height: 40px; width: 40px" src="/icons/64-icon.png" /> -->
        <!-- </v-container> -->
        <!-- <v-container class="d-none d-md-flex align-center" style="max-width: 1200px"> -->
        <!--     <img style="margin: 8px; height: 40px; width: 40px" src="/icons/64-icon.png" /> -->
        <!--     <v-spacer></v-spacer> -->
        <!--     <wallet-connect></wallet-connect> -->
        <!-- </v-container> -->
        <v-container class="d-flex align-center" style="max-width: 1200px">
            <router-link :to="{ name: 'home' }">
                <img style="margin: 8px; height: 40px;"
                    :src="displayCode <= 2 ? '/website/favicon.png' : '/website/icons/horizontal.png'" />
            </router-link>
            <a href="https://github.com/StakeHipo" target="_blank" v-if="displayCode > 2">
                <v-btn color="#FF7E73" prepend-icon="mdi-github" size="large" style="text-transform: none;">GitHub</v-btn>
            </a>
            <a href="https://github.com/StakeHipo/contract/blob/main/README.md#stake-hipo-hton" target="_blank"
                v-if="displayCode > 2">
                <v-btn color="#FF7E73" prepend-icon="mdi-file-document" size="large"
                    style="text-transform: none;">Docs</v-btn>
            </a>
            <v-spacer></v-spacer>
            <v-chip class="rounded-pill mx-2" color="red" v-if="wallet.testnet" size="large">❗️ testnet ❗️</v-chip>
            <wallet-connect></wallet-connect>
        </v-container>
    </v-app-bar>

    <v-navigation-drawer class="justify-center" v-model="data.drawer" temporary>
        <v-list>
            <v-list-item>
                <wallet-connect @wallet-connect="closeNavDraw"></wallet-connect>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>

    <v-main style="background-color: #efebe5" v-resize="resize">
        <v-container class="flex align-center" style="max-width: 1200px;">
            <v-row class="justify-center">
                <v-col class="v-col-12 v-col-md-5">
                    <stake-action></stake-action>
                </v-col>
            </v-row>
            <v-row class="justify-center">
                <v-col class="v-col-12 v-col-md-5">
                    <!-- <v-sheet rounded="lg" min-height="268"> -->
                    <!--  -->
                    <!-- </v-sheet> -->
                    <contract-info></contract-info>
                </v-col>
            </v-row>
        </v-container>
    </v-main>
    <v-footer class="text-center d-flex flex-column" style="color: white; background-color: #776464;"
        :style="{ maxHeight: displayCode <= 2 ? '200px' : '130px' }">
        <div class="d-flex flex-wrap justify-center mt-4 mb-8">
            <div>
                <a href="https://t.me/stakehipo_chat" target="_blank">
                    <v-btn class="mx-4" variant="text" color="white" style="text-transform: none;">
                        <v-img class="mr-1 mb-1" :width="24" src="/icons/telegram.png"></v-img>
                        Telegram
                    </v-btn>
                </a>
            </div>
            <div>
                <a href="https://t.me/stakehipo_chat" target="_blank">
                    <v-btn class="mx-4" variant="text" color="white" style="text-transform: none;">
                        <v-icon class="mr-1 mb-1" icon="mdi-twitter" size="x-large"></v-icon>
                        Twitter
                    </v-btn>
                </a>
            </div>
            <div>
                <a href="https://t.me/stakehipo_chat" target="_blank">
                    <v-btn class="mx-4" variant="text" color="white" style="text-transform: none;">
                        <v-icon class="mr-1 mb-1" icon="mdi-chat" size="x-large"></v-icon>
                        Chat
                    </v-btn>
                </a>
            </div>
            <div>
                <a href="https://github.com/StakeHipo" target="_blank">
                    <v-btn class="mx-4" variant="text" color="white" style="text-transform: none;">
                        <v-icon class="mr-1 mb-1" icon="mdi-github" size="x-large"></v-icon>
                        GitHub
                    </v-btn>
                </a>
            </div>
            <div>
                <a href="https://github.com/StakeHipo/contract/blob/main/README.md#stake-hipo-hton" target="_blank">
                    <v-btn class="mx-4" variant="text" color="white" style="text-transform: none;">
                        <v-icon class="mr-1 mb-1" icon="mdi-file-document" size="x-large"></v-icon>
                        Docs
                    </v-btn>
                </a>
            </div>
        </div>

        <v-divider></v-divider>

        <div>
            {{ new Date().getFullYear() }} — <strong>StakeHipo</strong>
        </div>
    </v-footer>
</template>

<style scoped>
a:link,
a:visited,
a:hover,
a:active {
    text-decoration: none;
}
</style>
