<script lang="ts"  setup>
import { reactive, ref } from 'vue'

const icons = [
    'mdi-facebook',
    'mdi-twitter',
    'mdi-linkedin',
    'mdi-instagram',
];

const colors = [
    'indigo',
    'warning',
    'pink darken-2',
    'red lighten-1',
    'deep-purple accent-4',
];
const slides = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
];

const data = reactive({ drawer: false })

const displayCode = ref(1)
function resize() {
    const w = window.innerWidth
    let adj = 0
    if (window.innerWidth > window.innerHeight) {
        adj = 16
    }
    if (w < 600) {
        displayCode.value = 1 // 'xs'
    } else if (w < 960) {
        displayCode.value = 2 // 'sm'
    } else if (w < 1264 - adj) {
        displayCode.value = 3 // 'md'
    } else if (w < 1904 - adj) {
        displayCode.value = 4 // 'lg'
    } else {
        displayCode.value = 5 // 'xl'
    }
}
</script>

<template>
    <v-app-bar class="px-3 justify-center" color="white" flat>
        <v-container class="d-flex align-center" style="max-width: 1200px">
            <img style="margin: 8px; height: 40px;" src="/icons/horizontal.png" />
            <v-spacer></v-spacer>
        </v-container>
    </v-app-bar>
    <v-main>
        <v-container v-resize="resize"
            style="position: fixed; width: 100%; max-width: 100%; background-image: url(/icons/3.jpg); background-size: cover;">
            <v-row style="min-height: calc(100vh - 64px);"> </v-row>
        </v-container>
        <v-container style="max-width: 1200px;">
            <v-row class="justify-center align-center" style="min-height: calc(100vh - 64px);">
                <v-col class="v-col-12 v-col-md-6 v-col-lg-4">
                    <v-card variant="tonal">
                        <v-card-item class="d-flex">
                            <div class="d-flex justify-center align-center">
                                <v-img width="48" height="48" src="/icons/hton128.png"></v-img>
                                <div style="padding: 3px 16px 3px 16px;">
                                    <v-card-title class="d-flex">
                                        Staked
                                    </v-card-title>
                                    <v-card-subtitle>
                                        Total number of TON Staked.
                                    </v-card-subtitle>
                                </div>
                            </div>
                        </v-card-item>
                        <v-card-text class="d-flex justify-center align-center my-14 mx-8 my-md-16"
                            style="font-size: 3rem;">
                            8,932,398
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col class="v-col-12 v-col-md-6 v-col-lg-4">
                    <v-card variant="tonal">
                        <v-card-item class="d-flex">
                            <div class="d-flex justify-center align-center">
                                <v-img width="48" height="48" src="/icons/ton-icon-560-560.png"></v-img>
                                <div style="padding: 3px 16px 3px 16px;">
                                    <v-card-title class="d-flex">
                                        Rewards
                                    </v-card-title>
                                    <v-card-subtitle>
                                        Total number of TON paid as reward.
                                    </v-card-subtitle>
                                </div>
                            </div>
                        </v-card-item>
                        <v-card-text class="d-flex justify-center align-center my-14 mx-8 my-md-16"
                            style="font-size: 3rem;">
                            397,361
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col class="v-col-12 v-col-md-6 v-col-lg-4">
                    <v-card variant="tonal">
                        <v-card-item class="d-flex">
                            <div class="d-flex justify-center align-center">
                                <v-icon size="48" icon="mdi-account-group-outline"></v-icon>
                                <div style="padding: 3px 16px 3px 16px;">
                                    <v-card-title class="d-flex">
                                        Stakers
                                    </v-card-title>
                                    <v-card-subtitle>
                                        Total number of stakers.
                                    </v-card-subtitle>
                                </div>
                            </div>
                        </v-card-item>
                        <v-card-text class="d-flex justify-center align-center my-14 mx-8 my-md-16"
                            style="font-size: 3rem;">
                            34
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em;" class="px-1 py-1 px-md-2 py-md-2">
                                StakeHipo
                            </v-card-title>
                            <v-card-subtitle style="white-space: break-spaces;" class="px-1 pt-1 pb-4 px-md-2 pt-md-2
                                                    pb-md-6">
                                The decentralized solution for liquid staking.
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                            <div>
                                Our platform offers a secure, decentralized way to stake your TON and earn rewards in
                                real-time. By
                                using decentralized nodes, we ensure that your funds are secure and that staking rewards are
                                distributed fairly and transparently.
                            </div>
                            <br />
                            <div>
                                With our platform, you can easily stake your TON and receive liquid hTONs, which can be used
                                in
                                other DeFi applications to compound your daily staking rewards. And with our user-friendly
                                interface, staking on the TON blockchain has never been easier.
                            </div>
                            <br />
                            <div>
                                Join us at StakeHipo and experience the power of decentralized liquid staking today!
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px;">
            <v-row class="justify-center align-center" style="min-height: calc(100vh - 64px);">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em; white-space: break-spaces;" class="pa-1 pt-md-2
                                                pb-md-6">
                                How StakeHipo Works?
                            </v-card-title>
                        </v-card-item>
                        <v-card-text>
                            <v-carousel color="#776464" hide-delimiter-background
                                :height="displayCode <= 2 ? '400px' : '475px'" :show-arrows="displayCode > 2"
                                :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                                <template v-slot:prev="{ props }">
                                    <v-btn icon variant="elevated" color="#FF7E73" @click="props.onClick">
                                        <v-icon icon="mdi-arrow-left" color="white"></v-icon>
                                    </v-btn>
                                </template>
                                <template v-slot:next="{ props }">
                                    <v-btn icon variant="elevated" color="#FF7E73" @click="props.onClick">
                                        <v-icon icon="mdi-arrow-right" color="white"></v-icon>
                                    </v-btn>
                                </template>
                                <v-carousel-item>
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                Step 1: Stake your TON
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                Simply stake any amount of TON on our platform to start earning daily
                                                staking rewards. Our platform utilizes decentralized nodes to ensure that
                                                your TON is staked securely and that you receive fair and reliable rewards.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                                <v-carousel-item>
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                Step 2: Receive hTON
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                Once you stake your TON, you will receive an equivalent amount of liquid
                                                hTONs. These hTONs can be used for other purposes, such as trading or
                                                providing liquidity, while still earning staking rewards in real-time. This
                                                allows you to maintain exposure to TON while still having the flexibility to
                                                use your hTONs as needed.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                                <v-carousel-item>
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                Step 3: Use in DeFi
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                With your hTONs, you can participate in the larger DeFi ecosystem and
                                                compound your daily staked rewards. Our platform is designed to seamlessly
                                                integrate with other TON-based DeFi projects, giving you a range of options
                                                for using your hTONs to generate even more rewards.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                            </v-carousel>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-footer class="bg-indigo-lighten-1 text-center d-flex flex-column">
            <div>
                <v-btn v-for="icon in icons" :key="icon" class="mx-4" :icon="icon" variant="text"></v-btn>
            </div>

            <div class="pt-0">
                Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum. Praesent
                ut risus eget metus luctus accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a sit amet
                dui. Duis commodo vitae velit et faucibus. Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum
                ultrices, cursus iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci
                varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            </div>

            <v-divider></v-divider>

            <div>
                {{ new Date().getFullYear() }} — <strong>Vuetify</strong>
            </div>
        </v-footer>
    </v-main>
</template>
