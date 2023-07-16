const commandBarTemplate = document.createElement("template");
commandBarTemplate.innerHTML = `
<button type="button" role="switch" aria-live="polite" aria-checked="true" id="command-bar-launcher" aria-label="Launch CommandBar" part="button">
	<svg role="img" class="icon" aria-hidden="true"><use href="#magnifier"/></svg>
	<span class="label">Search</span> <kbd class="label"></kbd>
</button>
<dialog aria-label="CommandBar" id="command-bar">
	<header class="command-bar-header">
		<input id="search-box" placeholder="Search..." autofocus>
		<button type="reset" aria-label="Reset search" part="button" id="search-box-resetter">
			<svg role="img" class="icon" aria-hidden="true"><use href="#reset"/></svg>
		</button>
		<button type="button" aria-label="Close CommandBar" part="button" id="command-bar-escaper">
			<svg role="img" class="icon" aria-hidden="true"><use href="#close"/></svg>
		</button>
	</header>
	<div id="commands" tabindex="-1"></div>
	<footer class="command-bar-footer">
		<span><kbd>Tab</kbd> <kbd>Shift+Tab</kbd> to navigate</span>
		<span><kbd>Esc</kbd> or click outside to close</span>
	</footer>
</dialog>
<div style="display:none">
	<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		<symbol viewBox="0 0 24 24" id="arrow-right">
			<path d="M6 12h12m-6-6 6 6-6 6"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="close">
			<path d="m6 6 12 12M6 18 18 6"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="magnifier">
			<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="moon">
			<path d="M13.355 2C18.238 2.684 22 6.882 22 11.951 22 17.497 17.497 22 11.951 22 6.882 22 2.684 18.238 2 13.355a8.018 8.018 0 0 0 5.932 2.616 8.043 8.043 0 0 0 8.039-8.039A8.018 8.018 0 0 0 13.355 2Z"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="reset">
			<path d="M9.375 13.75 5 9.375 9.375 5"/><path d="M5 9.375h9.188c2.64 0 4.812 2.172 4.812 4.812C19 16.828 16.828 19 14.188 19h-3.063"/>
		</symbol>
		<symbol viewBox="0 0 24 24" id="sun">
			<path d="m9.321 2 .535 2m4.288 16 .535 2M3.036 6.824l1.787 1.033m14.354 8.286 1.787 1.033M2 14.679l2-.535m16-4.288 2-.535M7.857 19.177l-1.033 1.787M17.176 3.036l-1.033 1.787"/><circle cx="12" cy="12" r="4"/>
		</symbol>
	</svg>
</div>
<style>
:host {
	font-size: calc(1rem + 0.2vw);
	color: var(--color-site-base);
}
.icon {
	stroke: currentColor;
	stroke-width: 2;
	fill: none;
	width: var(--size-site-icon);
	height: var(--size-site-icon);
	flex-shrink: 0;
}
kbd {
	background-color: var(--background-site-subtle);
	border-radius: var(--radius-site-tiny);
	font-size: 0.95em;
	padding-inline: 0.5ch;
}
#command-bar::backdrop {
	backdrop-filter: blur(25px);
}
#command-bar {
	inline-size: calc(100% - 2px);
	max-inline-size: var(--max-width-site-content);
	overflow: hidden;
	border: var(--thickness-site-hr) solid var(--border-site-body);
	border-radius: var(--radius-site-base);
	background-color: var(--background-site-body);
	padding: 0;
}
#command-bar-launcher .label {
	display: none;
}
@media screen and (min-width: 48rem) {
	#command-bar-launcher {
		display: flex;
		align-items: center;
		border: 1px solid var(--border-site-body) !important;
		font: inherit;
		font-size: 0.9em;
	}

	#command-bar-launcher .label {
		display: revert;
	}

	#command-bar-launcher .icon {
		margin-inline-end: 0.5ch;
	}

	#command-bar-launcher kbd {
		margin-inline-start: 5rem;
		color: var(--color-site-base);
		line-height: 1;
		padding: 0.25rem 0.5rem;
		border-radius: var(--radius-site-small);
	}
}
.command-bar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem;
}
.command-bar-header > * + * {
	margin-inline-start: 1.5ch;
}
theme-switcher::part(button),
#search-box {
	inline-size: 100%;
	accent-color: var(--color-site-link-base);
	caret-color: var(--color-site-link-base);
	background-color: var(--border-site-subtle);
	border-radius: var(--radius-site-small);
	border-color: var(--border-site-body);
	border-style: solid;
	border-width: var(--thickness-site-hr);
	font-size: 1rem;
}
#search-box {
	padding: 0.65rem 0.75rem;
}
#search-box:is(:focus, :focus-visible, :focus-within, :hover, :active) {
	border-color: var(--color-site-link-active-base);
	outline-color: var(--border-site-base);
	outline-style: solid;
	outline-width: var(--thickness-site-form-outline);
	outline-offset: var(--offset-site-form-outline);
}
theme-switcher::part(button) {
	padding: 0.4rem;
	border-radius: var(--radius-site-icon);
	color: var(--color-site-link-base);
}
theme-switcher::part(button):is(:focus, :focus-visible, :focus-within, :hover, :active) {
	outline-color: var(--border-site-base);
	outline-style: solid;
	outline-width: var(--thickness-site-form-outline);
	outline-offset: var(--offset-site-form-outline);
}
#commands {
	max-block-size: 420px;
	overflow-y: auto;
}
.command-bar-section-header {
	background-color: var(--background-site-note);
	font-size: var(--text-site-small);
	font-weight: var(--font-weight-site-medium);
	color: var(--color-site-note);
	line-height: 1;
	padding: 0.5rem 1rem;
}
.command-bar-section-items > * + * {
	border-block-start: var(--thickness-site-hr) solid var(--border-site-subtle);
}
a {
	color: var(--color-site-link-base);
	text-decoration-thickness: var(--thickness-site-decoration);
	text-decoration-line: underline;
	text-decoration-style: dotted;
}
a:is(:focus, :focus-within, :hover) {
	text-decoration-style: solid;
	background-color: var(--background-site-commend);
}
a:active {
	text-decoration-style: double;
}
a:focus-visible {
	border-radius: var(--radius-site-tiny);
}
.command-item {
	display: flex;
	align-items: center;
	padding: 0.8rem 1rem;
}
.command-item:focus-visible {
	outline-color: currentColor;
	outline-style: double;
	outline-width: var(--thickness-site-link-outline);
	outline-offset: -0.125em;
}
.command-item > .icon {
	margin-inline-end: 1ch;
}
.command-bar-footer {
	display: none;
}
@media screen and (min-width: 48rem) {
	.command-bar-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		background-color: var(--border-site-subtle);
		font-size: var(--text-site-small);
		padding: 0.25rem 1rem;
		border-end-end-radius: inherit;
		border-end-start-radius: inherit;
		color: var(--color-site-base);
	}
	.command-bar-footer > *:not(:first-child)::before {
		content: "";
		mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='15' r='1'/%3E%3C/svg%3E");
		mask-repeat: no-repeat;
		mask-position: top center;
		mask-size: contain;
		background-color: currentColor;
		display: inline-block;
		inline-size: 1em;
		block-size: 1em;
		opacity: 0.5;
	}
}
</style>
`;

export class CommandBar extends HTMLElement {
	static tagName = "command-bar";
	static #searchOptions = {
		shouldSort: true,
		includeMatches: true,
		tokenize: true,
		matchAllTokens: true,
		threshold: 0.2,
		location: 0,
		distance: 600,
		minMatchCharLength: 3,
		keys: ["title", "tags"]
	};
	static #anchorIcon = `<svg role="img" class="icon" aria-hidden="true"><use href="#arrow-right"/></svg>`;

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

		const launcherLabel = this.#launcher.querySelector("kbd");
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
			anchor.innerHTML = CommandBar.#anchorIcon + item.title;
			return anchor;
		} else {
			const div = document.createElement("div");
			div.classList.add(cls);
			div.innerHTML = item.content;
			return div;
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
