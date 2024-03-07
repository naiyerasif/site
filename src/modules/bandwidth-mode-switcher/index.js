const bandwidthModeTemplate = document.createElement("template");
bandwidthModeTemplate.innerHTML = `
<button type="button" role="switch" aria-live="polite" aria-checked="true" id="bandwidth-mode-switcher" part="button" style="display:flex">
	<slot name="bandwidth-normal">Normal</slot>
	<slot name="bandwidth-minimal">Minimal</slot>
</button>
`;

export default class BandwidthModeSwitcher extends HTMLElement {
	static tagName = "bandwidth-mode-switcher";
	
	static #bandwidthModeChangeEvent = "bandwidthmodechange";
	static #keyNormalBandwidthMode = "normal";
	static #keyMinimalBandwidthMode = "minimal";
	static #bandwidthModes = [BandwidthModeSwitcher.#keyNormalBandwidthMode, BandwidthModeSwitcher.#keyMinimalBandwidthMode];
	static #ariaLabels = BandwidthModeSwitcher.#bandwidthModes.reduce((v, bandwidthMode) => ({ ...v, [bandwidthMode]: `${bandwidthMode.charAt(0).toUpperCase()}${bandwidthMode.substring(1)} data use`}), {});

	#switch = null;
	#currentBandwidthMode = window.__bandwidthMode || BandwidthModeSwitcher.#keyNormalBandwidthMode;
	#states = null;
	#switchHandler = () => this.#switchBandwidthMode();

	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.appendChild(bandwidthModeTemplate.content.cloneNode(true));
		
		this.#switch = shadowRoot.querySelector(`#${BandwidthModeSwitcher.tagName}`);
		this.#states = BandwidthModeSwitcher.#bandwidthModes.reduce((v, bandwidthMode) => ({ ...v, [bandwidthMode]: shadowRoot.querySelector(`slot[name="bandwidth-${bandwidthMode}"]`)}), {});

		document.addEventListener(BandwidthModeSwitcher.#bandwidthModeChangeEvent, (event) => {
			this.#currentBandwidthMode = event.detail.bandwidthMode;
			this.#updateTemplate();
		});

		document.addEventListener("togglebandwidthmode", this.#switchHandler);
	}

	connectedCallback() {
		this.#updateTemplate();
		this.#switch.addEventListener("click", this.#switchHandler);
	}

	disconnectedCallback() {
		this.#switch.removeEventListener("click", this.#switchHandler);
	}

	#switchBandwidthMode() {
		const currentIndex = BandwidthModeSwitcher.#bandwidthModes.indexOf(this.#currentBandwidthMode);
		const nextIndex = (currentIndex + 1) % BandwidthModeSwitcher.#bandwidthModes.length;
		const newBandwidthMode = BandwidthModeSwitcher.#bandwidthModes[nextIndex];
		window.__setPreferredBandwidthMode(newBandwidthMode);
		this.#currentBandwidthMode = newBandwidthMode;
		this.#updateTemplate();
	}

	#updateTemplate() {
		this.#switch.setAttribute("aria-label", BandwidthModeSwitcher.#ariaLabels[this.#currentBandwidthMode]);
		BandwidthModeSwitcher.#bandwidthModes.forEach(bandwidthMode => this.#states[bandwidthMode].style.display = bandwidthMode === this.#currentBandwidthMode ? "revert" : "none");
	}
}

customElements.define(BandwidthModeSwitcher.tagName, BandwidthModeSwitcher);
