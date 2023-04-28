/*! a11y-dialog 7.5.2 — © Kitty Giraudel */
var t=['a[href]:not([tabindex^="-"])','area[href]:not([tabindex^="-"])','input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])','input[type="radio"]:not([disabled]):not([tabindex^="-"])','select:not([disabled]):not([tabindex^="-"])','textarea:not([disabled]):not([tabindex^="-"])','button:not([disabled]):not([tabindex^="-"])','iframe:not([tabindex^="-"])','audio[controls]:not([tabindex^="-"])','video[controls]:not([tabindex^="-"])','[contenteditable]:not([tabindex^="-"])','[tabindex]:not([tabindex^="-"])'];function e(t){this._show=this.show.bind(this),this._hide=this.hide.bind(this),this._maintainFocus=this._maintainFocus.bind(this),this._bindKeypress=this._bindKeypress.bind(this),this.$el=t,this.shown=!1,this._id=this.$el.getAttribute("data-a11y-dialog")||this.$el.id,this._previouslyFocused=null,this._listeners={},this.create()}function i(t,e){return i=(e||document).querySelectorAll(t),Array.prototype.slice.call(i);var i}function s(t){(t.querySelector("[autofocus]")||t).focus()}function n(){i("[data-a11y-dialog]").forEach((function(t){new e(t)}))}e.prototype.create=function(){this.$el.setAttribute("aria-hidden",!0),this.$el.setAttribute("aria-modal",!0),this.$el.setAttribute("tabindex",-1),this.$el.hasAttribute("role")||this.$el.setAttribute("role","dialog"),this._openers=i('[data-a11y-dialog-show="'+this._id+'"]'),this._openers.forEach(function(t){t.addEventListener("click",this._show)}.bind(this));const t=this.$el;return this._closers=i("[data-a11y-dialog-hide]",this.$el).filter((function(e){return e.closest('[aria-modal="true"], [data-a11y-dialog]')===t})).concat(i('[data-a11y-dialog-hide="'+this._id+'"]')),this._closers.forEach(function(t){t.addEventListener("click",this._hide)}.bind(this)),this._fire("create"),this},e.prototype.show=function(t){return this.shown||(this._previouslyFocused=document.activeElement,this.$el.removeAttribute("aria-hidden"),this.shown=!0,s(this.$el),document.body.addEventListener("focus",this._maintainFocus,!0),document.addEventListener("keydown",this._bindKeypress),this._fire("show",t)),this},e.prototype.hide=function(t){return this.shown?(this.shown=!1,this.$el.setAttribute("aria-hidden","true"),this._previouslyFocused&&this._previouslyFocused.focus&&this._previouslyFocused.focus(),document.body.removeEventListener("focus",this._maintainFocus,!0),document.removeEventListener("keydown",this._bindKeypress),this._fire("hide",t),this):this},e.prototype.destroy=function(){return this.hide(),this._openers.forEach(function(t){t.removeEventListener("click",this._show)}.bind(this)),this._closers.forEach(function(t){t.removeEventListener("click",this._hide)}.bind(this)),this._fire("destroy"),this._listeners={},this},e.prototype.on=function(t,e){return void 0===this._listeners[t]&&(this._listeners[t]=[]),this._listeners[t].push(e),this},e.prototype.off=function(t,e){var i=(this._listeners[t]||[]).indexOf(e);return i>-1&&this._listeners[t].splice(i,1),this},e.prototype._fire=function(t,e){var i=this._listeners[t]||[],s=new CustomEvent(t,{detail:e});this.$el.dispatchEvent(s),i.forEach(function(t){t(this.$el,e)}.bind(this))},e.prototype._bindKeypress=function(e){const s=document.activeElement;s&&s.closest('[aria-modal="true"]')!==this.$el||(this.shown&&"Escape"===e.key&&"alertdialog"!==this.$el.getAttribute("role")&&(e.preventDefault(),this.hide(e)),this.shown&&"Tab"===e.key&&function(e,s){var n=function(e){return i(t.join(","),e).filter((function(t){return!!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)}))}(e),o=n.indexOf(document.activeElement);s.shiftKey&&0===o?(n[n.length-1].focus(),s.preventDefault()):s.shiftKey||o!==n.length-1||(n[0].focus(),s.preventDefault())}(this.$el,e))},e.prototype._maintainFocus=function(t){!this.shown||t.target.closest('[aria-modal="true"]')||t.target.closest("[data-a11y-dialog-ignore-focus-trap]")||s(this.$el)},"undefined"!=typeof document&&("loading"===document.readyState?document.addEventListener("DOMContentLoaded",n):window.requestAnimationFrame?window.requestAnimationFrame(n):window.setTimeout(n,16));

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
			this.#commandBar.show()
		}
	}
	#resetHandler = () => this.#clearSearchBox()

	constructor() {
		super()

		this.innerHTML = this.#template()

		this.#commandBar = new e(this.querySelector(`#${CommandBar.tagName}`))
		this.#searchBox = this.querySelector(`#search-box`)
		this.#resetter = this.querySelector(`button[part="resetter"]`)
		this.#commands = this.querySelector(`#commands`)
	}

	async connectedCallback() {
		document.addEventListener("keydown", this.#commandHandler)
		this.#resetter.addEventListener("click", this.#resetHandler)
		this.#searchBox.addEventListener("keyup", this.#searchHandler)

		await this.#setupCommands()
		this.#updateResults()
	}

	disconnectedCallback() {
		document.removeEventListener("keydown", this.#commandHandler)
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
		<button type="button" aria-label="Open command bar" data-a11y-dialog-show="command-bar">
			<svg role="img" class="icon" aria-hidden="true">
				<use href="#command-key"/>
			</svg>
		</button>
		<div class="dialog-container" id="command-bar" aria-hidden="true" aria-label="Command Bar">
			<div class="dialog-overlay" data-a11y-dialog-hide></div>
			<div class="dialog-content command-bar-items" role="document">
				<header class="command-bar-header">
					<input id="search-box" placeholder="Search for something..." autofocus>
					<button part="resetter" type="reset" aria-label="Reset search">
						<svg role="img" class="icon" aria-hidden="true">
							<use href="#undo"/>
						</svg>
					</button>
					<button data-a11y-dialog-hide class="dialog-close" aria-label="Close command bar">
						<svg role="img" class="icon" aria-hidden="true">
							<use href="#x"/>
						</svg>
					</button>
				</header>
				<div id="commands" tabindex="-1"></div>
				<footer class="command-bar-footer">
					<span class="desktop"><kbd>Ctrl+K</kbd> or <kbd>Cmd+K</kbd> to launch</span>
					<span class="desktop"><kbd>Tab</kbd> <kbd>Shift+Tab</kbd> to navigate</span>
					<span class="desktop"><kbd>Esc</kbd> or click outside to close</span>
					<span class="mobile">Tap outside to close</span>
				</footer>
      </div>
    </div>
		`
	}
}

customElements.define(CommandBar.tagName, CommandBar)
