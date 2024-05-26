class DataSaver extends HTMLElement {
	static register(tagName = "data-saver") {
		if ("customElements" in window) {
			customElements.define(tagName, DataSaver);
		}
	}

	connectedCallback() {
		this.switch = this.querySelector("[data-saver-switch]");
		this.states = this.querySelectorAll("[data-saver-state]");
		this.preferences = [];
		for (const state of this.states) {
			this.preferences.push(state.dataset.saverState);
		}
		this._render();

		document.addEventListener("datasaverchange", this);
		this.switch.addEventListener("click", this);
	}

	handleEvent(event) {
		this[`_on_${event.type}`](event);
	}

	_on_datasaverchange(event) {
		this._render();
	}

	_on_click(event) {
		this._switchPreference();
	}

	_switchPreference() {
		const currentIndex = this.preferences.indexOf(window.__dataSaver);
		const nextIndex = (currentIndex + 1) % this.preferences.length;
		const newPreference = this.preferences[nextIndex];
		window.__setDataSaverPreference(newPreference);
		this._render();
	}

	_render() {
		this.switch.setAttribute("aria-label", `Data Saver ${window.__dataSaver}`);
		for (const state of this.states) {
			state.style.display = window.__dataSaver === state.dataset.saverState ? "revert" : "none";
		}
	}
}

DataSaver.register();
