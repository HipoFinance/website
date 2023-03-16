<script lang="ts"  setup>
import { reactive, ref, watch } from 'vue'
import gsap from 'gsap'

const icons = [
    'mdi-facebook',
    'mdi-twitter',
    'mdi-linkedin',
    'mdi-instagram',
];

const socials = [
    {
        title: 'Telegram',
        link: 'http://t.me/stakehipo',
        icon: 'mdi-send',
    },
    {
        title: 'Twitter',
        link: 'https://twitter.com/stakehipo',
        icon: 'mdi-twitter',
    },
    {
        title: 'Chat',
        link: 'https://t.me/stakehipo_chat',
        icon: 'mdi-chat',
    },
]

// const data = reactive({ drawer: false })

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

const statistics = reactive({
    staked: 0,
    reward: 0,
    users: 0,
})

const statsAnimated: {
    staked: number
    reward: number
    users: number
} = reactive({
    staked: 0,
    reward: 0,
    users: 0,
})
watch(statistics, (n: any) => {
    console.log('got')
    gsap.to(statsAnimated, {
        duration: 0.5,
        staked: Number(n.staked) || 0,
        reward: Number(n.reward) || 0,
        users: Number(n.users) || 0,
    })
})

setTimeout(() => {
    console.log('set')
    statistics.staked = 8932398
    statistics.reward = 397361
    statistics.users = 34
}, 3000);
</script>

<template>
    <v-app-bar class="px-3 justify-center" color="white" flat>
        <v-container class="d-flex align-center" style="max-width: 1200px">
            <img style="margin: 8px; height: 40px;" src="/website/icons/horizontal.png" />
            <v-spacer></v-spacer>
        </v-container>
    </v-app-bar>
    <v-main>
        <v-container v-resize="resize"
            style="position: fixed; width: 100%; max-width: 100%; background-image: url(/website/icons/3.jpg); background-size: cover;">
            <v-row style="min-height: calc(100vh - 64px);"> </v-row>
        </v-container>
        <v-container style="max-width: 1200px;">
            <v-row class="justify-center" style="min-height: calc(100vh - 64px);">
                <v-col class="v-col-12">
                    <v-card variant="text" style="margin-top: 25vh;">
                        <!-- <v-card-item class="d-flex" style="width: 100%;"> -->
                        <v-card-title class="d-flex" style="font-size: 3rem; line-height: 2;">
                            Empowering Your<span class="px-3" style="color: #3a86c7;">TON</span>
                        </v-card-title>
                        <v-card-subtitle style="font-size: 1.5rem; line-height: 1; width: 100%">
                            stake smarter, access liquidity easier
                        </v-card-subtitle>
                        <!-- </v-card-item> -->
                        <v-card-text class="d-flex justify-center align-center" style="font-size: 2.5rem; margin: 100px 0;">
                            Decentralized, Secure, and Easy with <span class="px-3" style="color: #776464;">StakeHipo</span>
                        </v-card-text>
                        <v-card-actions class="d-flex justify-center align-center">
                            <v-btn color="#FF7E73" variant="tonal" style="margin: 10px" @click="" size="x-large">
                                <div class="mx-16">Stake Now</div>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-6 v-col-lg-4">
                    <v-card variant="tonal">
                        <v-card-item class="d-flex">
                            <div class="d-flex justify-center align-center">
                                <v-img width="48" height="48" src="/website/icons/hton128.png"></v-img>
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
                            {{ statsAnimated.staked }}
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col class="v-col-12 v-col-md-6 v-col-lg-4">
                    <v-card variant="tonal">
                        <v-card-item class="d-flex">
                            <div class="d-flex justify-center align-center">
                                <v-img width="48" height="48" src="/website/icons/ton-icon-560-560.png"></v-img>
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
                            {{ statsAnimated.reward }}
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
                            {{ statsAnimated.users }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px; margin-top: 192px; margin-bottom: 192px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em;" class="px-1 py-1 px-md-2 py-md-2">
                                <span class="px-3" style="color: #776464;">StakeHipo</span>
                            </v-card-title>
                            <v-card-subtitle style="white-space: break-spaces;"
                                class="px-1 pt-1 pb-4 px-md-2 pt-md-2 pb-md-6">
                                The decentralized solution for liquid staking.
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                            <div>
                                Our platform offers a secure, decentralized way to stake your TON and earn rewards in
                                real-time. By using decentralized nodes, we ensure that your funds are secure and that
                                staking rewards are distributed fairly and transparently.
                            </div>
                            <br />
                            <div>
                                With our platform, you can easily stake your TON and receive liquid hTONs, which can be used
                                in other DeFi applications to compound your daily staking rewards. And with our
                                user-friendly interface, staking on the TON blockchain has never been easier.
                            </div>
                            <br />
                            <div>
                                Join us at <span style="color: #776464;">StakeHipo</span> and experience the power of
                                decentralized liquid staking today!
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px; margin-top: 192px; margin-bottom: 192px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em; white-space: break-spaces;" class="pa-2">
                                How<span class="px-3" style="color: #776464;">StakeHipo</span>Works?
                            </v-card-title>
                        </v-card-item>
                        <v-card-text>
                            <v-carousel color="#776464" hide-delimiter-background
                                :height="displayCode <= 2 ? '400px' : '350px'" :show-arrows="displayCode > 2"
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
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '0 96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                Step 1: Stake your <span style="color: #3a86c7;">TON</span>
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
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '0 96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                Step 2: Receive <span style="color: #776464;">hTON</span>
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
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '24px 0' : '0 96px') }">
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
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-text style="font-size: 1.75em; line-height: 1.5;">
                            At StakeHipo, we believe in the power of liquid
                            staking to make staking more accessible and
                            flexible for users. With our easy-to-use platform and competitive staking rewards, we offer
                            a simple and efficient way for you to stake your TON and earn rewards.
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px; margin-top: 192px; margin-bottom: 192px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em; white-space: break-spaces;" class="pa-2 pb-6">
                                Why <span style="color: #3a86c7;">TON</span>?
                            </v-card-title>
                        </v-card-item>
                        <v-card-text style="font-size: 1.75em; line-height: 1.5;">
                            TON (Telegram Open Network) is a next-generation blockchain platform that offers fast
                            transaction speeds and a robust infrastructure for building decentralized applications. Here are
                            some reasons why we believe TON is the perfect blockchain for liquid staking:
                        </v-card-text>
                    </v-card>
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-text>
                            <v-carousel color="#776464" hide-delimiter-background
                                :height="displayCode <= 2 ? '350px' : '325px'" :show-arrows="displayCode > 2"
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
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '0' : '0 96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                1. Speed and Scalability
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                The TON blockchain is designed for high-speed transactions, with the
                                                capacity to process millions of transactions per second. This speed and
                                                scalability make it ideal for liquid staking, as it allows for fast and
                                                efficient transfers of hTONs and TONs.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                                <v-carousel-item>
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '0' : '0 96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                2. Robust Infrastructure
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                The TON blockchain is built on a powerful and secure infrastructure that
                                                offers high availability and fault tolerance. This makes it a reliable
                                                platform for liquid staking, as it ensures that stakers' funds are secure
                                                and accessible at all times.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                                <v-carousel-item>
                                    <v-card variant="text" :style="{ padding: (displayCode <= 2 ? '0' : '0 96px') }">
                                        <v-card-item class="pa-0">
                                            <v-card-title style="font-size: 1.75em; padding: 24px;">
                                                3. Active Community
                                            </v-card-title>
                                        </v-card-item>
                                        <v-card-text style="font-size: 1.5em; line-height: 1.5;">
                                            <div>
                                                The TON blockchain has a large and active community of developers and
                                                enthusiasts who are constantly working to improve and innovate on the
                                                platform. This community ensures that TON is always evolving and adapting to
                                                meet the needs of its users.
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </v-carousel-item>
                            </v-carousel>
                        </v-card-text>
                    </v-card>
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-text style="font-size: 1.75em; line-height: 1.5;">
                            At StakeHipo, we believe that TON is the future
                            of blockchain technology, and we are proud to
                            offer a liquid staking platform that harnesses its power and potential. Join us today and start
                            earning rewards for your TON!
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-container style="max-width: 1200px; margin-top: 192px; margin-bottom: 192px;">
            <v-row class="justify-center align-center">
                <v-col class="v-col-12 v-col-md-9">
                    <v-card variant="text" :style="{ fontSize: (displayCode <= 2 ? '0.7rem' : '1rem') }">
                        <v-card-item>
                            <v-card-title style="font-size: 2.5em; white-space: break-spaces;" class="pa-1 pt-md-2 pb-md-6">
                                FAQ
                            </v-card-title>
                        </v-card-item>
                        <v-card-text style="font-size: 1.35em; line-height: 1.5; min-height: 800px;">
                            <v-expansion-panels variant="inset">
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        What is liquid staking?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        Liquid staking is a way to stake your cryptocurrency and receive liquid rewards in
                                        return. Instead of locking up your cryptocurrency, you receive a liquid version of
                                        your staked cryptocurrency that can be used for other purposes, such as trading or
                                        providing liquidity.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        How does liquid staking work on
                                        <span class="pl-2" style="color: #776464;">StakeHipo</span>?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        StakeHipo uses decentralized nodes to securely stake your TON and generate liquid
                                        staked TON rewards. Simply stake any amount of TON on our platform to start earning
                                        daily staking rewards. Once you stake your TON, you will receive an equivalent
                                        amount of liquid hTONs, which can be used for other purposes while still earning
                                        staking rewards in real-time. With your hTONs, you can participate in the larger
                                        DeFi ecosystem and compound your daily staked rewards, giving you a range of options
                                        for generating even more rewards.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        Is my <span class="px-2" style="color: #3a86c7;">TON</span> safe on <span
                                            class="pl-2" style="color: #776464;">StakeHipo</span>?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        Yes, your TON is secure on our platform. We use advanced blockchain technology,
                                        including smart contracts and decentralized nodes, to ensure that your TON is staked
                                        securely and that your rewards are distributed fairly. Our platform is also
                                        regularly audited to ensure the highest level of security and reliability.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        How are staking rewards calculated?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        Staking rewards are calculated based on a variety of factors, including the amount
                                        of TON staked, the length of the staking period, and the overall demand for TON
                                        staking on our platform. Our platform offers competitive staking rewards to ensure
                                        that our users are rewarded fairly for their participation.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        How do I unstake my <span class="pl-2" style="color: #3a86c7;">TON</span>?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        To unstake your TON, simply navigate to the unstaking section on our platform and
                                        initiate the unstaking process. The amount of time it takes for your TON to become
                                        available will depend on the availability of unstaked TON in the smart contract. If
                                        there is enough unstaked TON in the smart contract, your unstake request will be
                                        processed instantly. However, if there is not enough unstaked TON, you will need to
                                        wait for the next validation round that ustaked TON become available in the smart
                                        contacts.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        What happens if there are network issues or my transaction fails during the staking
                                        process?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        Our liquid staking platform is built on a decentralized blockchain network, meaning
                                        that your transactions and staking activities are handled by smart contracts and
                                        distributed nodes rather than a centralized authority. In the unlikely event of
                                        network issues or a failed transaction, the decentralized nodes automatically detect
                                        the issue and work to resolve it. Your TON remains secure in your wallet and is not
                                        at risk of being lost. Additionally, our platform is designed with fail-safes to
                                        ensure that you do not lose any staking rewards.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title style="font-size: 1em;">
                                        How do I get involved in the
                                        <span class="px-2" style="color: #776464;">StakeHipo</span> community?
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        Our platform offers a community forum where users can connect and share information.
                                        You can also follow us on social media to stay up-to-date on the latest developments
                                        on our platform and in the larger TON ecosystem.
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-footer class="text-center d-flex flex-column" style="color: white; background-color: #776464;">
            <div>
                <v-btn v-for="icon in socials" :key="icon.title" class="mx-4" :icon="icon.icon" variant="text"
                    color="white"></v-btn>
            </div>

            <div class="pt-0">
            </div>

            <v-divider></v-divider>

            <div>
                {{ new Date().getFullYear() }} — <strong>StakeHipo</strong>
            </div>
        </v-footer>
    </v-main>
</template>
