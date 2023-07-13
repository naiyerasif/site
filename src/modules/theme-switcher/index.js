const themeSwitcherTemplate = document.createElement("template");
themeSwitcherTemplate.innerHTML = `
<button type="button" role="switch" aria-live="polite" aria-checked="true" id="theme-switcher" part="button" style="display:flex">
	<slot name="theme-dark">Dark theme</slot>
	<slot name="theme-light">Light theme</slot>
</button>
`;

export default class ThemeSwitcher extends HTMLElement {
	static tagName = "theme-switcher";
	
	static #themeChangeEvent = "themechange";
	static #keyDarkTheme = "dark";
	static #keyLightTheme = "light";
	static #themes = [ThemeSwitcher.#keyDarkTheme, ThemeSwitcher.#keyLightTheme];
	static #ariaLabels = ThemeSwitcher.#themes.reduce((v, theme) => ({ ...v, [theme]: `${theme.charAt(0).toUpperCase()}${theme.substring(1)} theme`}), {});

	#switch = null;
	#currentTheme = window.__theme || ThemeSwitcher.#keyDarkTheme;
	#states = null;
	#switchHandler = () => this.#switchTheme();

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.appendChild(themeSwitcherTemplate.content.cloneNode(true));
		
		this.#switch = shadowRoot.querySelector(`#${ThemeSwitcher.tagName}`);
		this.#states = ThemeSwitcher.#themes.reduce((v, theme) => ({ ...v, [theme]: shadowRoot.querySelector(`slot[name="theme-${theme}"]`)}), {});

		document.addEventListener(ThemeSwitcher.#themeChangeEvent, (event) => {
			this.#currentTheme = event.detail.theme;
			this.#updateTemplate();
		});
	}

	connectedCallback() {
		this.#updateTemplate();
		this.#switch.addEventListener("click", this.#switchHandler);
	}

	disconnectedCallback() {
		this.#switch.removeEventListener("click", this.#switchHandler);
	}

	#switchTheme() {
		const currentIndex = ThemeSwitcher.#themes.indexOf(this.#currentTheme);
		const nextIndex = (currentIndex + 1) % ThemeSwitcher.#themes.length;
		const newTheme = ThemeSwitcher.#themes[nextIndex];
		window.__setPreferredTheme(newTheme);
		this.#currentTheme = newTheme;
		this.#updateTemplate();
	}

	#updateTemplate() {
		this.#switch.setAttribute("aria-label", ThemeSwitcher.#ariaLabels[this.#currentTheme]);
		ThemeSwitcher.#themes.forEach(theme => this.#states[theme].style.display = theme === this.#currentTheme ? "revert" : "none");
	}
}

customElements.define(ThemeSwitcher.tagName, ThemeSwitcher);
