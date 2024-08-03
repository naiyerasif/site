class CommandBar extends HTMLElement {
	static register(tagName = "command-bar") {
		if ("customElements" in window) {
			customElements.define(tagName, CommandBar);
		}
	}

	constructor() {
		super();

		this.query = "";
		this.searchIndex = [];
		this.searchResults = [];
		this.anchorIcon = `<svg role="img" class="icon" aria-hidden="true"><use href="#x2-arrow-right"/></svg>`;
	}

	async connectedCallback() {
		this.dialog = this.querySelector("#cmdb");
		this.launcher = this.querySelector("[data-cmdb-switch]");
		this.escaper = this.querySelector("[data-cmdb-esc]");
		this.searchBox = this.querySelector("input[autofocus]");
		this.resetter = this.querySelector("[data-cmdb-reset]");
		this.commands = this.querySelector("#commands");

		this.closeDialog = () => {
			this.dialog.close();
		}

		this.openDialog = (event) => {
			this.dialog.showModal();
			event?.stopPropagation();
		}

		this.escapeHandler = ({target:dialog}) => {
			if (dialog.nodeName === "DIALOG") {
				this.closeDialog();
			}
		};

		this.resetHandler = () => {
			this._clearSearchBox();
		}

		this.searchHandler = (event) => {
			this.query = this.searchBox.value;

			if (this.query) {
				this._search();
				this._updateResults();
			} else {
				this._clearSearchBox();
			}
		}

		this.dialog.addEventListener("click", this.escapeHandler);
		this.launcher.addEventListener("click", this.openDialog);
		this.escaper.addEventListener("click", this.closeDialog);
		this.resetter.addEventListener("click", this.resetHandler);
		this.searchBox.addEventListener("keyup", this.searchHandler);

		// focus on the search box
		const dialogOpenObserver = new MutationObserver(mutations => {
			mutations.forEach(async mutation => {
				if (mutation.attributeName === "open") {
					const dialog = mutation.target;
					const isOpen = dialog.hasAttribute("open");
					if (!isOpen) return;

					const focussedOnSearch = this.activeElement?.nodeName === "INPUT";
					if (!focussedOnSearch) {
						this.searchBox.click();
					}
				}
			});
		});
		dialogOpenObserver.observe(this.dialog, {attributes:true});

		// open command bar with keyboard shortcut
		document.addEventListener("keydown", (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				this.openDialog(event);
			}
		});

		await this._setupCommands();
		this._updateResults();
	}

	disconnectedCallback() {
		this.dialog.removeEventListener("click", this.escapeHandler);
		this.launcher.removeEventListener("click", this.openDialog);
		this.escaper.removeEventListener("click", this.closeDialog);
		this.resetter.removeEventListener("click", this.resetHandler);
		this.searchBox.removeEventListener("keyup", this.searchHandler);
	}

	_clearSearchBox() {
		this.searchBox.value = "";
		this.searchResults = [];
		this.query = "";
		this._updateResults();
	}

	_search() {
		if (this.query && this.query.length > 2) {
			this.searchResults = window.__search(this.query, this.searchIndex)
				.map(result => {
					const { item } = result;
					item.section = item.section || "Default";
					return item;
				});

			if (this.searchResults && this.searchResults.length) {
				this._setRecents(this.searchResults.filter(result => result.section === "Default"));
			}
		}
	}

	_updateResults() {
		const items = this._getItemsToDisplay();

		if (items && items.length) {
			this.commands.replaceChildren(...items);
		}
	}

	_getItemsToDisplay() {
		return this.searchResults && this.searchResults.length ? [this._getSearchResults()] : this._getDefaultCommands();
	}

	_getSearchResults() {
		const searchResults = document.createElement("section");
		searchResults.classList.add("cmdb-section");
		searchResults.classList.add("search-results");

		const numberOfResults = this.searchResults.length;
		const searchResultsHeader = document.createElement("div");
		searchResultsHeader.classList.add("cmdb-section-header");
		searchResultsHeader.innerText = numberOfResults > 1 ? numberOfResults + " results" : numberOfResults + " result";
		searchResults.appendChild(searchResultsHeader);

		const sectionItems = document.createElement("div");
		sectionItems.classList.add("cmdb-section-items");

		this.searchResults.forEach(item => {
			sectionItems.appendChild(this._getItemToDisplay(item, "command-item"));
		});

		searchResults.appendChild(sectionItems);
		return searchResults;
	}

	_getDefaultCommands() {
		const items = this._groupBy(this.searchIndex, "section");
		const nodes = [];

		if (this.recents && this.recents.length) {
			nodes.push(this._getSectionItems(this.recents, "Recent search results", "recently-searched"));
		}

		if (items["Navigation"] && items["Navigation"].length) {
			nodes.push(this._getSectionItems(items["Navigation"], "Navigation", "navigation"));
		}

		if (items["Preferences"] && items["Preferences"].length) {
			nodes.push(this._getSectionItems(items["Preferences"], "Preferences", "preferences"));
		}

		return nodes;
	}

	_getSectionItems(items, title, cls) {
		const section = document.createElement("section");
		section.classList.add("cmdb-section");
		section.classList.add(cls);

		const sectionHeader = document.createElement("div");
		sectionHeader.classList.add("cmdb-section-header");
		sectionHeader.innerText = title;
		section.appendChild(sectionHeader);

		const sectionItems = document.createElement("div");
		sectionItems.classList.add("cmdb-section-items");

		items.forEach(item => {
			sectionItems.appendChild(this._getItemToDisplay(item, "command-item"));
		});

		section.appendChild(sectionItems);
		return section;
	}

	_getItemToDisplay(item, cls) {
		if (item.path) {
			const anchor = document.createElement("a");
			anchor.classList.add(cls);
			anchor.setAttribute("href", item.path);
			anchor.setAttribute("part", "link");
			anchor.innerHTML = (item.icon || this.anchorIcon) + item.title;
			return anchor;
		} else {
			const div = document.createElement("div");
			div.classList.add(cls);
			div.innerHTML = item.content;
			return div.childNodes[0];
		}
	}

	async _setupCommands() {
		this.searchIndex = (await (await fetch("/search-index.json")).json())
			.map(item => {
				item.section = item.section || "Default"
				return item
			});

		this._getRecents();
	}

	_getRecents() {
		try {
			const storedSearchItems = localStorage.getItem("search-items");
			
			if (storedSearchItems && storedSearchItems.length) {
				this.recents = JSON.parse(storedSearchItems).slice(0, 5);
			}
		} catch (err) {}
	}

	_setRecents(searchResults) {
		try {
			if (this.recents && this.recents.length > 1) {
				this.recents = this._unique([...searchResults, ...this.recents]).slice(0, 5);
			} else {
				this.recents = this._unique(searchResults).slice(0, 5);
			}
			
			localStorage.setItem("search-items", JSON.stringify(this.recents));
		} catch (err) {}
	}

	_unique(array) {
		return array.filter(function (value, index, self) {
			return self.findIndex(function (v) { return v.title === value.title }) === index;
		});
	}

	_groupBy(array, key) {
		return array.reduce(function(storage, item) {
			(storage[item[key]] = storage[item[key]] || []).push(item);
			return storage;
		}, {});
	}
}

CommandBar.register();
