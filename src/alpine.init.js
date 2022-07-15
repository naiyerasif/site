document.addEventListener('alpine:init', () => {
	Alpine.data('themeSwitcher', () => ({
		themes: ['light', 'dark'],
		currentTheme: window.__theme || 'dark',
		switchTheme() {
			const currentIndex = this.themes.indexOf(this.currentTheme)
			const nextIndex = (currentIndex + 1) % this.themes.length
			window.__setPreferredTheme(this.themes[nextIndex])
			this.currentTheme = this.themes[nextIndex]
		},
		label() {
			return this.currentTheme.charAt(0).toUpperCase() + this.currentTheme.slice(1) + ' theme'
		}
	}))

	Alpine.data('textSizeSwitcher', () => ({
		textSizes: ['regular', 'medium', 'large'],
		currentTextSize: window.__textSize || 'regular',
		switchTextSize() {
			const currentIndex = this.textSizes.indexOf(this.currentTextSize)
			const nextIndex = (currentIndex + 1) % this.textSizes.length
			window.__setPreferredTextSize(this.textSizes[nextIndex])
			this.currentTextSize = this.textSizes[nextIndex]
		},
		label() {
			return this.currentTextSize.charAt(0).toUpperCase() + this.currentTextSize.slice(1) + ' text size'
		}
	}))

	Alpine.data('search', () => ({
		open: false,
		searchIndex: [],
		searchResults: [],
		query: '',
		recentlySearched: [],
		searchOptions: {
			shouldSort: true,
			includeMatches: true,
			tokenize: true,
			matchAllTokens: true,
			threshold: 0.3,
			location: 0,
			distance: 600,
			maxPatternLength: 32,
			minMatchCharLength: 3,
			keys: ['title', 'tags']
		},
		launch(focusAfter) {
			this.open = true
			focusAfter && this.$nextTick(() => focusAfter.focus())
		},
		close(focusAfter) {
			this.open = false
			focusAfter && focusAfter.focus()
		},
		search() {
			if (this.query) {
				const fuse = new Fuse(this.searchIndex, this.searchOptions)
				this.searchResults = fuse.search(this.query)

				if (this.searchResults && this.searchResults.length) {
					this.updateRecentlySearched(this.searchResults)
				}
			}
		},
		unique(array) {
			return array.filter((e, i) => array.findIndex((a) => a.item.title === e.item.title) === i)
		},
		updateRecentlySearched(searchResults) {
			try {
				if (this.recentlySearched && this.recentlySearched.length > 1) {
					this.recentlySearched = this.unique([...searchResults, ...this.recentlySearched]).slice(0, 5)
				} else {
					this.recentlySearched = this.unique(searchResults).slice(0, 5)
				}
				
				localStorage.setItem('search-items', JSON.stringify(this.recentlySearched))
			} catch (err) {}
		},
		getRecentlySearched() {
			try {
				const storedSearchItems = localStorage.getItem('search-items')
				
				if (storedSearchItems && storedSearchItems.length) {
					this.recentlySearched = JSON.parse(storedSearchItems).slice(0, 5)
				}
			} catch (err) {}
		},
		async init() {
			this.searchIndex = await (await fetch('/search-index.json')).json()
			this.getRecentlySearched()
		}
	}))

	Alpine.data('tag', (query) => ({
		open: false,
		searchIndex: [],
		searchResults: [],
		searchOptions: {
			shouldSort: true,
			includeMatches: true,
			tokenize: true,
			matchAllTokens: true,
			threshold: 0.3,
			location: 0,
			distance: 600,
			maxPatternLength: 32,
			minMatchCharLength: 3,
			keys: ['title', 'tags']
		},
		launch() {
			this.open = true
		},
		close(focusAfter) {
			this.open = false
			focusAfter && focusAfter.focus()
		},
		search() {
			if (query) {
				const fuse = new Fuse(this.searchIndex, this.searchOptions)
				this.searchResults = fuse.search(query)
			}
		},
		async init() {
			this.searchIndex = await (await fetch('/search-index.json')).json()
			this.search()
		}
	}))
})
