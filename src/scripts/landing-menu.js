const menu = document.getElementById('mobile-menu')
const button = document.getElementById('menu-button')
const howItWorks = document.getElementById('menu-how-it-works')
const audits = document.getElementById('menu-audits')
const hpo = document.getElementById('menu-hpo')
const hipoClub = document.getElementById('menu-hipo-club')
const whyHipo = document.getElementById('menu-why-hipo')
const faq = document.getElementById('menu-faq')

button?.addEventListener('click', () => toggleMenu())
howItWorks?.addEventListener('click', () => toggleMenu())
audits?.addEventListener('click', () => toggleMenu())
hpo?.addEventListener('click', () => toggleMenu())
hipoClub?.addEventListener('click', () => toggleMenu())
whyHipo?.addEventListener('click', () => toggleMenu())
faq?.addEventListener('click', () => toggleMenu())

let toggleMenu = () => {
  menu?.classList.toggle('hidden')
}
