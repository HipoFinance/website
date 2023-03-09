<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import TonConnect from '@tonconnect/sdk';

const connector = new TonConnect({ manifestUrl: 'https://gist.githubusercontent.com/733amir/ebc7a21ddc4801b58a5d0f3fc192ca15/raw/873f4c5a4646b0881d9eed297d9065876f28f7a1/tonchallenge-manifest.json' });
// const connector = new TonConnect();
// eslint-disable-next-line no-unused-vars
const unsubscribe = connector.onStatusChange(
    walletInfo => {
        // update state/reactive variables to show updates in the ui
        console.log("wallet:", walletInfo);
    } 
);

async function getQRCode() {
  const walletsList = await connector.getWallets();
  console.log("wallets: ", walletsList);

  console.log("qr code: ", await connector.connect(walletsList[0]));
}
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />

  <button @click="getQRCode">Get QR Code</button>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
