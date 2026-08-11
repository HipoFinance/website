const menu = document.getElementById('mobile-menu')
const button = document.getElementById('menu-button')

button?.addEventListener('click', () => toggleMenu())

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => toggleMenu())
})

let toggleMenu = () => {
  menu?.classList.toggle('hidden')
}
