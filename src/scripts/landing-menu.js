const menu = document.getElementById('mobile-menu')
const button = document.getElementById('menu-button')

button?.addEventListener('click', () => toggleMenu())

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => toggleMenu())
})

let toggleMenu = () => {
  // `hidden` carries the menu's state; the class on <html> only exists so CSS can turn off
  // pull-to-refresh while the menu is open (see html.menu-open in global.css) — Firefox mobile
  // was turning taps on the lower menu items into a page refresh. Header.tsx does the same for
  // the app pages. `classList.toggle` returns true when it added the class, i.e. menu now hidden.
  const hidden = menu?.classList.toggle('hidden')
  document.documentElement.classList.toggle('menu-open', hidden === false)
}
