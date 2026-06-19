const BANNER_KEY = 'site_banner_hidden'

const banner = document.getElementById('site-banner')
const closeBtn = document.getElementById('close-banner')
const bannerSpace = document.getElementById('banner-space')

// Change this code and deply the site to show the banner. It's better not to use
// previous used codes. It's suggested to increment it for new banners.
const HIDDEN_CODE = '1'

let shouldHideBanner = () => {
  let code = localStorage.getItem(BANNER_KEY)
  return code === HIDDEN_CODE
}

let hideBanner = () => {
  banner?.classList.add('hidden')
  localStorage.setItem(BANNER_KEY, HIDDEN_CODE)
  updateBannerSpace()
}

let updateBannerSpace = () => {
  if (shouldHideBanner()) {
    bannerSpace?.classList.add('hidden')
  } else {
    bannerSpace?.classList.remove('hidden')
  }
}

//--------------------------------------------------------------------------------
// initialization part

// Hide on load if previously closed
if (shouldHideBanner()) {
  banner?.classList.add('hidden')
} else {
  banner?.classList.remove('hidden')
}

closeBtn?.addEventListener('click', () => {
  hideBanner()
})

updateBannerSpace()
