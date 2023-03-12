<script setup>
import { reactive } from 'vue'
import WalletConnect from '../components/dialogs/WalletConnect.vue'
import ContractInfo from '../components/cards/ContractInfo.vue'
import StakeAction from '../components/cards/StakeAction.vue'

let data = reactive({
    drawer: false,
})

function closeNavDraw() {
    data.drawer = false
}
</script>

<template>
    <v-app-bar class="px-3 justify-center" color="white" flat>
        <v-container class="d-flex d-md-none align-center" style="max-width: 1200px">
            <v-app-bar-nav-icon variant="text" @click.stop="data.drawer = !data.drawer">
                <v-icon icon="mdi-menu" color="#FF7E73" />
            </v-app-bar-nav-icon>
            <v-spacer></v-spacer>
            <img style="margin: 8px; height: 40px; width: 40px" src="/icons/64-icon.png" />
        </v-container>
        <v-container class="d-none d-md-flex align-center" style="max-width: 1200px">
            <img style="margin: 8px; height: 40px; width: 40px" src="/icons/64-icon.png" />
            <v-spacer></v-spacer>
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

    <v-main style="background-color: #efebe5">
        <v-container class="flex align-center" style="max-width: 1200px">
            <v-row>
                <v-col class="v-col-12 v-col-md-6">
                    <!-- <v-sheet rounded="lg" min-height="268"> -->
                    <!--  -->
                    <!-- </v-sheet> -->
                    <suspense>
                        <contract-info></contract-info>
                    </suspense>
                </v-col>
                <v-col class="v-col-12 v-col-md-6">
                    <stake-action></stake-action>
                </v-col>
            </v-row>
        </v-container>
    </v-main>
</template>
