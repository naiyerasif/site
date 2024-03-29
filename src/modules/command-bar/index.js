const commandBarTemplate = document.createElement("template");
commandBarTemplate.innerHTML = `
<button type="button" role="switch" aria-live="polite" aria-checked="true" id="command-bar-launcher" aria-label="Launch CommandBar" part="button">
	<svg role="img" class="icon" aria-hidden="true"><use href="#x2-magnifying-glass"/></svg>
</button>
<dialog aria-label="CommandBar" id="command-bar">
	<header class="command-bar-header">
		<input id="search-box" placeholder="Search..." part="input" autofocus>
		<button type="reset" aria-label="Reset search" part="button" id="search-box-resetter">
			<svg role="img" class="icon" aria-hidden="true"><use href="#x2-reset"/></svg>
		</button>
		<button type="button" aria-label="Close CommandBar" part="button" id="command-bar-escaper">
			<svg role="img" class="icon" aria-hidden="true"><use href="#x2-x"/></svg>
		</button>
	</header>
	<div id="commands" tabindex="-1"></div>
	<footer class="command-bar-footer">
		<strong>Keyboard shortcuts</strong>
		<span><kbd id="command-bar-launch-sequence"></kbd> to launch</span>
		<span><kbd>Tab</kbd> <kbd>Shift+Tab</kbd> to navigate</span>
		<span><kbd>Esc</kbd> or click outside to close</span>
	</footer>
</dialog>
<div style="display:none">
	<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<symbol viewBox="0 0 24 24" id="x2-arrow-right">
			<path d="M6 12h12m-6-6 6 6-6 6"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="x2-magnifying-glass">
			<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="x2-x">
			<path d="m6 6 12 12M6 18 18 6"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="x2-reset">
			<path d="M9.375 13.75 5 9.375 9.375 5"/><path d="M5 9.375h9.188c2.64 0 4.812 2.172 4.812 4.812C19 16.828 16.828 19 14.188 19h-3.063"/>
		</symbol>
	</svg>
</div>
<style>
.icon {
	--iconSize: var(--x2-size-icon, var(--x2-size-icon-0));
	display: inline-block;
	vertical-align: text-bottom;
	stroke: currentColor;
	stroke-width: 2;
	fill: none;
	stroke-linejoin: round;
	stroke-linecap: round;
	width: var(--iconSize);
	height: var(--iconSize);
	min-width: var(--iconSize);
	min-height: var(--iconSize);
}
#command-bar::backdrop {
	background-color: hsl(0, 0%, 10%, 0.5);
	-webkit-backdrop-filter: blur(25px);
	backdrop-filter: blur(25px);
}
#command-bar {
	width: calc(100% - 2px);
	max-width: var(--x2-max-width-content);
	overflow: hidden;
	border: var(--x2-line-width-sm) solid var(--x2-border-body);
	border-radius: var(--x2-radius-0);
	background-color: var(--x2-bg-body);
	padding: 0;
}
.command-bar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 0.5rem;
}
#search-box {
	width: 100%;
	font: inherit;
}
#commands {
	max-height: 60vh;
	overflow-y: auto;
}
.command-bar-section-header {
	background-color: var(--x2-border-note);
	font-size: 0.8em;
	color: var(--x2-color-body-emphasis);
	line-height: 1;
	padding: 0.5rem 1rem;
}
.command-bar-section-items > * + * {
	border-block-start: var(--x2-line-width-sm) solid var(--x2-border-codeblock);
}
a {
	color: var(--x2-color-link);
	text-decoration-line: underline;
	text-decoration-style: dotted;
}
a:focus,
a:focus-within,
a:focus-visible,
a:hover,
a:active {
	background-color: var(--x2-bg-accent-subtle);
	color: var(--x2-color-accent-sharp);
}
a:focus,
a:focus-within,
a:hover {
	text-decoration-style: solid;
	text-decoration-thickness: var(--x2-line-width-0);
}
a:active {
	text-decoration-style: double;
}
.command-item {
	display: flex;
	align-items: center;
	padding: 0.8rem 1rem;
}
.command-item:focus-visible {
	border-radius: var(--x2-radius-sm);
	text-decoration-color: transparent;
	outline-style: solid;
	outline-width: var(--x2-line-width-md);
	outline-offset: -0.25em;
}
.command-item > .icon {
	margin-right: 1ch;
}
.command-bar-footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	background-color: var(--x2-bg-note);
	font-size: 0.8em;
	padding: 0.25rem 1rem;
	border-bottom-right-radius: inherit;
	border-bottom-left-radius: inherit;
	color: var(--x2-color-body-subtle);
}
.command-bar-footer > *:not(:first-child)::before {
	content: "";
	mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='15' r='1'/%3E%3C/svg%3E");
	mask-repeat: no-repeat;
	mask-position: top center;
	mask-size: contain;
	background-color: currentColor;
	display: inline-block;
	width: 1em;
	height: 1em;
	opacity: 0.5;
}
kbd {
	background-color: var(--x2-bg-code);
	border-radius: var(--x2-radius-xxs);
	font-size: 0.85em;
	line-height: 1;
	padding: 0.25ch 0.75ch;
	color: var(--x2-color-body);
}
</style>
`;

export class CommandBar extends HTMLElement {
	static tagName = "command-bar";
	static #searchOptions = {
		shouldSort: true,
		threshold: 0.2,
		location: 0,
		distance: 300,
		minMatchCharLength: 3,
		keys: [ "title", "description" ]
	};
	static #anchorIcon = `<svg role="img" class="icon" aria-hidden="true"><use href="#x2-arrow-right"/></svg>`;

	#commandBar = null;
	#launcher = null;
	#escaper = null;
	#searchBox = null;
	#resetter = null;
	#commands = null;
	#searchIndex = [];
	#searchResults = [];
	#query = "";
	#recents = [];
	#searchHandler = (event) => {
		this.#query = this.#searchBox.value;
		
		if (this.#query) {
			this.#search();
			this.#updateResults();
		} else {
			this.#clearSearchBox();
		}
	};
	#resetHandler = () => this.#clearSearchBox();
	
	constructor() {
		super();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.appendChild(commandBarTemplate.content.cloneNode(true));

		this.#commandBar = shadowRoot.querySelector(`#${CommandBar.tagName}`);
		this.#launcher = shadowRoot.querySelector(`#${CommandBar.tagName}-launcher`);
		this.#escaper = shadowRoot.querySelector(`#${CommandBar.tagName}-escaper`);
		this.#searchBox = shadowRoot.querySelector(`#search-box`);
		this.#resetter = shadowRoot.querySelector(`#search-box-resetter`);
		this.#commands = shadowRoot.querySelector(`#commands`);

		const launcherLabel = shadowRoot.querySelector(`#command-bar-launch-sequence`);
		launcherLabel.innerText = window.navigator.platform.indexOf("Mac") > -1 ?
			"⌘+K" : "Ctrl+K";

		const dialogOpenObserver = new MutationObserver(mutations => {
			mutations.forEach(async mutation => {
				if (mutation.attributeName === "open") {
					const dialog = mutation.target;
					const isOpen = dialog.hasAttribute("open");
					if (!isOpen) return;

					const focussedOnSearch = shadowRoot.activeElement?.nodeName === "INPUT";
					if (!focussedOnSearch) {
						this.#searchBox.click();
					}
				}
			});
		});
		dialogOpenObserver.observe(this.#commandBar, {attributes:true});

		const escapeHandler = ({target:dialog}) => {
			if (dialog.nodeName === "DIALOG") {
				closeDialog();
			}
		};

		const openDialog = (event) => {
			this.#commandBar.showModal();
			event?.stopPropagation();
		}

		const closeDialog = () => {
			this.#commandBar.close();
		}

		this.#commandBar.addEventListener("click", escapeHandler);
		this.#launcher.addEventListener("click", openDialog);
		this.#escaper.addEventListener("click", closeDialog);

		document.addEventListener("keydown", (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				openDialog(event);
			}
		});

		document.addEventListener("opensearch", (event) => {
			openDialog(event);
		});
	}

	async connectedCallback() {
		this.#resetter.addEventListener("click", this.#resetHandler);
		this.#searchBox.addEventListener("keyup", this.#searchHandler);

		await this.#setupCommands();
		this.#updateResults();
	}

	disconnectedCallback() {
		this.#resetter.removeEventListener("click", this.#resetHandler);
		this.#searchBox.removeEventListener("keyup", this.#searchHandler);
	}

	#updateResults() {
		const items = this.#getItemsToDisplay();

		if (items && items.length) {
			this.#commands.replaceChildren(...items);
		}
	}

	#clearSearchBox() {
		this.#searchBox.value = "";
		this.#searchResults = [];
		this.#query = "";
		this.#updateResults();
	}

	#search() {
		if (this.#query && this.#query.length > 2) {
			const fuse = new Fuse(this.#searchIndex, CommandBar.#searchOptions);
			this.#searchResults = fuse.search(this.#query)
				.map(result => {
					const { item } = result;
					item.section = item.section || "Default";
					return item;
				});

			if (this.#searchResults && this.#searchResults.length) {
				this.#setRecents(this.#searchResults.filter(result => result.section === "Default"));
			}
		}
	}

	#getItemsToDisplay() {
		return this.#searchResults && this.#searchResults.length ? [this.#getSearchResults()] : this.#getDefaultCommands();
	}

	#getSearchResults() {
		const searchResults = document.createElement("section");
		searchResults.classList.add("command-bar-section");
		searchResults.classList.add("search-results");

		const numberOfResults = this.#searchResults.length;
		const searchResultsHeader = document.createElement("div");
		searchResultsHeader.classList.add("command-bar-section-header");
		searchResultsHeader.innerText = numberOfResults > 1 ? numberOfResults + " results" : numberOfResults + " result";
		searchResults.appendChild(searchResultsHeader);

		const sectionItems = document.createElement("div");
		sectionItems.classList.add("command-bar-section-items");

		this.#searchResults.forEach(item => {
			sectionItems.appendChild(this.#getItemToDisplay(item, "command-item"));
		});

		searchResults.appendChild(sectionItems);
		return searchResults;
	}

	#getDefaultCommands() {
		const items = this.#groupBy(this.#searchIndex, "section");
		const nodes = [];

		if (this.#recents && this.#recents.length) {
			nodes.push(this.#getSectionItems(this.#recents, "Recently searched", "recently-searched"));
		}

		if (items["Navigation"] && items["Navigation"].length) {
			nodes.push(this.#getSectionItems(items["Navigation"], "Navigation", "navigation"));
		}

		if (items["Preferences"] && items["Preferences"].length) {
			nodes.push(this.#getSectionItems(items["Preferences"], "Preferences", "preferences"));
		}

		return nodes;
	}

	#getSectionItems(items, title, cls) {
		const section = document.createElement("section");
		section.classList.add("command-bar-section");
		section.classList.add(cls);

		const sectionHeader = document.createElement("div");
		sectionHeader.classList.add("command-bar-section-header");
		sectionHeader.innerText = title;
		section.appendChild(sectionHeader);

		const sectionItems = document.createElement("div");
		sectionItems.classList.add("command-bar-section-items");

		items.forEach(item => {
			sectionItems.appendChild(this.#getItemToDisplay(item, "command-item"));
		});

		section.appendChild(sectionItems);
		return section;
	}

	#getItemToDisplay(item, cls) {
		if (item.path) {
			const anchor = document.createElement("a");
			anchor.classList.add(cls);
			anchor.setAttribute("href", item.path);
			anchor.setAttribute("part", "link");
			anchor.innerHTML = (item.icon || CommandBar.#anchorIcon) + item.title;
			return anchor;
		} else {
			const div = document.createElement("div");
			div.classList.add(cls);
			div.innerHTML = item.content;
			return div.childNodes[0];
		}
	}

	async #setupCommands() {
		this.#searchIndex = (await (await fetch("/search-index.json")).json())
			.map(item => {
				item.section = item.section || "Default"
				return item
			});

		this.#getRecents();
	}

	#getRecents() {
		try {
			const storedSearchItems = localStorage.getItem("search-items");
			
			if (storedSearchItems && storedSearchItems.length) {
				this.#recents = JSON.parse(storedSearchItems).slice(0, 5);
			}
		} catch (err) {}
	}

	#setRecents(searchResults) {
		try {
			if (this.#recents && this.#recents.length > 1) {
				this.#recents = this.#unique([...searchResults, ...this.#recents]).slice(0, 5);
			} else {
				this.#recents = this.#unique(searchResults).slice(0, 5);
			}
			
			localStorage.setItem("search-items", JSON.stringify(this.#recents));
		} catch (err) {}
	}

	#unique(array) {
		return array.filter(function (value, index, self) {
			return self.findIndex(function (v) { return v.title === value.title }) === index;
		});
	}

	#groupBy(array, key) {
		return array.reduce(function(storage, item) {
			(storage[item[key]] = storage[item[key]] || []).push(item);
			return storage;
		}, {});
	}
}

customElements.define(CommandBar.tagName, CommandBar);
