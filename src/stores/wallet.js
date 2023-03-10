import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWalletStore = defineStore('wallet', () => {
  const wallet = ref(null);

  const data = localStorage.getItem('stake-hipo.wallet');
  if (data != null) {
    wallet.value = JSON.parse(data);
  }

  function walletData() {
    return wallet.value;
  }

  function setWalletData(data) {
    localStorage.setItem('stake-hipo.wallet', JSON.stringify(data));
    wallet.value = data;
  }
  
  return { walletData, setWalletData };
})
