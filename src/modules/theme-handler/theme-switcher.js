export default class ThemeSwitcher extends HTMLElement {
	static tagName = "theme-switcher"
	static #eventName = "themechange"
	static #darkTheme = "dark"
	static #lightTheme = "light"
	static #values = [ThemeSwitcher.#darkTheme, ThemeSwitcher.#lightTheme]
	static #ariaLabels = ThemeSwitcher.#values.reduce((v, theme) => ({ ...v, [theme]: `${theme.charAt(0).toUpperCase()}${theme.substring(1)} theme`}), {})
	
	#switcher = null
	#currentTheme = window.__theme || ThemeSwitcher.#darkTheme
	#states = null
	#clickHandler = () => this.#switchTheme()

	constructor() {
		super()

		this.innerHTML = this.#template()
		this.#switcher = this.querySelector(`#${ThemeSwitcher.tagName}`)
		this.#states = ThemeSwitcher.#values.reduce((v, theme) => ({ ...v, [theme]: this.querySelector(`#theme-${theme}`)}), {})

		document.addEventListener(ThemeSwitcher.#eventName, (event) => {
			this.#currentTheme = event.detail.theme
			this.#updateDom()
		})
	}

	connectedCallback() {
		this.#updateDom()
		this.#switcher.addEventListener("click", this.#clickHandler)
	}

	disconnectedCallback() {
		this.#switcher.removeEventListener("click", this.#clickHandler)
	}

	#switchTheme() {
		const currentIndex = ThemeSwitcher.#values.indexOf(this.#currentTheme)
		const nextIndex = (currentIndex + 1) % ThemeSwitcher.#values.length
		const newTheme = ThemeSwitcher.#values[nextIndex]
		window.__setPreferredTheme(newTheme)
		this.#currentTheme = newTheme
		this.#updateDom()
	}

	#updateDom() {
		this.#switcher.setAttribute("aria-label", ThemeSwitcher.#ariaLabels[this.#currentTheme])
		ThemeSwitcher.#values.forEach(theme => this.#states[theme].style.display = theme === this.#currentTheme ? "revert" : "none")
	}

	#template() {
		return `
		<button type="button" role="switch" aria-live="polite" aria-checked="true" id="theme-switcher">
			<svg role="img" class="icon" aria-hidden="true">
				<use id="theme-dark" href="#moon"/>
				<use id="theme-light" href="#sun"/>
			</svg>
		</button>
		`
	}
}

customElements.define(ThemeSwitcher.tagName, ThemeSwitcher)
