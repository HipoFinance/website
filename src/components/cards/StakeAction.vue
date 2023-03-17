<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useWalletStore } from '../../stores/wallet'
import { Cell, toNano } from 'ton'
import { TextDecoder } from 'util';

const { wallet, sendDeposit } = useWalletStore()

const tab = ref(1)

const states = reactive({
    staking: false,
    staked: null,
})

const amount = reactive({
    stake: '',
    unstake: '',
})
async function stake() {
    console.log(toNano(amount.stake))
    states.staking = true
    states.staked = await sendDeposit(toNano(amount.stake))
    states.staking = false
}
function unstake() {
    console.log(toNano(amount.unstake))
}

// const c = Cell.fromBase64("te6cckECGQEABAgAAuGIAUCLGaG3fjRQIIRoB5wx2DJ33roigGC71KvYq8BHzD14GlNXTYdyQSxsStmUcfGmrV4wKnG52H+7iXOK5KszxcDtWkW7dDKM48awy9zHJCvhR/xI6E2bhaGi04DRTO+ERAimpoxf/////AAAAAAADgEXAgE0AhYBFP8A9KQT9LzyyAsDAgEgBBECAUgFCALm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQYHAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAkQAgEgCg8CAVgLDAA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA0OABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xITFBUAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF3TwK3KVbG80yPrAN+0DBYlmjYtHAY68E86g+37hxqe6QAFqQgB8pYwEbDgLEhEq2FFOsituyJDL8X7WgjVIrEDr11V9f6gTjspIAAAAAAAAAAAAAAAAAAEYAKlpaqzgAAAAAAAAAABQJUC+QAgBQIsZobd+NFAghGgHnDHYMnfeuiKAYLvUq9irwEfMPXkAKBFjNDbvxooEEI0A84Y7Bk7710RQDBd6lXsVeAj5h68BPMO4Dw==")
// const c = Cell.fromBase64(
//     "te6cckECAwEAAQEAAeGIAA0u065jVRas/6DxIL0ZC8Idufo1NUY1xT4kG0jtUCxIBrdVkaJTnlW+hsb2SsV58Z7VKHwD8mHydXyxolNhaF8dmBNHLbNAL9AhwZDHpcAaE2Qwhqh1nIRRMoiuM51T2ClNTRi7IKR1oAAAABgAHAEBaEIAF76uQKHJB5d1GNsiWeZmYSpwUplVzzJY6dweQAh2DwIiVAvkAAAAAAAAAAAAAAAAAAECAKdpaqzgAAAAAAAAAABCy0F4CAANLtOuY1UWrP+g8SC9GQvCHbn6NTVGNcU+JBtI7VAsSQABpdp1zGqi1Z/0HiQXoyF4Q7c/RqaoxrinxINpHaoFiQGj/LOe",
// )
// const cp = c.beginParse()
// console.log('bits', cp.loadBits(256).toString())
// console.log('c', c, '\n', c.toString())
// const cp = c.refs[0].beginParse()
// console.log('cp', cp)
// const a1 = cp.loadStringTail()
// console.log('a1', a1, a1.toString())
// const a2 = cp.loadBits()
// const a3 = cp.loadAddress()

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
                                <v-text-field label="Amount" variant="outlined" type="number" v-model="amount.stake">
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/ton-icon-560-560.png"></v-img>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <!-- </v-row> -->
                            <!-- <v-row class="justify-center"> -->
                            <v-col class="d-flex v-col-3 justify-center">
                                <v-btn :loading="states.staking" color="#FF7E73" variant="tonal" style="margin: 10px"
                                    @click="stake">Stake</v-btn>
                            </v-col>
                        </v-row>
                        <v-row v-if="states.staked != null">
                            <div v-if="states.staked">Successful</div>
                            <div v-else>Failed</div>
                        </v-row>
                    </v-container>
                </v-window-item>
                <v-window-item :value="2">
                    <v-container fluid>
                        <v-row class="justify-center">
                            <v-col class="v-col-9 justify-center">
                                <v-text-field label="Amount" variant="outlined" type="number" v-model="amount.unstake">
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/hton512.png"></v-img>
                                    </template>
                                </v-text-field>
                            </v-col>
                            <!-- </v-row> -->
                            <!-- <v-row class="justify-center"> -->
                            <v-col class="d-flex v-col-3 justify-center">
                                <v-btn color="#FF7E73" variant="tonal" style="margin: 10px" @click="unstake">Unstake</v-btn>
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
