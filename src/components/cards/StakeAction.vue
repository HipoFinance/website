<script lang="ts" setup>
    import { ref, reactive } from 'vue'
    import { useWalletStore } from '../../stores/wallet'
    import { toNano } from 'ton'

    const { wallet, sendDeposit } = useWalletStore()

    const tab = ref(1)

    const amount = reactive({
        stake: '',
        unstake: '',
    })
    async function stake() {
        console.log(toNano(amount.stake))
        await sendDeposit(toNano(amount.stake))
    }
    function unstake() {
        console.log(toNano(amount.unstake))
    }
</script>

<template>
    <v-card>
        <v-card-text>
            <v-tabs v-model="tab" color="#FF7E73" align-tabs="center">
                <v-tab :value="1">Stake</v-tab>
                <v-tab :value="2">Unstake</v-tab>
            </v-tabs>
            <v-window v-model="tab" id="staketabs">
                <v-window-item :value="1">
                    <v-container fluid>
                        <v-row class="justify-center">
                            <v-col class="v-col-9 justify-center">
                                <v-text-field
                                    label="Amount"
                                    variant="outlined"
                                    type="number"
                                    v-model="amount.stake"
                                >
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/ton-icon-560-560.png"></v-img>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <!-- </v-row> -->
                            <!-- <v-row class="justify-center"> -->
                            <v-col class="d-flex v-col-3 justify-center">
                                <v-btn
                                    color="#FF7E73"
                                    variant="tonal"
                                    style="margin: 10px"
                                    @click="stake"
                                    >Stake</v-btn
                                >
                            </v-col>
                        </v-row>
                    </v-container>
                </v-window-item>
                <v-window-item :value="2">
                    <v-container fluid>
                        <v-row class="justify-center">
                            <v-col class="v-col-9 justify-center">
                                <v-text-field
                                    label="Amount"
                                    variant="outlined"
                                    type="number"
                                    v-model="amount.unstake"
                                >
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/hton128.png"></v-img>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <!-- </v-row> -->
                            <!-- <v-row class="justify-center"> -->
                            <v-col class="d-flex v-col-3 justify-center">
                                <v-btn
                                    color="#FF7E73"
                                    variant="tonal"
                                    style="margin: 10px"
                                    @click="unstake"
                                    >Unstake</v-btn
                                >
                            </v-col>
                        </v-row>
                    </v-container>
                </v-window-item>
            </v-window>
        </v-card-text>
        <v-card-actions></v-card-actions>
    </v-card>
</template>

<style>
    /* Chrome, Safari, Edge, Opera */
    #staketabs input::-webkit-outer-spin-button,
    #staketabs input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    #staketabas input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
