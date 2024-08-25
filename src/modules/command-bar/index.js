export class CommandBar extends HTMLElement {
	static tagName = "command-bar"
	static #searchOptions = {
		shouldSort: true,
		includeMatches: true,
		tokenize: true,
		matchAllTokens: true,
		threshold: 0.3,
		location: 0,
		distance: 600,
		maxPatternLength: 32,
		minMatchCharLength: 3,
		keys: ["title", "tags"]
	}
	static #anchorIcon = `<svg role="img" class="icon" aria-hidden="true"><use href="#arrow-right"/></svg>`

	#commandBar = null
	#launcher = null
	#escaper = null
	#searchBox = null
	#resetter = null
	#searchIndex = []
	#searchResults = []
	#query = ""
	#recents = []
	#commands = null
	#searchHandler = (event) => {
		this.#query = this.#searchBox.value
		
		if (this.#query) {
			if (this.#query.length > 3) {
				this.#search()
				this.#updateResults()
			}
		} else {
			this.#clearSearchBox()
		}
	}
	#commandHandler = (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key === "k") {
			event.preventDefault()
			this.#launcher.click()
		}
	}
	#focusHandler = (event) => {
		this.#searchBox.focus()
	}
	#escapeHandler = () => this.#commandBar.close()
	#resetHandler = () => this.#clearSearchBox()

	constructor() {
		super()

		this.innerHTML = this.#template()

		this.#commandBar = this.querySelector(`#${CommandBar.tagName}`)
		this.#launcher = this.querySelector(`button[slot="invoker"]`)
		this.#escaper = this.querySelector(`button[part="escaper"]`)
		this.#searchBox = this.querySelector(`#search-box`)
		this.#resetter = this.querySelector(`button[part="resetter"]`)
		this.#commands = this.querySelector(`#commands`)
	}

	async connectedCallback() {
		this.#commandBar.addEventListener("dialog-opened", this.#focusHandler)
		document.addEventListener("keydown", this.#commandHandler)
		this.#escaper.addEventListener("click", this.#escapeHandler)
		this.#resetter.addEventListener("click", this.#resetHandler)
		this.#searchBox.addEventListener("keyup", this.#searchHandler)

		await this.#setupCommands()
		this.#updateResults()
	}

	disconnectedCallback() {
		this.#commandBar.removeEventListener("dialog-opened", this.#focusHandler)
		document.removeEventListener("keydown", this.#commandHandler)
		this.#escaper.removeEventListener("click", this.#escapeHandler)
		this.#resetter.removeEventListener("click", this.#resetHandler)
		this.#searchBox.removeEventListener("keyup", this.#searchHandler)
	}

	#updateResults() {
		const items = this.#getItemsToDisplay()

		if (items && items.length) {
			this.#commands.replaceChildren(...items)
		}
	}

	#clearSearchBox() {
		this.#searchBox.value = ""
		this.#searchResults = []
		this.#query = ""
		this.#updateResults()
	}

	#search() {
		if (this.#query && this.#query.length > 3) {
			const fuse = new Fuse(this.#searchIndex, CommandBar.#searchOptions)
			this.#searchResults = fuse.search(this.#query)
				.map(result => {
					const { item } = result
					item.section = item.section || "Default"
					return item
				})

			if (this.#searchResults && this.#searchResults.length) {
				this.#setRecents(this.#searchResults.filter(result => result.section === "Default"))
			}
		}
	}

	#getItemsToDisplay() {
		return this.#searchResults && this.#searchResults.length ? [this.#getSearchResults()] : this.#getDefaultCommands()
	}

	#getSearchResults() {
		const searchResults = document.createElement("section")
		searchResults.classList.add("command-bar-section")
		searchResults.classList.add("search-results")

		const numberOfResults = this.#searchResults.length
		const searchResultsHeader = document.createElement("div")
		searchResultsHeader.classList.add("command-bar-section-header")
		searchResultsHeader.innerText = numberOfResults > 1 ? numberOfResults + " results" : numberOfResults + " result"
		searchResults.appendChild(searchResultsHeader)

		const sectionItems = document.createElement("div")
		sectionItems.classList.add("command-bar-section-items")

		this.#searchResults.forEach(item => {
			sectionItems.appendChild(this.#getItemToDisplay(item, "command-item"))
		})

		searchResults.appendChild(sectionItems)
		return searchResults
	}

	#getDefaultCommands() {
		const items = this.#groupBy(this.#searchIndex, "section")
		const nodes = []

		if (this.#recents && this.#recents.length) {
			nodes.push(this.#getSectionItems(this.#recents, "Recently searched", "recently-searched"))
		}

		if (items["Navigation"] && items["Navigation"].length) {
			nodes.push(this.#getSectionItems(items["Navigation"], "Navigation", "navigation"))
		}

		if (items["Preferences"] && items["Preferences"].length) {
			nodes.push(this.#getSectionItems(items["Preferences"], "Preferences", "preferences"))
		}

		return nodes
	}

	#getSectionItems(items, title, cls) {
		const section = document.createElement("section")
		section.classList.add("command-bar-section")
		section.classList.add(cls)

		const sectionHeader = document.createElement("div")
		sectionHeader.classList.add("command-bar-section-header")
		sectionHeader.innerText = title
		section.appendChild(sectionHeader)

		const sectionItems = document.createElement("div")
		sectionItems.classList.add("command-bar-section-items")

		items.forEach(item => {
			sectionItems.appendChild(this.#getItemToDisplay(item, "command-item"))
		})

		section.appendChild(sectionItems)
		return section
	}

	#getItemToDisplay(item, cls) {
		if (item.path) {
			const anchor = document.createElement("a")
			anchor.classList.add(cls)
			anchor.setAttribute("href", item.path)
			anchor.innerHTML = CommandBar.#anchorIcon + item.title
			return anchor
		} else {
			const div = document.createElement("div")
			div.classList.add(cls)
			div.innerHTML = item.content
			return div
		}
	}

	async #setupCommands() {
		this.#searchIndex = (await (await fetch("/search-index.json")).json())
			.map(item => {
				item.section = item.section || "Default"
				return item
			})

		this.#getRecents()
	}

	#getRecents() {
		try {
			const storedSearchItems = localStorage.getItem("search-items")
			
			if (storedSearchItems && storedSearchItems.length) {
				this.#recents = JSON.parse(storedSearchItems).slice(0, 5)
			}
		} catch (err) {}
	}

	#setRecents(searchResults) {
		try {
			if (this.#recents && this.#recents.length > 1) {
				this.#recents = this.#unique([...searchResults, ...this.#recents]).slice(0, 5)
			} else {
				this.#recents = this.#unique(searchResults).slice(0, 5)
			}
			
			localStorage.setItem("search-items", JSON.stringify(this.#recents))
		} catch (err) {}
	}

	#unique(array) {
		return array.filter(function (value, index, self) {
			return self.indexOf(value) === index
		})
	}

	#groupBy(array, key) {
		return array.reduce(function(storage, item) {
			(storage[item[key]] = storage[item[key]] || []).push(item)
			return storage
		}, {})
	}

	#template() {
		return `
		<generic-dialog close-on-outside-click close-on-escape id="command-bar">
			<button slot="invoker" type="button" aria-label="Open command bar">
				<svg role="img" class="icon" aria-hidden="true">
					<use href="#command-key"/>
				</svg>
			</button>
			<section slot="content" class="command-bar-items">
				<header class="command-bar-header">
					<input id="search-box" placeholder="Search for something...">
					<button part="resetter" type="reset" aria-label="Reset search">
						<svg role="img" class="icon" aria-hidden="true">
							<use href="#undo"/>
						</svg>
					</button>
					<button part="escaper" type="button" aria-label="Close command bar">
						<svg role="img" class="icon" aria-hidden="true">
							<use href="#x"/>
						</svg>
					</button>
				</header>
				<div id="commands" tabindex="-1"></div>
				<footer class="command-bar-footer">
					<span><kbd>Tab</kbd> <kbd>Shift+Tab</kbd> to navigate</span>
					<span><kbd>Esc</kbd> or click outside to close</span>
				</footer>
			</section>
		</generic-dialog>
		`
	}
}

customElements.define(CommandBar.tagName, CommandBar)
