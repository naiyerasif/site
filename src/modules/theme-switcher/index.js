class ThemeSwitcher extends HTMLElement {
	static register(tagName = "theme-switcher") {
		if ("customElements" in window) {
			customElements.define(tagName, ThemeSwitcher);
		}
	}

	connectedCallback() {
		this.switch = this.querySelector("[data-theme-switch]");
		this.states = this.querySelectorAll("[data-theme-state]");
		this.themes = [];
		for (const state of this.states) {
			this.themes.push(state.dataset.themeState);
		}
		this._render();

		document.addEventListener("themechange", this);
		this.switch.addEventListener("click", this);
	}

	handleEvent(event) {
		this[`_on_${event.type}`](event);
	}

	_on_themechange(event) {
		this._render();
	}

	_on_click(event) {
		this._switchTheme();
	}

	_switchTheme() {
		const currentIndex = this.themes.indexOf(window.__theme);
		const nextIndex = (currentIndex + 1) % this.themes.length;
		const newTheme = this.themes[nextIndex];
		window.__setTheme(newTheme);
		this._render();
	}

	_render() {
		this.switch.setAttribute("aria-label", `${window.__theme} theme`);
		for (const state of this.states) {
			state.style.display = window.__theme === state.dataset.themeState ? "revert" : "none";
		}
	}
}

ThemeSwitcher.register();
