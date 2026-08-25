// Shared by Banner.astro (which inlines them into the pre-paint script via define:vars) and
// banner.js (which runs later for clicks and ClientRouter swaps). Both must agree on the key and
// the code, so they live here rather than being written out twice.

export const BANNER_KEY = 'site_banner_hidden'

// Change this code and deploy the site to show the banner again to everyone. It's better not to
// reuse previous codes; incrementing it for each new banner is the convention.
export const HIDDEN_CODE = '1'

// Set on <html> — not on the banner element — so the decision can be made before the banner is
// parsed, which is the whole point: a class toggled on the element itself can only be applied
// after it exists, and by then it has already been painted.
export const OFF_CLASS = 'banner-off'
