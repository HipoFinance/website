<script setup>
import { ref } from 'vue'
import { useWalletStore } from '../../stores/wallet'

const { wallet } = useWalletStore()

const tab = ref(1)
</script>

<template>
    <v-card>
        <v-card-text>
            <v-tabs v-model="tab" color="#FF7E73" align-tabs="center">
                <v-tab :value="1">Stake</v-tab>
                <v-tab :value="2">Unstake</v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item :value="1">
                    <v-container fluid>
                        {{ wallet.connected }}
                    </v-container>
                </v-window-item>
                <v-window-item :value="2">
                    <v-container fluid>
                        Unstake
                    </v-container>
                </v-window-item>
            </v-window>
        </v-card-text>
        <v-card-actions></v-card-actions>
    </v-card>
</template>

<style scoped></style>
