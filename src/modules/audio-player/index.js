class AudioPlayer extends HTMLElement {
	static register(tagName = "audio-player") {
		if ("customElements" in window && !customElements.get(tagName)) {
			customElements.define(tagName, this);
		}
	}

	connectedCallback() {
		this._renderPlay();
		const { signal } = this.abortController = new AbortController();
		this.button.addEventListener("click", this, { signal });
		this.player.addEventListener("ended", this, { signal });
	}

	disconnectedCallback() {
		this.abortController.abort();
	}

	handleEvent(event) {
		this[`_on_${event.type}`](event);
	}

	_on_ended(event) {
		this._renderPlay();
	}

	_on_click(event) {
		!this.player.paused ? this._pause(): this._play();
	}

	_pause() {
		this._renderPlay();
		this.player.pause();
	}

	_play() {
		this._renderPause();
		this.player.play();
	}

	_renderPause() {
		this.button.innerHTML = `
			<svg role="img" class="icon" aria-hidden="true"><use href="#x4-circle-stop"/></svg>
		`;
	}

	_renderPlay() {
		this.button.innerHTML = `
			<svg role="img" class="icon" aria-hidden="true"><use href="#x4-circle-play"/></svg>
		`;
	}

	get player() {
		return this.querySelector("audio");
	}

	get button() {
		return this.querySelector("button");
	}
}

AudioPlayer.register();
