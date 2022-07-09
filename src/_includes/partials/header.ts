import themeSwitcher from '../components/theme-switcher.ts'
import textSizeSwitcher from '../components/text-size-switcher.ts'
import search from '../components/search.ts'

export default function (hero: string) {
	return `<header class="header" id="top">
		<div class="wrapper">
			<div class="navbar">
				<a href="/" title="Home" class="brand">
					<img src="/logo.svg" inline>
				</a>
				<section x-data="{ open: false }" class="navbar-end">
					<nav class="menu" :class="{ 'hide': !open }">
						<a href="/posts/" class="button">Posts</a>
						<a href="/stacktrace/" class="button">Stacktrace</a>
						<a href="/profile/naiyer/" class="button">About</a>
						${textSizeSwitcher()}
						${themeSwitcher()}
					</nav>
					${search()}
					<button @click.prevent="open = !open" :class="{ 'active': open }" aria-label="Menu" class="button preferences" type="button"><svg aria-hidden="true" role="img" class="icon"><use x-show="!open" x-transition href="#ini-menu"/><use x-show="open" x-transition href="#ini-x-circle"/></svg></button>
				</section>
			</div>
			<div class="hero">${hero}</div>
		</div>
	</header>`
}
