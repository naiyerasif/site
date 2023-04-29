const themeSwitcherTemplate = document.createElement("template")
themeSwitcherTemplate.innerHTML = `
<button type="button" role="switch" aria-live="polite" aria-checked="true" id="theme-switcher" part="button">
	<slot name="theme-dark">Dark theme</slot>
	<slot name="theme-light">Light theme</slot>
</button>
`

export default class ThemeSwitcher extends HTMLElement {
	static tagName = "theme-switcher"
	
	static _themeChangeEvent = "themechange"
	static _keyDarkTheme = "dark"
	static _keyLightTheme = "light"
	static _themes = [ThemeSwitcher._keyDarkTheme, ThemeSwitcher._keyLightTheme]
	static _ariaLabels = ThemeSwitcher._themes.reduce((v, theme) => ({ ...v, [theme]: `${theme.charAt(0).toUpperCase()}${theme.substring(1)} theme`}), {})

	_switch = null
	_currentTheme = window.__theme || ThemeSwitcher._keyDarkTheme
	_states = null
	_switchHandler = () => this._switchTheme()

	constructor() {
		super()

		const shadowRoot = this.attachShadow({ mode: "open" })
		shadowRoot.appendChild(themeSwitcherTemplate.content.cloneNode(true))
		
		this._switch = shadowRoot.querySelector(`#${ThemeSwitcher.tagName}`)
		this._states = ThemeSwitcher._themes.reduce((v, theme) => ({ ...v, [theme]: shadowRoot.querySelector(`slot[name="theme-${theme}"]`)}), {})

		document.addEventListener(ThemeSwitcher._themeChangeEvent, (event) => {
			this._currentTheme = event.detail.theme
			this._updateTemplate()
		})
	}

	connectedCallback() {
		this._updateTemplate()
		this._switch.addEventListener("click", this._switchHandler)
	}

	disconnectedCallback() {
		this._switch.removeEventListener("click", this._switchHandler)
	}

	_switchTheme() {
		const currentIndex = ThemeSwitcher._themes.indexOf(this._currentTheme)
		const nextIndex = (currentIndex + 1) % ThemeSwitcher._themes.length
		const newTheme = ThemeSwitcher._themes[nextIndex]
		window.__setPreferredTheme(newTheme)
		this._currentTheme = newTheme
		this._updateTemplate()
	}

	_updateTemplate() {
		this._switch.setAttribute("aria-label", ThemeSwitcher._ariaLabels[this._currentTheme])
		ThemeSwitcher._themes.forEach(theme => this._states[theme].style.display = theme === this._currentTheme ? "revert" : "none")
	}
}

customElements.define(ThemeSwitcher.tagName, ThemeSwitcher)
