const BANNER_KEY = 'site_banner_hidden'

// Change this code and deploy the site to show the banner. It's better not to use
// previous used codes. It's suggested to increment it for new banners.
const HIDDEN_CODE = '1'

// Re-runs on astro:page-load because the app pages swap the whole body through Astro's
// ClientRouter — the module itself is only evaluated once, but each swapped-in page carries a
// fresh #site-banner that starts hidden and needs this to decide its state.
let initBanner = () => {
  const banner = document.getElementById('site-banner')
  if (banner == null) {
    return
  }

  if (localStorage.getItem(BANNER_KEY) === HIDDEN_CODE) {
    banner.classList.add('hidden')
  } else {
    banner.classList.remove('hidden')
  }

  document.getElementById('close-banner')?.addEventListener('click', () => {
    banner.classList.add('hidden')
    localStorage.setItem(BANNER_KEY, HIDDEN_CODE)
  })
}

initBanner()
document.addEventListener('astro:page-load', initBanner)
