<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import { useWalletStore, hTonBalance } from '../../stores/wallet'
import { fromNano, toNano } from 'ton'
import { TextDecoder } from 'util';

const { wallet, sendDeposit, sendWithdraw, getTonBalance, gethTonBalance } = useWalletStore()

const tab = ref(1)

const states = reactive({
    staking: false,
    staked: null,
    unstaking: false,
    unstaked: true,
})

const amount = reactive({
    stake: '',
    unstake: '',
})
async function stake() {
    console.log(toNano(amount.stake))
    states.staking = true
    states.staked = null
    states.staked = await sendDeposit(toNano(amount.stake))
    states.staking = false
}
async function unstake() {
    console.log(toNano(amount.unstake))
    states.unstaking = true
    states.unstaked = null
    states.unstaked = await sendWithdraw(toNano(amount.unstake))
    states.unstaking = false
}

watch(tab, () => {
    amount.stake = ''
    amount.unstake = ''
    states.staking = false
    states.staked = null
    states.unstaking = false
    states.unstaked = null
})

const tonBalance = reactive({
    loading: true,
    balance: '',
})
if (wallet.address) {
    getTonBalance().then((b: bigint) => {
        tonBalance.balance = fromNano(b)
        tonBalance.loading = false
    })
}
watch(
    () => wallet.address,
    () => {
        getTonBalance().then((b: bigint) => {
            tonBalance.balance = fromNano(b)
            tonBalance.loading = false
        })
    }
)

const hBalance = reactive({
    loading: true,
    active: '',
    next: '',
    later: '',
})
if (wallet.address) {
    gethTonBalance().then((b: hTonBalance) => {
        hBalance.active = fromNano(b.active)
        hBalance.next = fromNano(b.next)
        hBalance.later = fromNano(b.later)
        hBalance.loading = false
    })

}
watch(
    () => wallet.address,
    () => {
        gethTonBalance().then((b: hTonBalance) => {
            hBalance.active = fromNano(b.active)
            hBalance.next = fromNano(b.next)
            hBalance.later = fromNano(b.later)
            hBalance.loading = false
        })
    }
)

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
    <!-- <v-container> -->
    <!--     <v-row class="justify-center"> -->
    <!--         <v-chip v-if="wallet.testnet" class="rounded-pill mx-2 justify-center" color="red" size="large">❗️ testnet -->
    <!--             ❗️</v-chip> -->
    <!--     </v-row> -->
    <!-- </v-container> -->
    <v-tabs v-model="tab" color="#FF7E73" align-tabs="center">
        <v-tab :value="1" class="text-h5" style="font-size: 1.2rem; text-transform: none;">Stake</v-tab>
        <v-tab :value="2" class="text-h5" style="font-size: 1.2rem; text-transform: none;">Unstake</v-tab>
    </v-tabs>
    <v-card class="rounded-shaped">
        <v-card-text>
            <v-window v-model="tab" id="staketabs">
                <v-window-item :value="1">
                    <v-container fluid>
                        <v-row class="justify-center mb-8">
                            Stake <span class="px-1 font-weight-bold" style="color: #3a86c7;">TON</span> and receive
                            <span class="px-1 font-weight-bold" style="color: #776464;">hTON</span> while staking.
                        </v-row>
                        <v-row class="justify-center">
                            <v-col class="py-0">
                                <v-text-field label="Amount" variant="outlined" type="number" v-model="amount.stake">
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/ton-icon-560-560.png"></v-img>
                                    </template>
                                    <template #append-inner v-if="states.staked != null">
                                        <div v-if="states.staked">
                                            <v-icon icon="mdi-check" color="#FF7E73"></v-icon>
                                        </div>
                                        <div v-else>
                                            <v-icon icon="mdi-alert-rhombus" color="#FF7E73"></v-icon>
                                        </div>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="justify-center">
                            <v-col class="py-0">
                                <v-btn :loading="states.staking" color="#FF7E73" variant="tonal" block
                                    @click="stake">Stake</v-btn>
                            </v-col>
                        </v-row>
                        <v-row class="mt-12">
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your TON Balance
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #3a86c7;">{{ tonBalance.balance || 0 }} TON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your active hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.active || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your next hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.next || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your later hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.later || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <!-- <v-row> -->
                        <!--     <v-col> -->
                        <!--         <v-icon icon="mdi-wallet-plus-outline"></v-icon> -->
                        <!--         You Will Receive -->
                        <!--     </v-col> -->
                        <!--     <v-col style="text-align: right;"> -->
                        <!--         <span style="color: #776464;">{{ amount.stake || 0 }} hTON</span> -->
                        <!--     </v-col> -->
                        <!-- </v-row> -->
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-swap-horizontal"></v-icon>
                                Exchange Rate
                            </v-col>
                            <v-col style="text-align: right;">
                                <span class="px-1" style="color: #3a86c7;">1 TON</span> = <span style="color: #776464;">1
                                    hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="v-col-8">
                                <v-icon icon="mdi-alpha-c"></v-icon>
                                Max Transaction Cost
                            </v-col>
                            <v-col class="v-col-4" style="text-align: right;">
                                <span class="px-1" style="color: #3a86c7;">0.5 TON</span>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-window-item>
                <v-window-item :value="2">
                    <v-container fluid>
                        <v-row class="justify-center mb-8">
                            Unstake <span class="px-1 font-weight-bold" style="color: #776464;">hTON</span> and receive
                            <span class="px-1 font-weight-bold" style="color: #3a86c7;">TON</span> while unstaking.
                        </v-row>
                        <v-row class="justify-center">
                            <v-col class="py-0">
                                <v-text-field label="Amount" variant="outlined" type="number" v-model="amount.unstake">
                                    <template #prepend-inner>
                                        <v-img width="24" src="/website/icons/hton512.png"></v-img>
                                    </template>
                                    <template #append-inner v-if="states.unstaked != null">
                                        <div v-if="states.unstaked">
                                            <v-icon icon="mdi-check" color="#FF7E73"></v-icon>
                                        </div>
                                        <div v-else>
                                            <v-icon icon="mdi-alert-rhombus" color="#FF7E73"></v-icon>
                                        </div>
                                    </template>
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="justify-center">
                            <v-col class="py-0">
                                <v-btn :loading="states.unstaking" color="#FF7E73" variant="tonal" block
                                    @click="unstake">Unstake</v-btn>
                            </v-col>
                        </v-row>
                        <v-row class="mt-12">
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your TON Balance
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #3a86c7;">{{ tonBalance.balance || 0 }} TON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your active hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.active || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your next hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.next || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-wallet-outline"></v-icon>
                                Your later hTON
                            </v-col>
                            <v-col style="text-align: right;">
                                <span style="color: #776464;">{{ hBalance.later || 0 }} hTON</span>
                            </v-col>
                        </v-row>
                        <!-- <v-row> -->
                        <!--     <v-col> -->
                        <!--         <v-icon icon="mdi-wallet-plus-outline"></v-icon> -->
                        <!--         You Will Receive -->
                        <!--     </v-col> -->
                        <!--     <v-col style="text-align: right;"> -->
                        <!--         <span style="color: #3a86c7;">{{ amount.unstake || 0 }} TON</span> -->
                        <!--     </v-col> -->
                        <!-- </v-row> -->
                        <v-row>
                            <v-col>
                                <v-icon icon="mdi-swap-horizontal"></v-icon>
                                Exchange Rate
                            </v-col>
                            <v-col style="text-align: right;">
                                <span class="px-1" style="color: #3a86c7;">1 TON</span> = <span style="color: #776464;">1
                                    hTON</span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="v-col-8">
                                <v-icon icon="mdi-alpha-c"></v-icon>
                                Max Transaction Cost
                            </v-col>
                            <v-col class="v-col-4" style="text-align: right;">
                                <span class="px-1" style="color: #3a86c7;">0.5 TON</span>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<style>
/* Chrome, Safari, Edge, Opera */
#staketabs input::-webkit-outer-spin-button,
#staketabs input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    -moz-appearance: textfield;
    appearance: textfield;
    margin: 0;
}

/* Firefox */
#staketabs input[type='number'] {
    -webkit-appearance: none;
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
