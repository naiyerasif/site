export default function () {
	return `<script src="/theme-switcher.js" inline></script>
		<button role="switch" aria-live="polite" :aria-label="label()" aria-checked="true" x-data="themeSwitcher" @click="switchTheme()" class="button" type="button"><svg aria-hidden="true" role="img" class="icon"><use x-show="currentTheme === 'dark'" x-transition href="#ini-moon-stars"/><use x-show="currentTheme === 'light'" x-transition href="#ini-sun"/></svg></button>`
}
